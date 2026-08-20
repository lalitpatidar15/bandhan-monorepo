export interface EventBudget {
  total: number;
  spent: number;
  vendorPaid: number;
  pending: number;
  allocated?: Record<string, number>;
  spentByCategory?: Record<string, number>;
}

export interface EventPhase {
  _id?: string;
  id?: string;
  name: string;
  status: string;
  progress: number;
}

export interface EventTask {
  _id?: string;
  id?: string;
  title: string;
  priority: string;
  status: string;
  vendor?: string;
  phase?: string;
}

export interface EventVendorEntry {
  _id?: string;
  id?: string;
  name: string;
  category: string;
  status: string;
}

export interface EventVenueEntry {
  _id?: string;
  id?: string;
  name: string;
  location: string;
  status: string;
}

export interface Event {
  id: string;
  userId?: string;
  title: string;
  description?: string;
  date: string;
  daysToGo?: number;
  location: string;
  guestCount: number;
  eventType: string;
  budget: EventBudget;
  status: 'planning' | 'confirmed' | 'completed' | 'cancelled';
  phases: EventPhase[];
  tasks: EventTask[];
  vendors: EventVendorEntry[];
  venues: EventVenueEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateEventRequest {
  title: string;
  description?: string;
  date: string;
  location: string;
  guestCount: number;
  eventType: string;
  budget: number;
}

export interface UpdateEventRequest {
  title?: string;
  description?: string;
  date?: string;
  location?: string;
  guestCount?: number;
  eventType?: string;
  budget?: Partial<EventBudget> & { allocated?: Record<string, number> };
  status?: 'planning' | 'confirmed' | 'completed' | 'cancelled';
  phases?: EventPhase[];
  tasks?: EventTask[];
  vendors?: EventVendorEntry[];
  venues?: EventVenueEntry[];
  guests?: number;
  daysToGo?: number;
}

export interface EventResponse {
  event: Event;
  message: string;
}

export interface UserEventsResponse {
  events: Event[];
  total: number;
}

export interface SuggestedService {
  _id?: string;
  id?: string;
  title: string;
  category: string;
  price: number;
  image: string;
  rating: number;
  location: string;
  description: string;
  eventType: string;
}

export interface SuggestedVenue {
  _id?: string;
  id?: string;
  name: string;
  location: string;
  rating: number;
  image?: string;
  images?: string[];
  price?: string;
  pricePerDay?: number;
  description: string;
}

export interface SuggestionListResponse<T> {
  success: boolean;
  data: T[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
}

export interface SuggestionParams {
  eventType?: string;
  budget?: number;
  guests?: number;
  location?: string;
  minRating?: number;
}

export type PhaseStatus = 'Not started' | 'In progress' | 'Done';
export type TaskPriority = 'Low' | 'Medium' | 'High';
export type TaskStatus = 'pending' | 'done';

export const EVENT_TYPE_OPTIONS = [
  'Wedding',
  'Engagement',
  'Birthday',
  'Corporate',
  'Anniversary',
  'Other',
] as const;

export const DEFAULT_BUDGET_CATEGORIES = [
  { key: 'Venue & décor', label: 'Venue & décor', defaultPercent: 18 },
  { key: 'Catering', label: 'Catering', defaultPercent: 25 },
  { key: 'Photography & video', label: 'Photography & video', defaultPercent: 18 },
  { key: 'Music & entertainment', label: 'Music & entertainment', defaultPercent: 15 },
  { key: 'Guest amenities', label: 'Guest amenities', defaultPercent: 12 },
  { key: 'Attire & styling', label: 'Attire & styling', defaultPercent: 8 },
  { key: 'Misc', label: 'Misc', defaultPercent: 4 },
];
