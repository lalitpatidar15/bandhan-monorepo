export interface Booking {
  id: string;
  userId: string;
  bookingType?: 'service' | 'venue';
  venueId?: string;
  serviceId?: string;
  eventDate: string;
  guestCount: number;
  eventType: string;
  startTime?: string;
  endTime?: string;
  packageId?: string;
  requirements?: string;
  contactPerson?: string;
  alternateMobile?: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'in_progress';
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
  venueName?: string;
  venueImg?: string;
  serviceName?: string;
  serviceImg?: string;
}

export interface CreateBookingRequest {
  listingType: 'service' | 'venue';
  listingId: string;
  eventDate: string;
  guestCount?: number;
  eventType?: string;
  startTime?: string;
  endTime?: string;
  packageId?: string;
  requirements?: string;
  roomsRequired?: string;
}

export interface UpdateBookingRequest {
  eventDate?: string;
  guestCount?: number;
  eventType?: string;
  status?: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'in_progress';
}

export interface BookingResponse {
  booking: Booking;
  message: string;
}

export interface UserBookingsResponse {
  bookings: Booking[];
  total: number;
}
