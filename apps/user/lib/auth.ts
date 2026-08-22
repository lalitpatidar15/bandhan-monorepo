'use client';

import { useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAppSelector } from '@/hooks/useAppSelector';



/**
 * Returns a `gate` function. When called, if the user is not logged in it
 * redirects to /login?next=<current path> and returns false. Otherwise it
 * runs the provided callback and returns true.
 *
 * Browsing is always allowed; only actions (wishlist, cart, review, enquiry,
 * quote, checkout, bookings, community) require login per the product spec.
 */
export function useRequireAuth() {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAppSelector((state) => state.auth.user);
  const token = useAppSelector((state) => state.auth.token);

  // A valid bearer token is sufficient for API access. User information is
  // restored asynchronously after an SSO handoff, so do not bounce a signed-in
  // customer back to login while that profile cache is being rebuilt.
  const isAuthed = Boolean(token);

  const gate = useCallback(
    (action?: () => void) => {
      if (!isAuthed) {
        const next = encodeURIComponent(pathname || '/');
        router.push(`/login?next=${next}`);
        return false;
      }
      action?.();
      return true;
    },
    [isAuthed, pathname, router],
  );

  return { isAuthed, gate };
}
