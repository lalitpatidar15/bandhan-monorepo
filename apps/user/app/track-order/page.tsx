import { redirect } from 'next/navigation';

export default function TrackOrderRedirect() {
  redirect('/userdashboard/userTracking');
}
