"use client";

/**
 * Shared footer for all MyResto apps.
 *
 * Usage:
 * ```tsx
 * <Footer
 *   appName="MyRestoGarage"
 *   commitHash={process.env.NEXT_PUBLIC_GIT_HASH}
 *   pageLinks={[
 *     { href: '/explore', label: 'Explore' },
 *     { href: '/about', label: 'About' },
 *   ]}
 *   legalLinks={[
 *     { href: '/privacy', label: 'Privacy' },
 *     { href: '/terms', label: 'Terms' },
 *   ]}
 *   socialLinks={[
 *     { href: 'https://instagram.com/myrestogarage', label: 'Instagram' },
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

interface FooterProps {
  /** App name (e.g., "MyRestoGarage") */
  appName: string;
  /** Git commit hash */
  commitHash?: string;
  /** App-specific page links (Explore, About, etc.) */
  pageLinks?: FooterLink[];
  /** Legal links (Privacy, Terms, etc.) */
  legalLinks?: FooterLink[];
  /** Social media links */
  socialLinks?: FooterLink[];
  /** Override suite links (defaults to all 3 apps) */
  suiteLinks?: FooterLink[];
}

const DEFAULT_SUITE_LINKS: FooterLink[] = [
  { href: "https://myrestogarage.com", label: "MyRestoGarage", external: true },
  { href: "https://myrestoevent.com", label: "MyRestoEvent", external: true },
  { href: "https://myrestoclub.com", label: "MyRestoClub", external: true },
];

function LinkItem({ link }: { link: FooterLink }) {
  const props = link.external
    ? { target: "_blank" as const, rel: "noopener noreferrer" }
    : {};

  return (
    <a
      href={link.href}
      className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
      {...props}
    >
      {link.label}
    </a>
  );
}

function LinkRow({ links, separator = "·" }: { links: FooterLink[]; separator?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 flex-wrap text-sm">
      {links.map((link, i) => (
        <Fragment key={link.href}>
          {i > 0 && (
            <span className="text-[var(--color-text-subtle)] text-xs">{separator}</span>
          )}
          <LinkItem link={link} />
        </Fragment>
      ))}
    </div>
  );
}

export default function Footer({
  appName,
  commitHash,
  pageLinks,
  legalLinks,
  socialLinks,
  suiteLinks = DEFAULT_SUITE_LINKS,
}: FooterProps) {
  return (
    <footer className="border-t border-[var(--color-border)] py-8 px-6">
      <div className="max-w-[1280px] mx-auto space-y-4">
        {/* App-specific page links */}
        {pageLinks && pageLinks.length > 0 && (
          <LinkRow links={pageLinks} />
        )}

        {/* Suite cross-links */}
        <LinkRow links={suiteLinks} />

        {/* Social links */}
        {socialLinks && socialLinks.length > 0 && (
          <LinkRow links={socialLinks} />
        )}

        {/* Legal + copyright */}
        <div className="flex items-center justify-center gap-3 flex-wrap text-xs text-[var(--color-text-subtle)]">
          <span>© {new Date().getFullYear()} {appName}</span>
          <span>·</span>
          <span>Part of MyRestoLife</span>
          {legalLinks && legalLinks.map((link) => (
            <Fragment key={link.href}>
              <span>·</span>
              <a
                href={link.href}
                className="hover:text-[var(--color-text-muted)] transition-colors"
              >
                {link.label}
              </a>
            </Fragment>
          ))}
          {commitHash && (
            <>
              <span>·</span>
              <span className="opacity-50">{commitHash}</span>
            </>
          )}
        </div>
      </div>
    </footer>
  );
}
