"use client";

import { useState } from "react";

interface FavoriteButtonProps {
  entityId: string;
  entityType: string;
  isFavorited: boolean;
  onToggle: (entityId: string) => Promise<void | boolean>;
  count?: number;
  size?: "sm" | "md";
  className?: string;
  disabled?: boolean;
}

export default function FavoriteButton({
  entityId,
  entityType,
  isFavorited,
  onToggle,
  count,
  size = "md",
  className = "",
  disabled = false,
}: FavoriteButtonProps) {
  const [loading, setLoading] = useState(false);
  const [animating, setAnimating] = useState(false);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (loading || disabled) return;

    setAnimating(true);
    setTimeout(() => setAnimating(false), 400);

    setLoading(true);
    try {
      await onToggle(entityId);
    } finally {
      setLoading(false);
    }
  };

  const iconSize = size === "sm" ? "w-4 h-4" : "w-5 h-5";
  const buttonSize = size === "sm" ? "w-8 h-8" : "w-10 h-10";

  return (
    <button
      onClick={handleClick}
      disabled={loading || disabled}
      className={`transition-all flex items-center ${count != null ? "gap-1.5" : "justify-center rounded-full"} ${
        count == null ? buttonSize : ""
      } ${
        isFavorited
          ? "bg-red-500/15 hover:bg-red-500/25"
          : count == null
            ? "bg-[var(--color-bg-primary)] hover:bg-[var(--color-bg-surface)] border border-[var(--color-border)]"
            : ""
      } ${animating ? "scale-125" : "scale-100"} ${className}`}
      aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
      title={isFavorited ? "Remove from favorites" : "Add to favorites"}
      data-entity-type={entityType}
    >
      {isFavorited ? (
        <svg className={`${iconSize} text-red-500 drop-shadow-[0_0_4px_rgba(239,68,68,0.5)]`} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
        </svg>
      ) : (
        <svg className={`${iconSize} text-[var(--color-text-muted)]`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
        </svg>
      )}
      {count != null && count > 0 && (
        <span className="text-xs text-[var(--color-text-muted)]">{count}</span>
      )}
    </button>
  );
}
