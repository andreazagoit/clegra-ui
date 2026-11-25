"use client"

import { cn } from "cn"

/*
 * The Clegra layer's surfaces (the design system §2, §4, §5, §8):
 * the floating panels and the scroll edge (the segmented control is
 * `clegra/segmented`). Glass on
 * chrome only; content stays solid.
 */

/**
 * A window-level panel (a rail's block, the app's bar, a sidebar page's list,
 * the Clegra panel): the panels' one surface (`.surface-panel`, --panel, the
 * hairline, no shadow), radius 22, inset 8 from the window's edges (the
 * caller places it).
 */
export function FloatingPanel({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-floating-panel="" className={cn("surface-panel flex min-h-0 overflow-hidden rounded-panel", className)} {...props} />
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
