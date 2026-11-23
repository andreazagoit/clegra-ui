"use client"

import { ChevronDownIcon } from "lucide-react"
import { cn } from "cn"

import { Kbd } from "../components/kbd"
import { Tooltip, TooltipContent, TooltipTrigger } from "../components/tooltip"

/*
 * THE HEADER'S PILLS (the design system §3): the Clegra layer over
 * shadcn's components, never inside them. A group of controls is one glass
 * capsule (40 high, radius 20) holding items of 32 (radius 16); a lone
 * control is a 40 circle. Items are buttons (or links, through `render`), so
 * shadcn's triggers compose with them: `<DropdownMenuTrigger render={<PillItem …/>}/>`.
 */

/**
 * One group of the header (navigation on the left, the page's tools and the
 * global items on the right): a toolbar for screen readers, moved through
 * with the arrow keys.
 */
export function HeaderGroup({ label, className, children, ...props }: React.ComponentProps<"div"> & { label: string }) {
  return (
    <div
      role="toolbar"
      aria-label={label}
      data-header-group=""
      className={cn("flex min-w-0 shrink-0 items-center gap-2", className)}
      onKeyDown={(event) => {
        if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return
        const target = event.target as HTMLElement
        if (target.closest("input, textarea, [role=menu], [role=listbox]")) return
        const items = Array.from(event.currentTarget.querySelectorAll<HTMLElement>("button:not([disabled]), a[href], input"))
        const at = items.indexOf(target)
        if (at < 0) return
        const next = items[(at + (event.key === "ArrowRight" ? 1 : -1) + items.length) % items.length]
        next?.focus()
        event.preventDefault()
      }}
      {...props}
    >
      {children}
    </div>
  )
}

/** A capsule: glass (neutral) or tinted (the page's one primary action); `round` for a lone control (40 × 40). */
export function HeaderPill({
  tone = "glass",
  round = false,
  className,
  ...props
}: React.ComponentProps<"div"> & { tone?: "glass" | "tinted"; round?: boolean }) {
  return (
    <div
      data-header-pill={tone}
      className={cn(
        "flex h-(--shell-pill) shrink-0 items-center rounded-pill",
        round ? "w-(--shell-pill) justify-center" : "px-1",
        tone === "tinted" ? "glass-tinted" : "glass",
        className
      )}
      {...props}
    />
  )
}

/** A thin line between the parts of one pill (the filters, then «Colonne»). */
export function PillDivider({ className }: { className?: string }) {
  return <span aria-hidden className={cn("mx-0.5 h-4.5 w-px shrink-0 bg-(--hairline-strong)", className)} />
}

export type PillItemProps = React.ComponentProps<"button"> & {
  /** The item's icon (an svg element). */
  icon?: React.ReactNode
  /** Its words; none: icon only, then `aria-label` is required. */
  label?: React.ReactNode
  /** A set filter or the open state: the strong fill. */
  set?: boolean
  /** A ▾ after the label: it opens a menu. */
  chevron?: boolean
  /** A count after the label (Blu, white text): «Filtri 1». */
  count?: number
}

/**
 * One item of a pill: 32 high, radius 16, an icon and/or its words. Inside a
 * tinted pill its text is white. Icon-only items carry their name in
 * `aria-label` and, with `Hint`, a tooltip with their shortcut.
 */
export function PillItem({ icon, label, set, chevron, count, className, type = "button", ...props }: PillItemProps) {
  const iconOnly = !label
  return (
    <button
      type={type}
      data-pill-item=""
      data-set={set ? "" : undefined}
      className={cn(
        "inline-flex h-(--shell-pill-item) shrink-0 items-center gap-1.5 rounded-item text-[0.84375rem] font-[550] whitespace-nowrap outline-none select-none",
        "text-foreground transition-colors hover:bg-(--fill) disabled:pointer-events-none disabled:opacity-50 aria-expanded:bg-(--fill-strong) data-popup-open:bg-(--fill-strong)",
        "in-data-[header-pill=tinted]:text-white in-data-[header-pill=tinted]:hover:bg-white/15",
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4.25",
        iconOnly ? "w-(--shell-pill-item) justify-center" : "px-2.75",
        set && "bg-(--selection)",
        className
      )}
      {...props}
    >
      {icon}
      {label && <span className="min-w-0 truncate">{label}</span>}
      {count ? (
        <span className="grid h-4.5 min-w-4.5 place-items-center rounded-full bg-primary px-1.25 text-[0.65625rem] font-semibold text-primary-foreground tabular-nums">{count}</span>
      ) : null}
      {chevron && <ChevronDownIcon aria-hidden className="-ml-0.5 size-3.5! text-muted-foreground" />}
    </button>
  )
}

/** A shortcut as the platform writes it («⌘J», «Ctrl+J»), in the tooltip or a menu row. */
export function ShortcutKeys({ keys, className }: { keys: string; className?: string }) {
  return <Kbd className={cn("font-sans tabular-nums", className)}>{keys}</Kbd>
}

/**
 * The house rule: every icon-only control has a tooltip, and the tooltip
 * shows its shortcut («Indietro ⌘[»). `children` is the trigger element (a
 * PillItem, a Button, a menu trigger), composed through `render`.
 */
export function Hint({
  label,
  keys,
  side = "bottom",
  children,
}: {
  label: React.ReactNode
  keys?: string | null
  side?: "top" | "bottom" | "left" | "right"
  children: React.ReactElement
}) {
  return (
    <Tooltip>
      <TooltipTrigger render={children} />
      <TooltipContent side={side}>
        <span>{label}</span>
        {keys ? <ShortcutKeys keys={keys} /> : null}
      </TooltipContent>
    </Tooltip>
  )
}
