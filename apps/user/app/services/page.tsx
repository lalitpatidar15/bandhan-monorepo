import { redirect } from 'next/navigation';

export default function ServicesPage() {
  redirect('/listings/service');
  return null;
}
