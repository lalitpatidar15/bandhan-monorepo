export type BadgeColor = 'active' | 'inactive' | 'pending' | 'info' | 'warning' | 'danger';

const BADGE_CLASS: Record<BadgeColor, string> = {
  active: 'admin-badge-active',
  inactive: 'admin-badge-inactive',
  pending: 'admin-badge-pending',
  info: 'bg-[var(--bhn-brand-50)] text-[var(--bhn-brand-700)]',
  warning: 'bg-[var(--bhn-warning-50)] text-[var(--bhn-warning-700)]',
  danger: 'bg-[var(--bhn-error-50)] text-[var(--bhn-error-700)]',
};

export function statusBadgeClass(status: string): string {
  const value = String(status || '').toLowerCase();
  if (['active', 'completed', 'resolved', 'published', 'verified', 'confirmed', 'closed', 'in_progress'].includes(value)) {
    return BADGE_CLASS.active;
  }
  if (['inactive', 'rejected', 'cancelled', 'draft', 'incomplete', 'unverified'].includes(value)) {
    return BADGE_CLASS.inactive;
  }
  if (['pending', 'open', 'in_review', 'waiting_user', 'draft'].includes(value)) {
    return BADGE_CLASS.pending;
  }
  return BADGE_CLASS.pending;
}

export function priorityBadgeClass(priority: string): string {
  const value = String(priority || '').toLowerCase();
  if (['urgent', 'high', 'critical'].includes(value)) return BADGE_CLASS.danger;
  if (value === 'medium') return BADGE_CLASS.warning;
  if (['low'].includes(value)) return BADGE_CLASS.info;
  return BADGE_CLASS.pending;
}

export function Badge({ color, children }: { color: BadgeColor; children: React.ReactNode }) {
  return <span className={`admin-badge ${BADGE_CLASS[color]}`}>{children}</span>;
}
