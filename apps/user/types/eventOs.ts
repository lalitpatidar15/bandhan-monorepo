// Types for the Event Planning OS resources. All records are returned by the
// live API; nothing here is seeded or mocked in the UI.

export interface ApiListResponse<T> {
  success?: boolean;
  data?: T[];
  message?: string;
}

export interface ApiItemResponse<T> {
  success?: boolean;
  data?: T;
  message?: string;
}

export type RsvpStatus = "invited" | "attending" | "declined" | "maybe";

export interface EventGuest {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  plusOne?: boolean;
  mealPreference?: string;
  rsvpStatus?: RsvpStatus;
  invitationToken?: string;
  checkedInAt?: string;
  tableId?: string;
  notes?: string;
}

export interface GuestInput {
  name: string;
  email?: string;
  phone?: string;
  plusOne?: boolean;
  mealPreference?: string;
  notes?: string;
}

export interface EventTable {
  _id: string;
  name: string;
  capacity?: number;
  notes?: string;
  guests?: string[];
}

export interface Collaborator {
  _id: string;
  email: string;
  role?: "editor" | "viewer" | "vendor";
  permissions?: string[];
  status?: "invited" | "accepted" | "declined";
  userId?: string;
  token?: string;
}

export interface InvitationLink {
  guestId: string;
  guestName: string;
  url: string;
}

export interface InvitationRecord {
  _id?: string;
  id?: string;
  guestId?: string;
  guestName?: string;
  token?: string;
  url?: string;
  status?: string;
  createdAt?: string;
}

export interface WebsiteScheduleItem {
  time?: string;
  title?: string;
  description?: string;
}

export interface EventWebsite {
  _id?: string;
  eventId?: string;
  title: string;
  slug?: string;
  theme?: string;
  coverImage?: string;
  story?: string;
  venueDetails?: string;
  schedule?: WebsiteScheduleItem[];
  rsvpEnabled?: boolean;
  published?: boolean;
}

export interface EventIssue {
  _id: string;
  type?: string;
  title: string;
  description?: string;
  assignedTo?: string;
  status?: string;
}

export interface EventDaySummary {
  issues?: EventIssue[];
  vendors?: Array<{ _id?: string; id?: string; name?: string; category?: string; status?: string }>;
  venueBookings?: Array<{ _id?: string; id?: string; name?: string; status?: string }>;
  guests?: { invited?: number; attending?: number; checkedIn?: number };
  tasks?: Array<{ _id?: string; id?: string; title?: string; status?: string; priority?: string }>;
}

export interface EventMemory {
  _id: string;
  title: string;
  description?: string;
  images?: string[];
  memoryDate?: string;
  createdAt?: string;
}

export interface Milestone {
  _id: string;
  vendorId?: string;
  vendorName?: string;
  title: string;
  amount?: number;
  status?: string;
  dueDate?: string;
  paymentRef?: string;
  proofUrl?: string;
}

export interface RsvpDetails {
  event?: { title?: string; date?: string; location?: string; name?: string };
  guest?: { _id?: string; name?: string; rsvpStatus?: RsvpStatus; plusOne?: boolean; mealPreference?: string };
  eventTitle?: string;
  title?: string;
  date?: string;
  location?: string;
  guestName?: string;
  name?: string;
  rsvpStatus?: RsvpStatus;
  plusOne?: boolean;
  mealPreference?: string;
}

export interface RsvpSubmission {
  status: "attending" | "declined" | "maybe";
  plusOne?: boolean;
  mealPreference?: string;
}

export interface VendorPackage {
  _id?: string;
  id?: string;
  name?: string;
  title?: string;
  description?: string;
  price?: number;
  billingCycle?: string;
  inclusions?: string[];
  isActive?: boolean;
}
