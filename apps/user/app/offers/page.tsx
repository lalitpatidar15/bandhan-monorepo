import { redirect } from 'next/navigation';

export default function OffersRedirect() {
  redirect('/products?offer=1');
}
