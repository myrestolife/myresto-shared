"use client";

import type { ReactNode } from "react";

interface NavbarShellProps {
  children: ReactNode;
  className?: string;
}

export default function NavbarShell({ children, className = "" }: NavbarShellProps) {
  return (
    <header
      className={`sticky top-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-bg-primary)]/95 backdrop-blur-md ${className}`}
    >
      {children}
    </header>
  );
}
