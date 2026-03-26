"use client";

interface ErrorPageProps {
  error?: Error & { digest?: string };
  reset?: () => void;
  title?: string;
  message?: string;
  emoji?: string;
}

export default function ErrorPage({
  error,
  reset,
  title = "Something went wrong",
  message,
  emoji = "⚠️",
}: ErrorPageProps) {
  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] flex items-center justify-center px-4">
      <div className="text-center">
        <div className="text-6xl mb-4">{emoji}</div>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-2">
          {title}
        </h1>
        <p className="text-sm text-[var(--color-text-muted)] mb-6 max-w-sm">
          {message || error?.message || "An unexpected error occurred."}
        </p>
        {reset && (
          <button
            onClick={reset}
            className="inline-block px-5 py-2.5 rounded-lg text-sm font-semibold bg-[var(--color-accent)] text-[var(--color-btn-primary-text)] hover:bg-[var(--color-accent-hover)] transition-colors"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
}
