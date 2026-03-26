"use client";

import type { ReactNode } from "react";

interface AuthPageLayoutProps {
  children: ReactNode;
  contextMessage?: string | null;
  onBack?: () => void;
}

export default function AuthPageLayout({ children, contextMessage, onBack }: AuthPageLayoutProps) {
  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-md space-y-4">
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-1 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
            Back
          </button>
        )}
        {contextMessage && (
          <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-3 text-center text-sm text-[var(--color-text-muted)]">
            {contextMessage}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
