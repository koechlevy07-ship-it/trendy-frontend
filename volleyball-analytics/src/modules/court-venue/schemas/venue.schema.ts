import { Schema, model, models, Types, HydratedDocument } from 'mongoose';

export enum VenueType {
  INDOOR = 'indoor',
  OUTDOOR = 'outdoor',
  BEACH = 'beach',
  MIXED = 'mixed',
  MOBILE = 'mobile',
}

export enum VenueStatus {
  DRAFT = 'draft',
  REGISTERED = 'registered',
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  UNDER_MAINTENANCE = 'under_maintenance',
  ARCHIVED = 'archived',
  DECOMMISSIONED = 'decommissioned',
}

export interface IVenueContact {
  name: string;
  role: string;
  email: string;
  phone: string;
  isPrimary: boolean;
}

export interface IVenueOperatingHours {
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
}

export interface IVenueAddress {
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

export interface IVenue {
  venueName: string;
  venueCode: string;
  organizationId: Types.ObjectId;
  venueType: VenueType;
  status: VenueStatus;
  address: IVenueAddress;
  latitude: number;
  longitude: number;
  capacity: number;
  operatingHours: IVenueOperatingHours[];
  contacts: IVenueContact[];
  certificationRequired: boolean;
  certifications: Types.ObjectId[];
  mediaAssets: { images: string[]; videos: string[]; documents: string[] };
  documents: Types.ObjectId[];
  metadata: Record<string, unknown>;
  suspendedAt?: Date;
  suspendedBy?: Types.ObjectId;
  suspendedReason?: string;
  activatedAt?: Date;
  activatedBy?: Types.ObjectId;
  archivedAt?: Date;
  archivedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export type VenueDocument = HydratedDocument<IVenue>;

const VenueAddressSchema = new Schema<IVenueAddress>(
  { street: { type: String, required: true, trim: true }, city: { type: String, required: true, trim: true }, state: { type: String, required: true, trim: true }, country: { type: String, required: true, trim: true }, postalCode: { type: String, required: true, trim: true } },
  { _id: false }
);

const VenueContactSchema = new Schema<IVenueContact>(
  { name: { type: String, required: true, trim: true }, role: { type: String, required: true, trim: true }, email: { type: String, required: true, trim: true, lowercase: true }, phone: { type: String, required: true, trim: true }, isPrimary: { type: Boolean, default: false } },
  { _id: false }
);

const VenueOperatingHoursSchema = new Schema<IVenueOperatingHours>(
  { dayOfWeek: { type: Number, required: true, min: 0, max: 6 }, openTime: { type: String, required: true, match: /^([01]\d|2[0-3]):([0-5]\d)$/ }, closeTime: { type: String, required: true, match: /^([01]\d|2[0-3]):([0-5]\d)$/ }, isClosed: { type: Boolean, default: false } },
  { _id: false }
);

const VenueSchema = new Schema<IVenue>(
  {
    venueName: { type: String, required: true, trim: true, maxlength: 200 },
    venueCode: { type: String, required: true, trim: true, uppercase: true, maxlength: 50 },
    organizationId: { type: Schema.Types.ObjectId, required: true, ref: 'Organization' },
    venueType: { type: String, enum: Object.values(VenueType), required: true },
    status: { type: String, enum: Object.values(VenueStatus), default: VenueStatus.DRAFT },
    address: { type: VenueAddressSchema, required: true },
    latitude: { type: Number, required: true, min: -90, max: 90 },
    longitude: { type: Number, required: true, min: -180, max: 180 },
    capacity: { type: Number, required: true, min: 0 },
    operatingHours: { type: [VenueOperatingHoursSchema], default: [] },
    contacts: { type: [VenueContactSchema], default: [] },
    certificationRequired: { type: Boolean, default: false },
    certifications: [{ type: Schema.Types.ObjectId, ref: 'Certification' }],
    mediaAssets: { images: [{ type: String }], videos: [{ type: String }], documents: [{ type: String }] },
    documents: [{ type: Schema.Types.ObjectId, ref: 'Document' }],
    metadata: { type: Schema.Types.Mixed, default: {} },
    suspendedAt: { type: Date }, suspendedBy: { type: Schema.Types.ObjectId, ref: 'User' }, suspendedReason: { type: String },
    activatedAt: { type: Date }, activatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    archivedAt: { type: Date }, archivedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true, collection: 'venues' }
);

VenueSchema.index({ venueCode: 1 }, { unique: true });
VenueSchema.index({ organizationId: 1, venueName: 1 }, { unique: true });
VenueSchema.index({ status: 1 });
VenueSchema.index({ venueType: 1 });
VenueSchema.index({ latitude: 1, longitude: 1 });

VenueSchema.pre('save', function (next) {
  if (this.isNew) {
    const primaryContacts = this.contacts.filter((c: IVenueContact) => c.isPrimary);
    if (primaryContacts.length > 1) return next(new Error('Only one primary contact allowed'));
  }
  next();
});

export const Venue = models.Venue || model<IVenue>('Venue', VenueSchema);





