'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SignedIn, SignedOut, UserButton } from '../lib/auth';
import type { Brand } from '../lib/brand';

export interface NavTab {
  href: string;
  label: string;
  /** Use exact path match (default: false — prefix match) */
  exact?: boolean;
  /** Only show this tab when signed in */
  authRequired?: boolean;
  /** Only show this tab when signed out */
  guestOnly?: boolean;
}

export interface NavbarProps {
  /** Brand configuration — import from your app's lib/brand and pass in */
  brand: Brand;
  tabs: NavTab[];
  cta?: {
    href: string;
    /** e.g. "+ New Event", "+ Add Vehicle" */
    label: string;
  };
  /** Default: "/sign-in" */
  signInHref?: string;
  /** Slot for app-local ThemeToggle (rendered next to sign-in/user controls) */
  themeToggle?: React.ReactNode;
}

export default function Navbar({
  brand,
  tabs,
  cta,
  signInHref = '/sign-in',
  themeToggle,
}: NavbarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  // ── Escape key: close mobile menu ──────────────────────────────────────
  const handleEscapeKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileOpen) {
        setMobileOpen(false);
        menuButtonRef.current?.focus();
      }
    },
    [mobileOpen],
  );

  useEffect(() => {
    document.addEventListener('keydown', handleEscapeKey);
    return () => document.removeEventListener('keydown', handleEscapeKey);
  }, [handleEscapeKey]);

  // ── Scroll lock when mobile menu is open ───────────────────────────────
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  // ── Focus trap for mobile menu ─────────────────────────────────────────
  useEffect(() => {
    if (!mobileOpen || !mobileMenuRef.current) return;

    const menu = mobileMenuRef.current;

    const handleTrapFocus = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const focusableEls = menu.querySelectorAll<HTMLElement>(
        'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (focusableEls.length === 0) return;

      const firstEl = focusableEls[0];
      const lastEl = focusableEls[focusableEls.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstEl) {
          e.preventDefault();
          lastEl.focus();
        }
      } else {
        if (document.activeElement === lastEl) {
          e.preventDefault();
          firstEl.focus();
        }
      }
    };

    // Move focus into the menu when it opens
    const focusableEls = menu.querySelectorAll<HTMLElement>(
      'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    if (focusableEls.length > 0) {
      focusableEls[0].focus();
    }

    document.addEventListener('keydown', handleTrapFocus);
    return () => document.removeEventListener('keydown', handleTrapFocus);
  }, [mobileOpen]);

  // ── CSS class helpers ──────────────────────────────────────────────────
  const tabClass = (path: string, exact = false) => {
    const active = exact ? pathname === path : pathname.startsWith(path);
    return `px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors ${
      active
        ? 'text-[var(--color-accent)] bg-[var(--color-accent)]/8'
        : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-surface)]'
    }`;
  };

  const mobileTabClass = (path: string, exact = false) => {
    const active = exact ? pathname === path : pathname.startsWith(path);
    return `block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
      active
        ? 'bg-[var(--color-accent)]/10 text-[var(--color-accent)]'
        : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-elevated)]'
    }`;
  };

  // ── Partition tabs by visibility rule ─────────────────────────────────
  const alwaysTabs = tabs.filter((t) => !t.authRequired && !t.guestOnly);
  const authTabs = tabs.filter((t) => t.authRequired);
  const guestTabs = tabs.filter((t) => t.guestOnly);

  return (
    <nav
      aria-label="Main navigation"
      className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-bg-elevated)]/95 backdrop-blur-xl"
    >
      <div className="w-full flex items-center justify-between px-4 md:px-6 py-2.5">
        {/* ── Left: Brand + Desktop Tabs ──────────────────────────────── */}
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-1 text-[16px] font-bold tracking-tight text-[var(--color-text-primary)] shrink-0"
            aria-label={`${brand.full} home`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={brand.icon.dark}
              alt=""
              height={brand.iconSize.navbar}
              style={{ height: brand.iconSize.navbar, width: 'auto', maxWidth: 40 }}
              className="brand-icon-dark"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={brand.icon.light}
              alt=""
              height={brand.iconSize.navbar}
              style={{ height: brand.iconSize.navbar, width: 'auto', maxWidth: 40 }}
              className="brand-icon-light"
            />
            <span>
              {brand.prefix}
              <span className="text-[var(--color-accent)]">{brand.name}</span>
            </span>
          </Link>

          {/* Desktop tabs */}
          <div className="hidden md:flex items-center gap-0.5">
            {alwaysTabs.map((tab) => (
              <Link key={tab.href} href={tab.href} className={tabClass(tab.href, tab.exact)}>
                {tab.label}
              </Link>
            ))}
            {authTabs.length > 0 && (
              <SignedIn>
                {authTabs.map((tab) => (
                  <Link key={tab.href} href={tab.href} className={tabClass(tab.href, tab.exact)}>
                    {tab.label}
                  </Link>
                ))}
              </SignedIn>
            )}
            {guestTabs.length > 0 && (
              <SignedOut>
                {guestTabs.map((tab) => (
                  <Link key={tab.href} href={tab.href} className={tabClass(tab.href, tab.exact)}>
                    {tab.label}
                  </Link>
                ))}
              </SignedOut>
            )}
          </div>
        </div>

        {/* ── Right: Desktop Actions ───────────────────────────────────── */}
        <div className="hidden md:flex items-center gap-2">
          <SignedOut>
            <Link
              href={signInHref}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-[var(--color-ghost-text)] border border-[var(--color-ghost-border)] hover:border-[var(--color-border-hover)] transition-colors"
            >
              Sign In
            </Link>
          </SignedOut>
          <SignedIn>
            {cta && (
              <Link
                href={cta.href}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[var(--color-accent)] text-[var(--color-btn-primary-text)] hover:bg-[var(--color-accent-hover)] transition-colors"
              >
                {cta.label}
              </Link>
            )}
            <UserButton />
          </SignedIn>
          {themeToggle}
        </div>

        {/* ── Mobile: UserButton + Hamburger ──────────────────────────── */}
        <div className="flex md:hidden items-center gap-1">
          <SignedIn>
            <UserButton />
          </SignedIn>
          <button
            ref={menuButtonRef}
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-3 rounded-lg text-[var(--color-text-muted)] hover:bg-[var(--color-bg-surface)] transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav-menu"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              {mobileOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M3 12h18M3 6h18M3 18h18" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* ── Mobile Menu ───────────────────────────────────────────────── */}
      {mobileOpen && (
        <div
          id="mobile-nav-menu"
          ref={mobileMenuRef}
          className="md:hidden border-t border-[var(--color-border)] px-3 py-3 space-y-1"
          role="menu"
        >
          {alwaysTabs.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className={mobileTabClass(tab.href, tab.exact)}
              onClick={() => setMobileOpen(false)}
              role="menuitem"
            >
              {tab.label}
            </Link>
          ))}

          {authTabs.length > 0 && (
            <SignedIn>
              {authTabs.map((tab) => (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={mobileTabClass(tab.href, tab.exact)}
                  onClick={() => setMobileOpen(false)}
                  role="menuitem"
                >
                  {tab.label}
                </Link>
              ))}
            </SignedIn>
          )}

          {cta && (
            <SignedIn>
              <Link
                href={cta.href}
                className={mobileTabClass(cta.href)}
                onClick={() => setMobileOpen(false)}
                role="menuitem"
              >
                {cta.label}
              </Link>
            </SignedIn>
          )}

          {guestTabs.length > 0 && (
            <SignedOut>
              {guestTabs.map((tab) => (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={mobileTabClass(tab.href, tab.exact)}
                  onClick={() => setMobileOpen(false)}
                  role="menuitem"
                >
                  {tab.label}
                </Link>
              ))}
            </SignedOut>
          )}

          <SignedOut>
            <div className="pt-2 border-t border-[var(--color-border)] mt-2 flex flex-col gap-2">
              <Link
                href={signInHref}
                className="block text-center px-4 py-2.5 rounded-lg text-sm font-semibold text-[var(--color-ghost-text)] border border-[var(--color-ghost-border)]"
                onClick={() => setMobileOpen(false)}
                role="menuitem"
              >
                Sign In
              </Link>
            </div>
          </SignedOut>

          {themeToggle && (
            <div className="flex items-center gap-2 pt-2 border-t border-[var(--color-border)] mt-2">
              <span className="text-sm text-[var(--color-text-muted)]">Theme</span>
              {themeToggle}
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
