import { redirect } from 'next/navigation';

export default function VenuesRedirect() {
  redirect('/listings/venue');
  return null;
}
