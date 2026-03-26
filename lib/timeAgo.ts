/**
 * Converts a date/timestamp to a human-readable relative time string.
 *
 * Accepts `string`, `number` (epoch ms), or `Date`. Returns `null` for
 * falsy inputs so callers don't need to guard against missing values.
 *
 * @example
 * ```ts
 * import { timeAgo } from "@myresto/shared/lib/timeAgo";
 *
 * timeAgo("2025-01-01T00:00:00Z"); // "3 months ago"
 * timeAgo(null);                    // null
 * ```
 */
export function timeAgo(dateInput: string | number | Date | null | undefined): string | null {
  if (dateInput == null) return null;

  const date =
    typeof dateInput === "string" || typeof dateInput === "number"
      ? new Date(dateInput)
      : dateInput;

  if (Number.isNaN(date.getTime())) return null;

  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";
  if (seconds < 3600) {
    const m = Math.floor(seconds / 60);
    return `${m}m ago`;
  }
  if (seconds < 86400) {
    const h = Math.floor(seconds / 3600);
    return `${h}h ago`;
  }
  const d = Math.floor(seconds / 86400);
  if (d === 1) return "1 day ago";
  if (d < 30) return `${d} days ago`;
  const mo = Math.floor(d / 30);
  if (mo === 1) return "1 month ago";
  return `${mo} months ago`;
}
