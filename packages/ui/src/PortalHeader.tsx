'use client';

import { useState, useEffect, useRef, type ReactNode } from 'react';
import { Menu, X, ChevronDown } from 'lucide-react';

export interface PortalHeaderNav {
  label: string;
  href: string;
}

export interface PortalHeaderAction {
  icon: ReactNode;
  href?: string;
  onClick?: () => void;
  label: string;
  badge?: number;
  showLabel?: boolean;
}

export interface PortalHeaderDropdownItem {
  label?: string;
  href?: string;
  onClick?: () => void;
  icon?: ReactNode;
  external?: boolean;
  divider?: boolean;
  destructive?: boolean;
}

export interface PortalHeaderProps {
  /** Portal name shown below logo, e.g. "Marketplace", "Academy" */
  portalName?: string;
  /** Navigation items for desktop center nav */
  navItems?: PortalHeaderNav[];
  /** Action icons on the right (search, bell, cart, etc.) */
  actions?: PortalHeaderAction[];
  /** User avatar initial or image URL */
  userAvatar?: string;
  /** User display name */
  userName?: string;
  /** Dropdown items shown when user clicks account icon */
  dropdownItems?: PortalHeaderDropdownItem[];
  /** Called when user clicks logo */
  onLogoClick?: () => void;
  /** Additional content rendered inside the header (e.g. tabs below nav) */
  children?: ReactNode;
  /** Whether the header should have scroll shadow */
  sticky?: boolean;
  /** Active nav item label (for underline highlight) */
  activeNav?: string;
}

export function PortalHeader({
  portalName,
  navItems = [],
  actions = [],
  userAvatar,
  userName,
  dropdownItems = [],
  onLogoClick,
  children,
  sticky = true,
  activeNav,
}: PortalHeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sticky) return;
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [sticky]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isActive = (href: string) => {
    if (!activeNav) return false;
    return activeNav === href;
  };

  return (
    <header
      className={`${sticky ? 'sticky top-0 z-40' : 'relative z-40'} border-b backdrop-blur-md transition-all duration-300 ${
        scrolled ? 'shadow-md' : ''
      }`}
      style={{
        background: scrolled ? 'rgba(255,255,255,0.95)' : 'var(--bhn-surface-2)',
        borderColor: scrolled ? 'var(--bhn-border)' : 'transparent',
      }}
    >
      {/* Main row */}
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Logo */}
        <button
          type="button"
          onClick={onLogoClick}
          className="flex items-center gap-2.5 shrink-0"
        >
          <span
            className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white"
            style={{ background: 'var(--bhn-brand-600)' }}
          >
            B
          </span>
          <span className="flex flex-col">
            <span
              className="text-lg font-bold leading-tight text-[var(--bhn-text)]"
              style={{ fontFamily: 'var(--bhn-font-display)' }}
            >
              Bandhan
            </span>
            {portalName && (
              <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--bhn-text-muted)]">
                {portalName}
              </span>
            )}
          </span>
        </button>

        {/* Desktop nav */}
        {navItems.length > 0 && (
          <nav className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {navItems.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="relative block px-4 py-2 text-sm font-medium transition"
                    style={{
                      color: isActive(item.href) ? 'var(--bhn-brand-700)' : 'var(--bhn-text-muted)',
                      fontWeight: isActive(item.href) ? 600 : 500,
                    }}
                  >
                    {item.label}
                    {isActive(item.href) && (
                      <span
                        className="absolute inset-x-4 -bottom-px h-0.5 rounded-full"
                        style={{ background: 'var(--bhn-brand-600)' }}
                      />
                    )}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}

        {/* Right actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          {actions.map((action) => (
            <a
              key={action.label}
              href={action.href}
              onClick={(e) => {
                if (action.onClick) {
                  e.preventDefault();
                  action.onClick();
                }
              }}
              aria-label={action.label}
              className={`relative flex h-10 items-center justify-center rounded-full transition hover:bg-[var(--bhn-surface)] ${action.showLabel ? 'gap-2 px-3 text-sm font-semibold' : 'w-10'}`}
              style={{ color: 'var(--bhn-text-muted)' }}
              target={action.href?.startsWith('http') ? '_blank' : undefined}
              rel={action.href?.startsWith('http') ? 'noopener noreferrer' : undefined}
            >
              {action.icon}
              {action.showLabel && <span>{action.label}</span>}
              {action.badge != null && action.badge > 0 && (
                <span
                  className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-[10px] font-bold text-white"
                  style={{ background: 'var(--bhn-brand-600)' }}
                >
                  {action.badge > 99 ? '99+' : action.badge}
                </span>
              )}
            </a>
          ))}

          {/* User dropdown */}
          {dropdownItems.length > 0 && (
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownOpen((o) => !o)}
                aria-label="Account"
                className="flex h-10 w-10 items-center justify-center rounded-full border transition-all hover:shadow-sm"
                style={{
                  borderColor: dropdownOpen ? 'var(--bhn-brand-400)' : 'var(--bhn-border-strong)',
                  background: dropdownOpen ? 'var(--bhn-brand-50)' : 'var(--bhn-surface)',
                  color: dropdownOpen ? 'var(--bhn-brand-600)' : 'var(--bhn-text-muted)',
                }}
              >
                {userAvatar ? (
                  <img src={userAvatar} alt={userName || 'User'} className="h-7 w-7 rounded-full object-cover" />
                ) : (
                  <span className="text-sm font-semibold">{userName?.charAt(0)?.toUpperCase() || 'U'}</span>
                )}
              </button>

              {dropdownOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                  <div
                    className="absolute right-0 z-30 mt-2 w-56 overflow-hidden rounded-xl border py-1.5 shadow-xl"
                    style={{ background: 'var(--bhn-surface)', borderColor: 'var(--bhn-border)' }}
                  >
                    {userName && (
                      <div className="border-b px-4 py-3" style={{ borderColor: 'var(--bhn-border)' }}>
                        <p className="text-xs font-semibold text-[var(--bhn-text)]">{userName}</p>
                        <p className="mt-0.5 text-[11px] text-[var(--bhn-text-muted)]">{portalName || 'Bandhan'}</p>
                      </div>
                    )}
                    {dropdownItems.map((item, i) => {
                      if (item.divider) {
                        return <div key={i} className="my-1 border-t" style={{ borderColor: 'var(--bhn-border)' }} />;
                      }
                      const content = (
                        <span className={`flex items-center gap-2 px-4 py-2.5 text-sm transition hover:bg-[var(--bhn-surface-2)] ${item.destructive ? 'text-red-600' : ''}`} style={{ color: item.destructive ? undefined : 'var(--bhn-text-muted)' }}>
                          {item.icon}
                          {item.label}
                        </span>
                      );
                      return item.href ? (
                        <a
                          key={i}
                          href={item.href}
                          onClick={() => setDropdownOpen(false)}
                          target={item.external ? '_blank' : undefined}
                          rel={item.external ? 'noopener noreferrer' : undefined}
                        >
                          {content}
                        </a>
                      ) : (
                        <button key={i} type="button" onClick={() => { item.onClick?.(); setDropdownOpen(false); }} className="w-full text-left">
                          {content}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Mobile hamburger */}
          {navItems.length > 0 && (
            <button
              type="button"
              onClick={() => setMobileOpen((o) => !o)}
              className="flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-[var(--bhn-surface)] lg:hidden"
              style={{ color: 'var(--bhn-brand-600)' }}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          )}
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && navItems.length > 0 && (
        <div className="border-t lg:hidden" style={{ borderColor: 'var(--bhn-border)', background: 'var(--bhn-surface-2)' }}>
          <ul className="max-h-[70vh] overflow-y-auto px-2 py-2">
            {navItems.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-lg px-4 py-3 text-sm font-medium"
                  style={{
                    color: isActive(item.href) ? 'var(--bhn-brand-700)' : 'var(--bhn-text)',
                    background: isActive(item.href) ? 'var(--bhn-surface)' : 'transparent',
                  }}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Extra content (tabs, etc.) */}
      {children && (
        <div className="border-t" style={{ borderColor: 'var(--bhn-border)' }}>
          {children}
        </div>
      )}
    </header>
  );
}
