"use client"

import { useRef } from "react"
import { cn } from "cn"

import { HeaderPill, Hint, PillItem } from "./pill"

/*
 * THE SEGMENTED CONTROL (the design system §3, §8): one choice among a few, drawn as the header's pills draw
 * everything. In the header it IS a pill (`surface="glass"`: 40 high, radius 20, the glass, items of 32, radius 16,
 * the pills' type); in content the same segments sit on a capsule track of `--fill` (`surface="fill"`). The chosen
 * segment is the selected state (the glass fill in the app's colour, `brand/theme.css`). A radiogroup for screen
 * readers: one tab stop (the chosen segment), the arrow keys (and Home/End) move and choose, as a native
 * radiogroup does; a header group's own arrows do not also move. Icon-only segments carry their name in
 * `aria-label` and a tooltip; labelled segments get a tooltip when they have a `hint` or `keys`.
 */

export type SegmentedItem<T extends string> = {
  value: T
  /** The segment's name: its words, or (icon-only) its `aria-label` and tooltip. */
  label: string
  /** An svg element: beside the words, or alone with `iconOnly`. */
  icon?: React.ReactNode
  /** The tooltip's words, when they say more than the label («Mostra come elenco»). */
  hint?: string
  /** The shortcut shown in the tooltip («V», «⌘1»). */
  keys?: string | null
  /** Data attributes (test hooks) on the segment's button. */
  data?: Record<`data-${string}`, string>
}

export function SegmentedControl<T extends string>({
  value,
  onValueChange,
  items,
  label,
  iconOnly = false,
  surface = "glass",
  className,
  itemClassName,
  ...props
}: Omit<React.ComponentProps<"div">, "onChange" | "children"> & {
  value: T
  onValueChange: (value: T) => void
  items: SegmentedItem<T>[]
  /** The group's name for screen readers («Vista»). */
  label: string
  /** Icons only (each segment then needs an `icon`): Finder's list · icons. */
  iconOnly?: boolean
  /** `glass`: a header pill; `fill`: a capsule track of `--fill`, in content. */
  surface?: "glass" | "fill"
  itemClassName?: string
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([])
  const at = Math.max(0, items.findIndex((item) => item.value === value))

  const onKeyDown = (event: React.KeyboardEvent) => {
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key]
    // From the focused segment (as a native radiogroup), else the chosen one.
    const focused = refs.current.findIndex((el) => el === event.target)
    const from = focused < 0 ? at : focused
    const to = event.key === "Home" ? 0 : event.key === "End" ? items.length - 1 : step === undefined ? -1 : (from + step + items.length) % items.length
    if (to < 0) return
    event.preventDefault()
    event.stopPropagation()
    refs.current[to]?.focus()
    if (to !== at) onValueChange(items[to]!.value)
  }

  const segments = items.map((item, index) => {
    const on = index === at
    const button = (
      <PillItem
        key={item.value}
        ref={(el) => {
          refs.current[index] = el
        }}
        role="radio"
        aria-checked={on}
        aria-label={iconOnly ? item.label : undefined}
        tabIndex={on ? 0 : -1}
        icon={item.icon}
        label={iconOnly ? undefined : item.label}
        set={on}
        data-segment={item.value}
        className={itemClassName}
        onClick={() => {
          if (!on) onValueChange(item.value)
        }}
        {...item.data}
      />
    )
    return iconOnly || item.hint || item.keys ? (
      <Hint key={item.value} label={item.hint ?? item.label} keys={item.keys}>
        {button}
      </Hint>
    ) : (
      button
    )
  })

  const shared = { role: "radiogroup", "aria-label": label, "data-segmented": surface, onKeyDown, ...props }
  return surface === "glass" ? (
    <HeaderPill {...shared} className={className}>
      {segments}
    </HeaderPill>
  ) : (
    <div {...shared} className={cn("inline-flex h-9 w-fit shrink-0 items-center gap-0.5 rounded-pill bg-(--fill) p-0.5", className)}>
      {segments}
    </div>
  )
}
