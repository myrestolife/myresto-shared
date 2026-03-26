import Link from "next/link";

interface NotFoundAction {
  href: string;
  label: string;
  variant?: "primary" | "ghost";
}

interface NotFoundPageProps {
  title?: string;
  message?: string;
  emoji?: string;
  actions?: NotFoundAction[];
}

export default function NotFoundPage({
  title = "Page Not Found",
  message = "The page you're looking for doesn't exist or has been moved.",
  emoji = "🔍",
  actions = [{ href: "/", label: "Go Home", variant: "ghost" }],
}: NotFoundPageProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-[var(--color-bg-primary)]">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-4">{emoji}</div>
        <h1 className="text-3xl font-bold text-[var(--color-text-primary)] mb-2">
          {title}
        </h1>
        <p className="text-sm text-[var(--color-text-muted)] mb-6">{message}</p>
        <div className="flex flex-wrap gap-3 justify-center">
          {actions.map((action) =>
            action.variant === "primary" ? (
              <Link
                key={action.href}
                href={action.href}
                className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-[var(--color-accent)] text-[var(--color-btn-primary-text)] hover:bg-[var(--color-accent-hover)] transition-colors min-h-[44px] inline-flex items-center"
              >
                {action.label}
              </Link>
            ) : (
              <Link
                key={action.href}
                href={action.href}
                className="px-5 py-2.5 rounded-lg text-sm font-semibold text-[var(--color-ghost-text)] border border-[var(--color-ghost-border)] hover:border-[var(--color-border-hover)] transition-colors min-h-[44px] inline-flex items-center"
              >
                {action.label}
              </Link>
            )
          )}
        </div>
      </div>
    </div>
  );
}
