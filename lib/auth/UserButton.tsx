"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useUser, useAuth } from "./provider";

export function UserButton() {
  const { user, isSignedIn } = useUser();
  const { signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  // Focus management — focus first menu item when opened
  useEffect(() => {
    if (open && menuRef.current) {
      const firstItem = menuRef.current.querySelector<HTMLElement>('[role="menuitem"]');
      firstItem?.focus();
    }
  }, [open]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!open) return;

      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
        return;
      }

      const items = menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]');
      if (!items?.length) return;
      const current = document.activeElement as HTMLElement;
      const idx = Array.from(items).indexOf(current);

      if (e.key === "ArrowDown") {
        e.preventDefault();
        items[(idx + 1) % items.length].focus();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        items[(idx - 1 + items.length) % items.length].focus();
      }
    },
    [open]
  );

  if (!isSignedIn || !user) return null;

  const initials =
    [user.firstName, user.lastName]
      .filter(Boolean)
      .map((n) => n![0])
      .join("")
      .toUpperCase() || "?";

  return (
    <div ref={containerRef} className="relative inline-block" onKeyDown={handleKeyDown}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="User menu"
        className="w-9 h-9 rounded-full overflow-hidden border-2 border-[var(--color-border)] cursor-pointer bg-[var(--color-bg-elevated)] p-0 flex items-center justify-center text-[var(--color-text-primary)] font-semibold text-sm"
      >
        {user.imageUrl ? (
          <img src={user.imageUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          initials
        )}
      </button>
      {open && (
        <div
          ref={menuRef}
          role="menu"
          aria-label="User menu"
          className="absolute right-0 top-11 min-w-[220px] bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-[10px] p-4 z-50 shadow-[0_8px_24px_rgba(0,0,0,0.25)]"
        >
          <p className="text-[var(--color-text-primary)] font-semibold text-sm m-0 mb-0.5">
            {user.fullName ?? "User"}
          </p>
          {user.primaryEmailAddress && (
            <p className="text-[var(--color-text-muted)] text-xs m-0 mb-2">
              {user.primaryEmailAddress}
            </p>
          )}
          {user.publicMetadata.plan && (
            <p className="text-[var(--color-accent)] text-[11px] font-semibold uppercase m-0 mb-3">
              {user.publicMetadata.plan}
            </p>
          )}
          <hr className="border-none border-t border-[var(--color-border)] my-2" />
          <button
            role="menuitem"
            tabIndex={0}
            type="button"
            onClick={() => {
              setOpen(false);
              signOut();
            }}
            className="w-full py-2 bg-transparent border-none text-[var(--color-text-muted)] cursor-pointer text-[13px] text-left hover:text-[var(--color-text-primary)] focus:outline-none focus:text-[var(--color-text-primary)]"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
