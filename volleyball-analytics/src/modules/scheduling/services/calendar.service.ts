import { Injectable, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Calendar, CalendarDocument } from '../schemas/calendar.schema';
import { CalendarRepository } from '../repositories/calendar.repository';
import { BusinessValidator } from '../validators/business.validator';
import { EventPublisher } from '../../shared/events/event.publisher';

@Injectable()
export class CalendarService {
  constructor(
    @InjectModel('Calendar') private readonly calendarModel: Model<any>,
    private readonly calendarRepository: CalendarRepository,
    private readonly businessValidator: BusinessValidator,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async create(createCalendarDto: any): Promise<any> {
    await this.businessValidator.validateCalendarUniqueness(
      createCalendarDto.calendarId,
      createCalendarDto.organizationId,
      createCalendarDto.name
    );

    const calendar = await this.calendarRepository.create(createCalendarDto);

    await this.eventPublisher.publish('calendar.created', {
      calendarId: calendar._id.toString(),
      calendarCode: calendar.calendarId,
      name: calendar.name,
      organizationId: calendar.organizationId.toString(),
    });

    return calendar;
  }

  async findAll(searchDto: any): Promise<any> {
    return this.calendarRepository.findByOrganization(searchDto.organizationId, {
      page: searchDto.page,
      limit: searchDto.limit,
    });
  }

  async findById(id: string): Promise<any> {
    const calendar = await this.calendarRepository.findById(id);
    if (!calendar) {
      throw new NotFoundException('Calendar not found');
    }
    return calendar;
  }

  async findByCalendarId(calendarId: string): Promise<any> {
    const calendar = await this.calendarRepository.findByCalendarId(calendarId);
    if (!calendar) {
      throw new NotFoundException('Calendar not found');
    }
    return calendar;
  }

  async update(id: string, updateCalendarDto: any): Promise<any> {
    const calendar = await this.calendarRepository.findById(id);
    if (!calendar) {
      throw new NotFoundException('Calendar not found');
    }

    if (updateCalendarDto.name && updateCalendarDto.name !== calendar.name) {
      await this.businessValidator.validateCalendarUniqueness(
        calendar.calendarId,
        calendar.organizationId.toString(),
        updateCalendarDto.name,
        id
      );
    }

    const updated = await this.calendarRepository.update(id, updateCalendarDto);

    await this.eventPublisher.publish('calendar.updated', {
      calendarId: updated._id.toString(),
      calendarCode: updated.calendarId,
      changes: updateCalendarDto,
    });

    return updated;
  }

  async updateStatus(id: string, status: string): Promise<any> {
    const calendar = await this.calendarRepository.findById(id);
    if (!calendar) {
      throw new NotFoundException('Calendar not found');
    }

    if (calendar.status === status) {
      throw new BadRequestException(`Calendar is already ${status}`);
    }

    const validTransitions: Record<string, string[]> = {
      draft: ['published', 'archived'],
      published: ['archived'],
      archived: ['draft'],
    };

    if (!validTransitions[calendar.status]?.includes(status)) {
      throw new BadRequestException(`Invalid status transition from ${calendar.status} to ${status}`);
    }

    const updated = await this.calendarRepository.updateStatus(id, status);

    await this.eventPublisher.publish('calendar.status.changed', {
      calendarId: updated._id.toString(),
      calendarCode: updated.calendarId,
      oldStatus: calendar.status,
      newStatus: status,
    });

    return updated;
  }

  async publish(id: string): Promise<any> {
    return this.updateStatus(id, 'published');
  }

  async archive(id: string): Promise<any> {
    return this.updateStatus(id, 'archived');
  }

  async restore(id: string): Promise<any> {
    const calendar = await this.calendarRepository.findById(id);
    if (!calendar) {
      throw new NotFoundException('Calendar not found');
    }

    if (calendar.status !== 'archived') {
      throw new BadRequestException('Calendar is not archived');
    }

    const updated = await this.calendarRepository.updateStatus(id, 'draft');

    await this.eventPublisher.publish('calendar.restored', {
      calendarId: calendar._id.toString(),
      calendarCode: calendar.calendarId,
    });

    return updated;
  }

  async delete(id: string): Promise<void> {
    const calendar = await this.calendarRepository.findById(id);
    if (!calendar) {
      throw new NotFoundException('Calendar not found');
    }

    await this.calendarRepository.delete(id);
  }

  async addEvent(calendarId: string, event: any): Promise<any> {
    const calendar = await this.calendarRepository.findById(calendarId);
    if (!calendar) {
      throw new NotFoundException('Calendar not found');
    }

    if (calendar.status !== 'draft') {
      throw new BadRequestException('Cannot add events to non-draft calendar');
    }

    const eventWithDates = {
      ...event,
      startAt: new Date(event.startAt),
      endAt: new Date(event.endAt),
      relatedEntities: event.relatedEntities ? {
        tournamentId: event.relatedEntities.tournamentId ? new Types.ObjectId(event.relatedEntities.tournamentId) : undefined,
        matchId: event.relatedEntities.matchId ? new Types.ObjectId(event.relatedEntities.matchId) : undefined,
        courtId: event.relatedEntities.courtId ? new Types.ObjectId(event.relatedEntities.courtId) : undefined,
        venueId: event.relatedEntities.venueId ? new Types.ObjectId(event.relatedEntities.venueId) : undefined,
        bracketId: event.relatedEntities.bracketId ? new Types.ObjectId(event.relatedEntities.bracketId) : undefined,
      } : undefined,
      recurrence: event.recurrence ? {
        ...event.recurrence,
        endDate: event.recurrence.endDate ? new Date(event.recurrence.endDate) : undefined,
      } : undefined,
      reminders: event.reminders?.map(r => ({
        ...r,
        triggerAt: new Date(r.triggerAt),
      })) || [],
      status: event.status || 'scheduled',
    };

    const updated = await this.calendarRepository.addEvent(calendarId, eventWithDates);

    await this.eventPublisher.publish('calendar.event.added', {
      calendarId: calendar._id.toString(),
      eventId: event.eventId || 'new',
      eventType: event.type,
    });

    return updated.events[updated.events.length - 1];
  }

  async removeEvent(calendarId: string, eventId: string): Promise<any> {
    const calendar = await this.calendarRepository.findById(calendarId);
    if (!calendar) {
      throw new NotFoundException('Calendar not found');
    }

    if (calendar.status !== 'draft') {
      throw new BadRequestException('Cannot remove events from non-draft calendar');
    }

    const event = calendar.events.find(e => e.eventId === eventId);
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    const updated = await this.calendarRepository.removeEvent(calendarId, eventId);

    await this.eventPublisher.publish('calendar.event.removed', {
      calendarId: calendar._id.toString(),
      eventId,
    });

    return updated;
  }

  async updateEvent(calendarId: string, eventId: string, updates: any): Promise<any> {
    const calendar = await this.calendarRepository.findById(calendarId);
    if (!calendar) {
      throw new NotFoundException('Calendar not found');
    }

    if (calendar.status !== 'draft') {
      throw new BadRequestException('Cannot update events in non-draft calendar');
    }

    const eventUpdates: any = {};
    if (updates.title) eventUpdates['events.$.title'] = updates.title;
    if (updates.description) eventUpdates['events.$.description'] = updates.description;
    if (updates.type) eventUpdates['events.$.type'] = updates.type;
    if (updates.startAt) eventUpdates['events.$.startAt'] = new Date(updates.startAt);
    if (updates.endAt) eventUpdates['events.$.endAt'] = new Date(updates.endAt);
    if (updates.allDay !== undefined) eventUpdates['events.$.allDay'] = updates.allDay;
    if (updates.location) eventUpdates['events.$.location'] = updates.location;
    if (updates.participants) eventUpdates['events.$.participants'] = updates.participants;
    if (updates.relatedEntities) eventUpdates['events.$.relatedEntities'] = updates.relatedEntities;
    if (updates.recurrence) eventUpdates['events.$.recurrence'] = updates.recurrence;
    if (updates.reminders) eventUpdates['events.$.reminders'] = updates.reminders;
    if (updates.status) eventUpdates['events.$.status'] = updates.status;
    if (updates.color) eventUpdates['events.$.color'] = updates.color;
    if (updates.metadata) eventUpdates['events.$.metadata'] = updates.metadata;

    const updated = await this.calendarRepository.updateEvent(calendarId, eventId, eventUpdates);

    await this.eventPublisher.publish('calendar.event.updated', {
      calendarId: calendarId,
      eventId,
      changes: updates,
    });

    return updated;
  }

  async updateEventStatus(calendarId: string, eventId: string, status: string): Promise<any> {
    const calendar = await this.calendarRepository.findById(calendarId);
    if (!calendar) {
      throw new NotFoundException('Calendar not found');
    }

    const event = calendar.events.find(e => e.eventId === eventId);
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    const validTransitions: Record<string, string[]> = {
      scheduled: ['in_progress', 'completed', 'cancelled', 'postponed'],
      in_progress: ['completed', 'cancelled'],
      completed: [],
      cancelled: ['scheduled'],
      postponed: ['scheduled', 'cancelled'],
      rescheduled: ['in_progress', 'completed', 'cancelled'],
    };

    if (!validTransitions[event.status]?.includes(status)) {
      throw new BadRequestException(`Invalid status transition from ${event.status} to ${status}`);
    }

    const updated = await this.calendarRepository.updateEventStatus(calendarId, eventId, status);

    await this.eventPublisher.publish('calendar.event.status.changed', {
      calendarId,
      eventId,
      oldStatus: event.status,
      newStatus: status,
    });

    return updated;
  }

  async addParticipant(calendarId: string, eventId: string, participant: any): Promise<any> {
    return this.calendarRepository.addParticipant(calendarId, eventId, participant);
  }

  async removeParticipant(calendarId: string, eventId: string, userId: string): Promise<any> {
    return this.calendarRepository.removeParticipant(calendarId, eventId, userId);
  }

  async updateParticipantStatus(calendarId: string, eventId: string, userId: string, status: string): Promise<any> {
    return this.calendarRepository.updateParticipantStatus(calendarId, eventId, userId, status);
  }

  async addReminder(calendarId: string, eventId: string, reminder: any): Promise<any> {
    return this.calendarRepository.addReminder(calendarId, eventId, reminder);
  }

  async markReminderSent(calendarId: string, eventId: string, reminderIndex: number): Promise<any> {
    return this.calendarRepository.markReminderSent(calendarId, eventId, reminderIndex);
  }

  async addSubscriber(id: string, userId: string): Promise<any> {
    return this.calendarRepository.addSubscriber(id, userId);
  }

  async removeSubscriber(id: string, userId: string): Promise<any> {
    return this.calendarRepository.removeSubscriber(id, userId);
  }

  async getCalendarStats(organizationId: string): Promise<any> {
    return this.calendarRepository.getCalendarStats(organizationId);
  }
}