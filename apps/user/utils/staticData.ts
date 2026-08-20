import { DashboardData } from '@/types/dashboard';
import { Vendor } from '@/types/vendor';

export const vendorsStatic: Vendor[] = [
  {
    id: 'vendor-1',
    name: 'Vignette Studios',
    category: 'Photography & Cinematography',
    price: '₹75,000',
    img: '/vendor1.jpg',
    rating: 4.5,
  },
  {
    id: 'vendor-2',
    name: 'Glow by Ananya',
    category: 'Bridal Makeup Artist',
    price: '₹35,000',
    img: '/vendor2.jpg',
    rating: 4,
  },
  {
    id: 'vendor-3',
    name: 'The Spice Route',
    category: 'Fine Dining Catering',
    price: '₹1,200/Plate',
    img: '/vendor3.jpg',
    rating: 5,
  },
];



export const dashboardStatic: DashboardData = {
  user: { id: 'user-1', name: 'Anjali Singh', email: 'anjali.singh@email.com' },
  vendors: vendorsStatic,
};
