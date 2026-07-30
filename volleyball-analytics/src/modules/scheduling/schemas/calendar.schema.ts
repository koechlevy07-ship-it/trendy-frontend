import { Schema, model, models, Types, HydratedDocument, Document } from 'mongoose';

export enum CalendarStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ACTIVE = 'active',
  ARCHIVED = 'archived'
}

export interface ICalendarEvent {
  eventId: string;
  title: string;
  description?: string;
  eventType: 'match' | 'training' | 'meeting' | 'maintenance' | 'ceremony' | 'other';
  startAt: Date;
  endAt: Date;
  venueId: Types.ObjectId;
  courtId?: Types.ObjectId;
  matchId?: Types.ObjectId;
  tournamentId?: Types.ObjectId;
  color?: string;
  isAllDay: boolean;
  recurrence?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number;
    endDate?: Date;
    exceptions: Date[];
  };
  visibility: 'public' | 'private' | 'team' | 'officials';
  reminders: {
    minutesBefore: number;
    method: 'email' | 'push' | 'sms' | 'in_app';
  }[];
  metadata: Record<string, any>;
}

export interface ICalendar extends Document {
  calendarId: string;
  name: string;
  description?: string;
  ownerId: Types.ObjectId;
  organizationId: Types.ObjectId;
  season: string;
  status: CalendarStatus;
  events: ICalendarEvent[];
  timeZone: string;
  startDate: Date;
  endDate: Date;
  isPublic: boolean;
  subscribers: Types.ObjectId[];
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  version: number;
}

export type CalendarDocument = HydratedDocument<ICalendar>;

const CalendarEventSchema = new Schema(
  {
    eventId: { type: String, required: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, trim: true, maxlength: 5000 },
    eventType: { type: String, enum: ['match', 'training', 'meeting', 'maintenance', 'ceremony', 'other'], required: true },
    startAt: { type: Date, required: true },
    endAt: { type: Date, required: true },
    venueId: { type: Schema.Types.ObjectId, required: true, ref: 'Venue' },
    courtId: { type: Schema.Types.ObjectId, ref: 'Court' },
    matchId: { type: Schema.Types.ObjectId, ref: 'Match' },
    tournamentId: { type: Schema.Types.ObjectId, ref: 'Tournament' },
    color: { type: String, match: /^#[0-9A-Fa-f]{6}$/ },
    isAllDay: { type: Boolean, default: false },
    recurrence: {
      frequency: { type: String, enum: ['daily', 'weekly', 'monthly', 'yearly'] },
      interval: { type: Number, min: 1 },
      endDate: { type: Date },
      exceptions: [{ type: Date }]
    },
    visibility: { type: String, enum: ['public', 'private', 'team', 'officials'], default: 'public' },
    reminders: [{
      minutesBefore: { type: Number, required: true, min: 0 },
      method: { type: String, enum: ['email', 'push', 'sms', 'in_app'], required: true }
    }],
    metadata: { type: Schema.Types.Mixed, default: {} }
  }, { _id: false });

const CalendarSchema = new Schema(
  {
    calendarId: { type: String, required: true, unique: true, trim: true, maxlength: 50 },
    name: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, trim: true, maxlength: 5000 },
    ownerId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    organizationId: { type: Schema.Types.ObjectId, required: true, ref: 'Organization' },
    season: { type: String, required: true, trim: true, maxlength: 50 },
    status: { type: String, enum: Object.values(CalendarStatus), default: CalendarStatus.DRAFT },
    events: [CalendarEventSchema],
    timeZone: { type: String, required: true, default: 'UTC' },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isPublic: { type: Boolean, default: false },
    subscribers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    metadata: { type: Schema.Types.Mixed, default: {} },
    version: { type: Number, default: 1 }
  },
  {
    timestamps: true,
    collection: 'calendars',
    versionKey: 'version'
  }
);

CalendarSchema.index({ organizationId: 1, status: 1 });
CalendarSchema.index({ ownerId: 1 });
CalendarSchema.index({ calendarId: 1 }, { unique: true });
CalendarSchema.index({ 'events.startAt': 1, 'events.endAt': 1 });

CalendarSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  this.version = (this.version || 0) + 1;
  next();
});

export const Calendar = models.Calendar || model('Calendar', CalendarSchema);