/** Mock "My bookings" — ported from BookingsScreen/BookingDetailScreen in screens2-3.jsx. */
export type BookingStatus = 'confirmed' | 'pending';

export interface CustomerBooking {
  id: string;
  plannerId: string;
  requestId: string;
  packageName: string;
  price: number;
  status: BookingStatus;
}

export const MY_BOOKINGS: CustomerBooking[] = [
  { id: 'b1', plannerId: 'lumiere', requestId: 'r1', packageName: 'Signature Wedding', price: 18000, status: 'confirmed' },
  { id: 'b2', plannerId: 'orbit', requestId: 'r2', packageName: 'Annual Celebration', price: 25000, status: 'pending' },
];
