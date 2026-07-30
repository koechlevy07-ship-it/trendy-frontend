import { Injectable, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Calendar, CalendarDocument } from '../schemas/calendar.schema';
import { CalendarStatus } from '../schemas/calendar.schema';
import { CalendarEventSchema } from '../schemas/calendar.schema';

@Injectable()
export class CalendarRepository {
  constructor(
    @InjectModel('Calendar') private readonly calendarModel: Model<any>,
  ) {}

  async create(data: Partial<any>): Promise<any> {
    const calendar = new this.calendarModel({
      ...data,
      ownerId: new Types.ObjectId(data.ownerId),
      organizationId: new Types.ObjectId(data.organizationId),
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      events: data.events?.map(event => ({
        ...event,
        startAt: new Date(event.startAt),
        endAt: new Date(event.endAt),
        location: event.location ? {
          ...event.location,
          venueId: event.location.venueId ? new Types.ObjectId(event.location.venueId) : undefined,
          courtId: event.location.courtId ? new Types.ObjectId(event.location.courtId) : undefined,
        } : undefined,
        participants: event.participants?.map(p => ({
          ...p,
          teamId: p.teamId ? new Types.ObjectId(p.teamId) : undefined,
          userId: p.userId ? new Types.ObjectId(p.userId) : undefined,
          responseAt: p.responseAt ? new Date(p.responseAt) : undefined,
        }) || [],
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
        metadata: event.metadata || {},
      }) || [],
      timeZone: data.timeZone,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      isPublic: data.isPublic ?? false,
      subscribers: data.subscribers?.map(id => new Types.ObjectId(id)) || [],
      metadata: data.metadata || {},
      createdBy: new Types.ObjectId(data.createdBy),
    }) as any;

    return calendar.save();
  }

  async findById(id: string): Promise<any> {
    return this.calendarModel.findById(id).populate('ownerId').populate('organizationId').exec();
  }

  async findByCalendarId(calendarId: string): Promise<any> {
    return this.calendarModel.findOne({ calendarId }).exec();
  }

  async findByOwner(ownerId: string, pagination?: { page: number; limit: number }): Promise<any[]> {
    const query = this.calendarModel.find({ ownerId: new Types.ObjectId(ownerId) }).sort({ createdAt: -1 });
    if (pagination) {
      query.skip((pagination.page - 1) * pagination.limit).limit(pagination.limit);
    }
    return query.exec();
  }

  async findByOrganization(organizationId: string, pagination?: { page: number; limit: number }): Promise<any[]> {
    const query = this.calendarModel.find({ organizationId: new Types.ObjectId(organizationId) }).sort({ createdAt: -1 });
    if (pagination) {
      query.skip((pagination.page - 1) * pagination.limit).limit(pagination.limit);
    }
    return query.exec();
  }

  async findByType(type: string, pagination?: { page: number; limit: number }): Promise<any[]> {
    const query = this.calendarModel.find({ type: type }).sort({ createdAt: -1 });
    if (pagination) {
      query.skip((pagination.page - 1) * pagination.limit).limit(pagination.limit);
    }
    return query.exec();
  }

  async findByStatus(status: string, pagination?: { page: number; limit: number }): Promise<any[]> {
    const query = this.calendarModel.find({ status }).sort({ createdAt: -1 });
    if (pagination) {
      query.skip((pagination.page - 1) * pagination.limit).limit(pagination.limit);
    }
    return query.exec();
  }

  async findByDateRange(startDate: Date, endDate: Date, organizationId?: string): Promise<any[]> {
    const query: any = {
      $or: [
        { startDate: { $gte: startDate, $lte: endDate } },
        { endDate: { $gte: startDate, $lte: endDate } },
        { startDate: { $lte: startDate }, endDate: { $gte: endDate } },
      ],
    };

    if (organizationId) {
      query.organizationId = new Types.ObjectId(organizationId);
    }

    return this.calendarModel.find(query).sort({ startDate: 1 }).exec();
  }

  async findPublicCalendars(pagination?: { page: number; limit: number }): Promise<any[]> {
    const query = this.calendarModel.find({ isPublic: true, status: 'published' }).sort({ startDate: 1 });
    if (pagination) {
      query.skip((pagination.page - 1) * pagination.limit).limit(pagination.limit);
    }
    return query.exec();
  }

  async findBySubscriber(userId: string, pagination?: { page: number; limit: number }): Promise<any[]> {
    const query = this.calendarModel.find({ subscribers: new Types.ObjectId(userId) }).sort({ startDate: 1 });
    if (pagination) {
      query.skip((pagination.page - 1) * pagination.limit).limit(pagination.limit);
    }
    return query.exec();
  }

  async findByCalendarIdAndDateRange(calendarId: string, startDate: Date, endDate: Date): Promise<any> {
    return this.calendarModel.aggregate([
      { $match: { _id: new Types.ObjectId(calendarId) } },
      { $unwind: '$events' },
      {
        $match: {
          'events.startAt': { $gte: startDate },
          'events.endAt': { $lte: endDate },
        },
      },
      { $group: { _id: '$_id', calendarId: { $first: '$calendarId' }, events: { $push: '$events' } } },
    ).exec();
  }

  async findEventsByDateRange(startDate: Date, endDate: Date, organizationId?: string): Promise<any[]> {
    const match: any = {
      'events.startAt': { $gte: startDate },
      'events.endAt': { $lte: endDate },
    };

    if (organizationId) {
      match.organizationId = new Types.ObjectId(organizationId);
    }

    return this.calendarModel.aggregate([
      { $match },
      { $unwind: '$events' },
      { $match: { 'events.startAt': { $gte: startDate, $lte: endDate } } },
      {
        $project: {
          calendarId: 1,
          calendarName: '$name',
          event: '$events',
        },
      },
      { $sort: { 'events.startAt': 1 } },
    ).exec();
  }

  async findByTeam(teamId: string): Promise<any[]> {
    return this.calendarModel.find({
      'events.participants.teamId': new Types.ObjectId(teamId)
    }).exec();
  }

  async findByUser(userId: string): Promise<any[]> {
    return this.calendarModel.find({
      'events.participants.userId': new Types.ObjectId(userId)
    }).exec();
  }

  async findByVenue(venueId: string, startDate?: Date, endDate?: Date): Promise<any[]> {
    const query: any = { 'events.location.venueId': new Types.ObjectId(venueId) };
    if (startDate || endDate) {
      query.$or = [
        { 'events.startAt': { $gte: startDate || new Date(0) } },
        { 'events.endAt': { $lte: endDate || new Date() } },
      ];
    }
    return this.calendarModel.find(query).exec();
  }

  async findByCourt(courtId: string, startDate?: Date, endDate?: Date): Promise<any[]> {
    const query: any = { 'events.location.courtId': new Types.ObjectId(courtId) };
    if (startDate || endDate) {
      query.$or = [
        { 'events.startAt': { $gte: startDate || new Date(0) } },
        { 'events.endAt': { $lte: endDate || new Date() } },
      ];
    }
    return this.calendarModel.find(query).exec();
  }

  async findByStatus(status: CalendarStatus, pagination?: { page: number; limit: number }): Promise<any[]> {
    const query = this.calendarModel.find({ status }).sort({ createdAt: -1 });
    if (pagination) {
      query.skip((pagination.page - 1) * pagination.limit).limit(pagination.limit);
    }
    return query.exec();
  }

  async findByType(type: string, pagination?: { page: number; limit: number }): Promise<any[]> {
    const query = this.calendarModel.find({ type }).sort({ createdAt: -1 });
    if (pagination) {
      query.skip((pagination.page - 1) * pagination.limit).limit(pagination.limit);
    }
    return query.exec();
  }

  async addEvent(calendarId: string, event: any): Promise<any> {
    const calendar = await this.calendarModel.findById(calendarId);
    if (!calendar) return null;

    const newEvent = {
      ...event,
      eventId: event.eventId || new Types.ObjectId().toString(),
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
      }) || [],
      status: event.status || 'scheduled',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    calendar.events.push(newEvent);
    return calendar.save();
  }

  async removeEvent(calendarId: string, eventId: string): Promise<any> {
    const calendar = await this.calendarModel.findById(calendarId);
    if (!calendar) return null;

    calendar.events = calendar.events.filter(e => e.eventId !== eventId);
    return calendar.save();
  }

  async updateEvent(calendarId: string, eventId: string, updates: Partial<any>): Promise<any> {
    const calendar = await this.calendarModel.findById(calendarId);
    if (!calendar) return null;

    const eventIndex = calendar.events.findIndex(e => e.eventId === eventId);
    if (eventIndex === -1) return null;

    const updateData: any = { updatedAt: new Date() };
    if (updates.title) updateData['events.$.title'] = updates.title;
    if (updates.description) updateData['events.$.description'] = updates.description;
    if (updates.type) updateData['events.$.type'] = updates.type;
    if (updates.startAt) updateData['events.$.startAt'] = new Date(updates.startAt);
    if (updates.endAt) updateData['events.$.endAt'] = new Date(updates.endAt);
    if (updates.allDay !== undefined) updateData['events.$.allDay'] = updates.allDay;
    if (updates.location) updateData['events.$.location'] = updates.location;
    if (updates.participants) updateData['events.$.participants'] = updates.participants;
    if (updates.relatedEntities) updateData['events.$.relatedEntities'] = updates.relatedEntities;
    if (updates.recurrence) updateData['events.$.recurrence'] = updates.recurrence;
    if (updates.reminders) updateData['events.$.reminders'] = updates.reminders;
    if (updates.status) updateData['events.$.status'] = updates.status;
    if (updates.color) updateData['events.$.color'] = updates.color;
    if (updates.metadata) updateData['events.$.metadata'] = updates.metadata;

    const calendar = await this.calendarModel.findByIdAndUpdate(
      calendarId,
      { $set: updateData },
      { new: true }
    ).exec();

    return calendar.events.find(e => e.eventId === eventId);
  }

  async updateEventStatus(calendarId: string, eventId: string, status: string): Promise<any> {
    return this.calendarModel.findOneAndUpdate(
      { _id: calendarId, 'events.eventId': eventId },
      { $set: { 'events.$.status': status, 'events.$.updatedAt': new Date() } },
      { new: true }
    ).exec();
  }

  async updateStatus(id: string, status: string): Promise<any> {
    return this.calendarModel.findByIdAndUpdate(
      id,
      { status, updatedAt: new Date() },
      { new: true }
    ).exec();
  }

  async archive(id: string): Promise<any> {
    return this.calendarModel.findByIdAndUpdate(id, { status: 'archived', archivedAt: new Date() }, { new: true }).exec();
  }

  async publish(id: string): Promise<any> {
    return this.calendarModel.findByIdAndUpdate(id, { status: 'published', publishedAt: new Date() }, { new: true }).exec();
  }

  async archive(id: string): Promise<any> {
    return this.calendarModel.findByIdAndUpdate(id, { status: 'archived', archivedAt: new Date() }, { new: true }).exec();
  }

  async addSubscriber(id: string, userId: string): Promise<any> {
    return this.calendarModel.findByIdAndUpdate(
      id,
      { $addToSet: { subscribers: new Types.ObjectId(userId) } },
      { new: true }
    ).exec();
  }

  async removeSubscriber(id: string, userId: string): Promise<any> {
    return this.calendarModel.findByIdAndUpdate(
      id,
      { $pull: { subscribers: new Types.ObjectId(userId) } },
      { new: true }
    ).exec();
  }

  async addRelatedDocument(id: string, docId: Types.ObjectId): Promise<any> {
    return this.calendarModel.findByIdAndUpdate(
      id,
      { $addToSet: { relatedDocuments: docId } },
      { new: true }
    ).exec();
  }

  async removeRelatedDocument(id: string, docId: Types.ObjectId): Promise<any> {
    return this.calendarModel.findByIdAndUpdate(
      id,
      { $pull: { relatedDocuments: docId } },
      { new: true }
    ).exec();
  }

  async incrementDownloadCount(id: string, eventId: string): Promise<any> {
    return this.calendarModel.findOneAndUpdate(
      { _id: new Types.ObjectId(id), 'events.eventId': eventId },
      { $inc: { 'events.$.downloadCount': 1 } },
      { new: true }
    ).exec();
  }

  async incrementViewCount(id: string, eventId: string): Promise<any> {
    return this.calendarModel.findOneAndUpdate(
      { _id: new Types.ObjectId(id), 'events.eventId': eventId },
      { $inc: { 'events.$.viewCount': 1 } },
      { new: true }
    ).exec();
  }

  async addReminder(calendarId: string, eventId: string, reminder: any): Promise<any> {
    return this.calendarModel.findOneAndUpdate(
      { _id: new Types.ObjectId(calendarId), 'events.eventId': eventId },
      { $push: { 'events.$.reminders': { ...reminder, sent: false } } },
      { new: true }
    ).exec();
  }

  async markReminderSent(calendarId: string, eventId: string, reminderIndex: number): Promise<any> {
    return this.calendarModel.findOneAndUpdate(
      { _id: new Types.ObjectId(calendarId), 'events.eventId': eventId },
      { $set: { [`events.$.reminders.${reminderIndex}.sent`]: true } },
      { new: true }
    ).exec();
  }

  async getCalendarStats(organizationId?: string): Promise<any> {
    const match: any = {};
    if (organizationId) {
      match.organizationId = new Types.ObjectId(organizationId);
    }

    const [
      total,
      byStatus,
      byType,
      publicCount,
      totalEvents,
      upcomingEvents,
    ] = await Promise.all([
      this.calendarModel.countDocuments({ ...(organizationId ? { organizationId: new Types.ObjectId(organizationId) } : {}) }),
      this.calendarModel.aggregate([
        { $match: organizationId ? { organizationId: new Types.ObjectId(organizationId) } : {} },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      this.calendarModel.aggregate([
        { $match: organizationId ? { organizationId: new Types.ObjectId(organizationId) } : {} },
        { $group: { _id: '$type', count: { $sum: 1 } } }
      ]),
      this.calendarModel.countDocuments({ isPublic: true, ...(organizationId ? { organizationId: new Types.ObjectId(organizationId) } : {}) }),
      this.calendarModel.aggregate([
        { $match: organizationId ? { organizationId: new Types.ObjectId(organizationId) } : {} },
        { $unwind: '$events' },
        { $group: { _id: null, total: { $sum: 1 } } },
      ]),
      this.calendarModel.aggregate([
        { $match: organizationId ? { organizationId: new Types.ObjectId(organizationId) } : {} },
        { $unwind: '$events' },
        { $match: { 'events.startAt': { $gte: new Date() } } },
        { $group: { _id: null, count: { $sum: 1 } } },
      ]),
    ]);

    return {
      total,
      byStatus: byStatus.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {}),
      byType: byType.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {}),
      publicCount,
      totalEvents: totalEvents[0]?.total || 0,
      upcomingEvents: upcomingEvents[0]?.count || 0,
    };
  }
}