export interface Vendor {
  id: string;
  name: string;
  category: string;
  price: string;
  img: string;
  rating: number;
  location?: string;
  description?: string;
  email?: string;
  phone?: string;
  images?: string[];
}
