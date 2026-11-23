import { cn } from "cn"

import { countLabel } from "./model"

/**
 * A count as a small pill (the rail's and the bars' unread counts, a folder's
 * unread messages). `accent` is the one accent (Arancio) with its edge on light
 * grounds (--yes-edge, src/brand/theme.css): the rail's counts. Hidden
 * from screen readers: the caller says it with `aria-description`, so the
 * entry's name stays its own («Chat»).
 */
export function CountBadge({
  count,
  tone = "primary",
  className,
}: {
  count: number
  tone?: "primary" | "accent" | "destructive" | "muted"
  className?: string
}) {
  return (
    <span
      aria-hidden
      data-count={count}
      className={cn(
        "pointer-events-none inline-flex h-3.5 min-w-3.5 shrink-0 items-center justify-center rounded-full px-[3px] text-[9px] leading-none font-semibold tabular-nums",
        tone === "primary" && "bg-primary text-primary-foreground",
        tone === "accent" && "bg-highlight text-on-highlight ring-1 ring-yes-edge",
        tone === "destructive" && "bg-destructive text-white",
        tone === "muted" && "bg-sidebar-accent text-sidebar-accent-foreground",
        className
      )}
    >
      {countLabel(count)}
    </span>
  )
}
