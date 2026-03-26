interface SkipToContentProps {
  targetId?: string;
}

export function SkipToContent({ targetId = "main-content" }: SkipToContentProps) {
  return (
    <a
      href={`#${targetId}`}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] px-4 py-2 bg-[var(--color-accent)] text-[var(--color-btn-primary-text)] rounded-lg font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/50"
    >
      Skip to main content
    </a>
  );
}

export default SkipToContent;
