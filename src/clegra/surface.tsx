"use client"

import { cn } from "cn"

import { ToggleGroup, ToggleGroupItem } from "../components/toggle-group"

/*
 * The Clegra layer's surfaces (the design system §2, §4, §5, §8):
 * the floating panels, the scroll edge, the segmented control. Glass on
 * chrome only; content stays solid.
 */

/**
 * A window-level panel (the sidebar with the rail and the app's bar, the
 * Clegra panel): thick glass, radius 22, inset 8 from the window's edges
 * (the caller places it).
 */
export function FloatingPanel({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-floating-panel="" className={cn("glass-thick flex min-h-0 overflow-hidden rounded-panel", className)} {...props} />
}

/**
 * The scroll edge effect: one per scroller, at its top (under the floating
 * header) or its bottom (over the FAB or a floating composer). Place it as
 * the first child of a `relative` box that holds the scroller.
 */
export function ScrollEdge({ side = "top", className }: { side?: "top" | "bottom"; className?: string }) {
  return (
    <div
      aria-hidden
      data-side={side}
      className={cn("scroll-edge absolute inset-x-0 z-10", side === "top" ? "top-0" : "bottom-0", className)}
    />
  )
}

/**
 * A segmented control: a capsule track of `--fill`, the chosen segment
 * Foglio with a small shadow (the strong fill in dark). One value.
 * «Tutti · Non letti · Con allegati», calendar views.
 */
export function Segmented<T extends string>({
  value,
  onValueChange,
  items,
  label,
  className,
}: {
  value: T
  onValueChange: (value: T) => void
  items: { value: T; label: React.ReactNode }[]
  label: string
  className?: string
}) {
  return (
    <ToggleGroup
      aria-label={label}
      value={[value]}
      onValueChange={(next: unknown[]) => {
        const picked = next[0] as T | undefined
        if (picked) onValueChange(picked)
      }}
      className={cn("h-8 gap-0 rounded-full bg-(--fill) p-0.5", className)}
    >
      {items.map((item) => (
        <ToggleGroupItem
          key={item.value}
          value={item.value}
          className="h-7 rounded-full px-3 text-[0.8125rem] font-medium data-pressed:bg-card data-pressed:shadow-sm dark:data-pressed:bg-(--fill-strong)"
        >
          {item.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}
