import { User } from './user';
import { Vendor } from './vendor';

export interface DashboardData {
  user: User;
  vendors: Vendor[];
}
