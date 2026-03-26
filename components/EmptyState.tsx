'use client';

import Link from 'next/link';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description: string;
  action?: { label: string; onClick: () => void } | React.ReactNode;
  backLink?: { label: string; href: string };
}

export default function EmptyState({ icon = '📋', title, description, action, backLink }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="w-20 h-20 rounded-full bg-[var(--color-bg-elevated)] border border-[var(--color-border)] flex items-center justify-center text-4xl mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-[var(--color-text-primary)] mb-3">{title}</h3>
      <p className="text-sm text-[var(--color-text-muted)] mb-8 max-w-md leading-relaxed">{description}</p>
      {action && (
        typeof action === 'object' && action !== null && 'label' in action && 'onClick' in action ? (
          <button
            onClick={(action as { label: string; onClick: () => void }).onClick}
            className="px-6 py-3 rounded-lg bg-[var(--color-accent)] text-white font-semibold text-sm hover:brightness-110 transition-all min-h-[44px]"
          >
            {(action as { label: string }).label}
          </button>
        ) : (
          <>{action}</>
        )
      )}
      {backLink && (
        <Link
          href={backLink.href}
          className="mt-6 text-sm text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] transition-colors font-medium"
        >
          ← {backLink.label}
        </Link>
      )}
    </div>
  );
}
