import Header from '@/components/ui/Header';
import CartPageClient from '@/components/userDashboard/CartPageClient';

export default function CartPage() {
  return <>
   <Header
  variant="cart"
  showSearch={true}
  showSettings={true}
  showNotifications={true}
 className='sticky'
/>
  <CartPageClient />
  </>
}
