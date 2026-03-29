"use client";

/**
 * Shared footer — Option C: Two-Row Compact with social icons.
 *
 * Usage:
 * ```tsx
 * <Footer
 *   appName="MyRestoGarage"
 *   brandAccent="Garage"
 *   commitHash={process.env.NEXT_PUBLIC_GIT_HASH}
 *   pageLinks={[
 *     { href: '/explore', label: 'Explore' },
 *     { href: '/about', label: 'About' },
 *   ]}
 *   legalLinks={[
 *     { href: '/privacy', label: 'Privacy' },
 *     { href: '/terms', label: 'Terms' },
 *   ]}
 *   socials={[
 *     { platform: 'instagram', href: 'https://instagram.com/myrestogarage' },
 *     { platform: 'facebook', href: 'https://facebook.com/myrestogarage' },
 *   ]}
 * />
 * ```
 */

import { Fragment } from "react";

interface FooterLink {
  href: string;
  label: string;
  external?: boolean;
}

type SocialPlatform = "instagram" | "facebook" | "twitter" | "youtube" | "tiktok";

interface SocialLink {
  platform: SocialPlatform;
  href: string;
}

interface FooterProps {
  appName: string;
  /** The accent-colored word in "MyResto{Garage}" */
  brandAccent?: string;
  commitHash?: string;
  pageLinks?: FooterLink[];
  legalLinks?: FooterLink[];
  socials?: SocialLink[];
  suiteLinks?: FooterLink[];
}

const DEFAULT_SUITE_LINKS: FooterLink[] = [
  { href: "https://myrestoevent.com", label: "MyRestoEvent", external: true },
  { href: "https://myrestoclub.com", label: "MyRestoClub", external: true },
  { href: "https://myrestolife.com", label: "MyRestoLife", external: true },
];

function SocialIcon({ platform }: { platform: SocialPlatform }) {
  switch (platform) {
    case "instagram":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
        </svg>
      );
    case "facebook":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
          <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
        </svg>
      );
    case "twitter":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
          <path d="M4 4l11.733 16h4.267l-11.733 -16zM4 20l6.768 -6.768M13.232 10.768L20 4" />
        </svg>
      );
    case "youtube":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
          <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19.13C5.12 19.56 12 19.56 12 19.56s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.43z" />
          <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
        </svg>
      );
    case "tiktok":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
          <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
        </svg>
      );
  }
}

export default function Footer({
  appName,
  brandAccent,
  commitHash,
  pageLinks,
  legalLinks,
  socials,
  suiteLinks = DEFAULT_SUITE_LINKS,
}: FooterProps) {
  const accent = brandAccent || appName.replace("MyResto", "");

  return (
    <footer className="border-t border-[var(--color-border)] py-5 px-6">
      <div className="max-w-[1280px] mx-auto">
        {/* ── Top Row ── */}
        <div className="flex flex-col md:flex-row items-center md:justify-between gap-3 mb-4">
          {/* Left: brand + page links */}
          <div className="flex flex-col md:flex-row items-center gap-3 md:gap-6">
            <span className="text-[15px] font-extrabold text-[var(--color-text-primary)]">
              MyResto<span className="text-[var(--color-accent)]">{accent}</span>
            </span>
            {pageLinks && pageLinks.length > 0 && (
              <nav className="flex items-center gap-4 md:gap-5">
                {pageLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="text-[13px] text-[var(--color-text-secondary,#8a9bb5)] hover:text-[var(--color-text-primary)] transition-colors"
                    {...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  >
                    {link.label}
                  </a>
                ))}
              </nav>
            )}
          </div>

          {/* Right: social icons */}
          {socials && socials.length > 0 && (
            <div className="flex items-center gap-2">
              {socials.map((s) => (
                <a
                  key={s.platform}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-[var(--color-bg-elevated,#0c1220)] flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-surface,#0d1825)] transition-colors"
                  aria-label={s.platform}
                >
                  <SocialIcon platform={s.platform} />
                </a>
              ))}
            </div>
          )}
        </div>

        {/* ── Bottom Row ── */}
        <div className="border-t border-[var(--color-border)] pt-3 flex flex-col md:flex-row items-center md:justify-between gap-2">
          {/* Left: suite links */}
          <div className="flex items-center gap-3 flex-wrap">
            {suiteLinks.map((link, i) => (
              <Fragment key={link.href}>
                {i > 0 && <span className="text-[var(--color-text-subtle,#2a4a6a)] text-[10px]">·</span>}
                <a
                  href={link.href}
                  className="text-[12px] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
                  {...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                >
                  {link.label}
                </a>
              </Fragment>
            ))}
          </div>

          {/* Right: copyright + legal */}
          <div className="flex items-center gap-2 flex-wrap justify-center text-[11px] text-[var(--color-text-subtle,#2a4a6a)]">
            <span>© {new Date().getFullYear()} {appName}</span>
            {legalLinks && legalLinks.map((link) => (
              <Fragment key={link.href}>
                <span className="text-[var(--color-border)]">·</span>
                <a
                  href={link.href}
                  className="hover:text-[var(--color-text-muted)] transition-colors"
                  {...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                >
                  {link.label}
                </a>
              </Fragment>
            ))}
          </div>
        </div>

        {/* ── Hash Row ── */}
        {commitHash && (
          <div className="text-right mt-1">
            <span className="text-[10px] text-[var(--color-text-subtle,#2a4a6a)] opacity-40">{commitHash}</span>
          </div>
        )}
      </div>
    </footer>
  );
}
