"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useAuth, useUser } from "../lib/auth";
import ThemeToggle from "./ThemeToggle";
import type { Brand } from "../lib/brand";

export interface NavTab {
  href: string;
  label: string;
  exact?: boolean;
  authOnly?: boolean;
  anonOnly?: boolean;
}

export interface NavbarConfig {
  brand: Brand;
  tabs: NavTab[];
  cta: { href: string; label: string };
  signInPath: string;
  userMenuLinks?: Array<{ href: string; label: string }>;
}

export default function Navbar({
  brand,
  tabs,
  cta,
  signInPath,
  userMenuLinks = [{ href: "/dashboard", label: "Dashboard" }],
}: NavbarConfig) {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useAuth();
  const { user, isSignedIn, isLoaded } = useUser();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    if (userMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [userMenuOpen]);

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  const tabClass = (path: string, exact = false) => {
    const active = exact ? pathname === path : pathname.startsWith(path);
    return `px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors ${
      active
        ? "text-[var(--color-accent)] bg-[var(--color-accent)]/8"
        : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-surface)]"
    }`;
  };

  const mobileTabClass = (path: string, exact = false) => {
    const active = exact ? pathname === path : pathname.startsWith(path);
    return `block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
      active
        ? "bg-[var(--color-accent)]/10 text-[var(--color-accent)]"
        : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-elevated)]"
    }`;
  };

  const visibleTabs = tabs.filter((tab) => {
    if (!isLoaded) return !tab.authOnly && !tab.anonOnly;
    if (tab.authOnly && !isSignedIn) return false;
    if (tab.anonOnly && isSignedIn) return false;
    return true;
  });

  return (
    <nav aria-label="Main navigation" className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-bg-elevated)]/95 backdrop-blur-xl">
      <div className="flex items-center justify-between px-4 md:px-6 py-2.5">
        {/* Left: Brand + Tabs */}
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-1 text-[16px] font-bold tracking-tight text-[var(--color-text-primary)] shrink-0" aria-label={`${brand.full} home`}>
            <Image src={brand.icon.dark} alt="" height={brand.iconSize.navbar} width={brand.iconSize.navbar} className="brand-icon-dark" />
            <Image src={brand.icon.light} alt="" height={brand.iconSize.navbar} width={brand.iconSize.navbar} className="brand-icon-light" />
            <span>{brand.prefix}<span className="text-[var(--color-accent)]">{brand.name}</span></span>
          </Link>

          {/* Desktop tabs */}
          <div className="hidden md:flex items-center gap-0.5">
            {visibleTabs.map((tab) => (
              <Link key={tab.href} href={tab.href} className={tabClass(tab.href, tab.exact)}>
                {tab.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="hidden md:flex items-center gap-2">
          {isLoaded && !isSignedIn && (
            <Link
              href={signInPath}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-[var(--color-ghost-text)] border border-[var(--color-ghost-border)] hover:border-[var(--color-border-hover)] transition-colors"
            >
              Sign In
            </Link>
          )}
          {isLoaded && isSignedIn && user && (
            <>
              <Link
                href={cta.href}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[var(--color-accent)] text-[var(--color-btn-primary-text)] hover:bg-[var(--color-accent-hover)] transition-colors"
              >
                {cta.label}
              </Link>
              <div ref={menuRef} className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center justify-center w-8 h-8 rounded-full overflow-hidden bg-[var(--color-accent)]/15 text-[var(--color-accent)] text-xs font-bold hover:bg-[var(--color-accent)]/25 transition-colors"
                  title="Account menu"
                >
                  {user.imageUrl ? (
                    <Image src={user.imageUrl} alt="" width={32} height={32} className="w-full h-full object-cover" />
                  ) : (
                    user.primaryEmailAddress?.charAt(0).toUpperCase() ?? "U"
                  )}
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] shadow-lg py-1.5 z-50">
                    <div className="px-3 py-2 border-b border-[var(--color-border)]">
                      <p className="text-xs font-medium text-[var(--color-text-primary)] truncate">{user.primaryEmailAddress}</p>
                    </div>
                    {userMenuLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="block px-3 py-2 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-surface)] transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        {link.label}
                      </Link>
                    ))}
                    <div className="my-1 border-t border-[var(--color-border)]" />
                    <button
                      onClick={() => { setUserMenuOpen(false); handleSignOut(); }}
                      className="w-full text-left px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-[var(--color-bg-surface)] transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
          <ThemeToggle />
        </div>

        {/* Mobile: user avatar + menu */}
        <div className="flex md:hidden items-center gap-1">
          {isSignedIn && user && (
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center justify-center w-8 h-8 rounded-full overflow-hidden bg-[var(--color-accent)]/15 text-[var(--color-accent)] text-xs font-bold"
              title="Account menu"
            >
              {user.imageUrl ? (
                <Image src={user.imageUrl} alt="" width={32} height={32} className="w-full h-full object-cover" />
              ) : (
                user.primaryEmailAddress?.charAt(0).toUpperCase() ?? "U"
              )}
            </button>
          )}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            className="p-2 rounded-lg text-[var(--color-text-muted)] hover:bg-[var(--color-bg-elevated)] transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {mobileOpen ? <path d="M6 18L18 6M6 6l12 12" /> : <path d="M3 12h18M3 6h18M3 18h18" />}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[var(--color-border)] px-3 py-3 space-y-1">
          {visibleTabs.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className={mobileTabClass(tab.href, tab.exact)}
              onClick={() => setMobileOpen(false)}
            >
              {tab.label}
            </Link>
          ))}
          {isSignedIn && (
            <Link
              href={cta.href}
              className={mobileTabClass(cta.href)}
              onClick={() => setMobileOpen(false)}
            >
              {cta.label}
            </Link>
          )}
          {!isSignedIn && (
            <div className="pt-2 border-t border-[var(--color-border)] mt-2 flex flex-col gap-2">
              <Link
                href={signInPath}
                className="block text-center px-4 py-2.5 rounded-lg text-sm font-semibold text-[var(--color-ghost-text)] border border-[var(--color-ghost-border)]"
                onClick={() => setMobileOpen(false)}
              >
                Sign In
              </Link>
            </div>
          )}
          <div className="flex items-center justify-between px-4 py-2 mt-1 border-t border-[var(--color-border)]">
            <span className="text-sm text-[var(--color-text-muted)]">Theme</span>
            <ThemeToggle />
          </div>
        </div>
      )}
    </nav>
  );
}
