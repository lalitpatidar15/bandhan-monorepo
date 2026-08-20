'use client';

import { useState, type ReactNode } from 'react';
import { ChevronDown, LogOut, Menu, X } from 'lucide-react';

export interface PortalSidebarNavItem {
  label: string;
  href?: string;
  icon?: ReactNode;
  badge?: number;
  children?: { label: string; href: string }[];
}

export interface PortalSidebarSection {
  title?: string;
  items: PortalSidebarNavItem[];
}

export interface PortalSidebarProfile {
  name: string;
  email?: string;
  avatar?: string;
  verified?: boolean;
}

export interface PortalSidebarProps {
  /** Portal name shown under logo */
  portalName?: string;
  /** Logo element or text */
  logo?: ReactNode;
  /** Grouped nav sections */
  sections: PortalSidebarSection[];
  /** Currently active item label or href */
  activeItem?: string;
  /** Called when a nav item is clicked. If provided, uses button instead of <a> (for SPA nav) */
  onNavigate?: (href: string) => void;
  /** User profile at bottom */
  profile?: PortalSidebarProfile;
  /** Logout button */
  onLogout?: () => void;
  /** Additional actions (e.g. "Add Product" button) */
  actions?: ReactNode;
  /** Portal switcher links at bottom */
  portalLinks?: { label: string; href: string; external?: boolean; icon?: ReactNode }[];
  /** Help link */
  helpLink?: { label: string; href: string };
  /** Additional CSS classes */
  className?: string;
}

export function PortalSidebar({
  portalName,
  logo,
  sections,
  activeItem,
  onNavigate,
  profile,
  onLogout,
  actions,
  portalLinks,
  helpLink,
  className,
}: PortalSidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const isActive = (item: PortalSidebarNavItem) => {
    if (!activeItem) return false;
    const active = activeItem.toLowerCase();
    if (item.href) {
      const href = item.href.toLowerCase();
      return active === href || active.startsWith(href + '/');
    }
    return active === item.label.toLowerCase();
  };

  const handleNavClick = (href: string) => {
    if (onNavigate) {
      onNavigate(href);
    }
    setMobileOpen(false);
  };

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5">
        {logo || (
          <span className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white" style={{ background: 'var(--bhn-brand-600)' }}>
            B
          </span>
        )}
        {portalName && (
          <span className="hidden text-sm font-semibold text-[var(--bhn-text)] md:block">{portalName}</span>
        )}
      </div>

      {/* Actions */}
      {actions && (
        <div className="px-4 pb-3">{actions}</div>
      )}

      {/* Nav sections */}
      <nav className="flex-1 overflow-y-auto px-3 py-2">
        {sections.map((section, si) => (
          <div key={si} className="mb-3">
            {section.title && (
              <p className="mb-1.5 px-2 text-[10px] font-bold uppercase tracking-wider text-[var(--bhn-text-soft)]">
                {section.title}
              </p>
            )}
            {section.items.map((item) => {
              const active = isActive(item);
              const hasChildren = item.children && item.children.length > 0;
              const expanded = expandedSections[item.label] ?? active;

              if (hasChildren) {
                return (
                  <div key={item.label}>
                    <button
                      type="button"
                      onClick={() => toggleSection(item.label)}
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                        active ? 'bg-[var(--bhn-brand-50)] text-[var(--bhn-brand-700)]' : 'text-[var(--bhn-text-muted)] hover:bg-[var(--bhn-surface)]'
                      }`}
                    >
                      {item.icon && <span className="shrink-0">{item.icon}</span>}
                      <span className="flex-1 text-left">{item.label}</span>
                      {item.badge != null && item.badge > 0 && (
                        <span className="ml-auto mr-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[var(--bhn-brand-600)] px-1.5 text-[10px] font-bold text-white">
                          {item.badge > 99 ? '99+' : item.badge}
                        </span>
                      )}
                      <ChevronDown size={14} className={`shrink-0 transition-transform ${expanded ? 'rotate-180' : ''}`} />
                    </button>
                    {expanded && (
                      <div className="ml-4 mt-0.5 border-l-2 border-[var(--bhn-border)] pl-2">
                        {item.children!.map((child) => {
                          const childActive = activeItem?.toLowerCase() === child.href.toLowerCase();
                          return (
                            <a
                              key={child.href}
                              href={onNavigate ? undefined : child.href}
                              onClick={onNavigate ? () => handleNavClick(child.href) : undefined}
                              className={`block rounded-lg px-3 py-2 text-sm transition ${
                                childActive
                                  ? 'font-medium text-[var(--bhn-brand-700)] bg-[var(--bhn-brand-50)]'
                                  : 'text-[var(--bhn-text-muted)] hover:bg-[var(--bhn-surface)]'
                              }`}
                            >
                              {child.label}
                            </a>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <a
                  key={item.label}
                  href={onNavigate ? undefined : item.href}
                  onClick={onNavigate && item.href ? () => handleNavClick(item.href!) : undefined}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                    active
                      ? 'bg-[var(--bhn-brand-50)] text-[var(--bhn-brand-700)]'
                      : 'text-[var(--bhn-text-muted)] hover:bg-[var(--bhn-surface)]'
                  }`}
                >
                  {item.icon && <span className="shrink-0">{item.icon}</span>}
                  <span className="flex-1">{item.label}</span>
                  {item.badge != null && item.badge > 0 && (
                    <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[var(--bhn-brand-600)] px-1.5 text-[10px] font-bold text-white">
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </a>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Portal links */}
      {portalLinks && portalLinks.length > 0 && (
        <div className="border-t px-3 py-3" style={{ borderColor: 'var(--bhn-border)' }}>
          <p className="mb-1.5 px-2 text-[10px] font-bold uppercase tracking-wider text-[var(--bhn-text-soft)]">Portals</p>
          {portalLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target={link.external ? '_blank' : undefined}
              rel={link.external ? 'noopener noreferrer' : undefined}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-[var(--bhn-text-muted)] transition hover:bg-[var(--bhn-surface)]"
            >
              {link.icon}
              {link.label}
            </a>
          ))}
        </div>
      )}

      {/* Profile & logout */}
      {(profile || onLogout) && (
        <div className="border-t px-3 py-3" style={{ borderColor: 'var(--bhn-border)' }}>
          {profile && (
            <div className="flex items-center gap-3 px-2 py-2">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--bhn-brand-100)] text-sm font-semibold text-[var(--bhn-brand-700)]">
                {profile.avatar ? (
                  <img src={profile.avatar} alt={profile.name} className="h-9 w-9 rounded-full object-cover" />
                ) : (
                  profile.name.charAt(0).toUpperCase()
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-[var(--bhn-text)]">{profile.name}</p>
                {profile.email && <p className="truncate text-[11px] text-[var(--bhn-text-muted)]">{profile.email}</p>}
              </div>
              {profile.verified && (
                <span className="shrink-0 text-[var(--bhn-info-600)]">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0Zm3.5 5.3a.75.75 0 0 0-1.06-1.06L6.75 7.94 5.56 6.75a.75.75 0 1 0-1.06 1.06l1.75 1.75a.75.75 0 0 0 1.06 0l4.25-4.25Z"/></svg>
                </span>
              )}
            </div>
          )}
          {helpLink && (
            <a
              href={helpLink.href}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-[var(--bhn-text-muted)] transition hover:bg-[var(--bhn-surface)]"
            >
              {helpLink.label}
            </a>
          )}
          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
            >
              <LogOut size={16} /> Logout
            </button>
          )}
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-3 z-50 flex h-10 w-10 items-center justify-center rounded-full border bg-white shadow-md lg:hidden"
        style={{ borderColor: 'var(--bhn-border)', color: 'var(--bhn-brand-600)' }}
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div
            className="absolute left-0 top-0 h-full w-72 overflow-y-auto shadow-xl"
            style={{ background: 'var(--bhn-surface-2)' }}
          >
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-[var(--bhn-surface)]"
              style={{ color: 'var(--bhn-text-muted)' }}
            >
              <X size={18} />
            </button>
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside
        className={`hidden h-dvh w-64 shrink-0 overflow-y-auto border-r lg:block ${className || ''}`}
        style={{ background: 'var(--bhn-surface-2)', borderColor: 'var(--bhn-border)' }}
      >
        {sidebarContent}
      </aside>
    </>
  );
}