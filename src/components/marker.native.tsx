import { useContext, type ReactElement } from "react"

import { IconContext } from "../native/icon-context"
import { rendered } from "../native/slot"
import { Div, Span, type BoxProps } from "../primitives.native"

type MarkerVariant = "default" | "separator" | "border"

const looks: Record<MarkerVariant, string> = { default: "", separator: "", border: "border-b border-border pb-2" }

/** The web's classes, as far as a view shows them (the separator's rules are drawn by Marker). */
export function markerVariants({ variant = "default", className = "" }: { variant?: MarkerVariant | null; className?: string } = {}) {
  return `relative flex flex-row min-h-4 w-full items-center gap-2 text-left text-sm text-muted-foreground ${looks[variant ?? "default"]} ${className}`
}

/** A rule of the separator variant: the web's ::before and ::after, a hairline that takes the free width. */
const Rule = ({ side }: { side: "before" | "after" }) => <Div className={`${side === "before" ? "mr-1" : "ml-1"} h-px min-w-0 flex-1 bg-border`} />

/**
 * A line in a conversation that is not a message: a date, «conversation
 * archived», a separator with a label in the middle.
 */
export function Marker({ className, variant = "default", render, children, ...props }: BoxProps & { variant?: MarkerVariant | null; render?: ReactElement }) {
  const classes = markerVariants({ variant, className })
  const separator = variant === "separator"
  const body = (
    <>
      {separator ? <Rule side="before" /> : null}
      {children}
      {separator ? <Rule side="after" /> : null}
    </>
  )
  return rendered(render, { ...props, className: classes, "data-slot": "marker" }, () => (
    <Div {...props} data-slot="marker" className={classes}>
      {body}
    </Div>
  ), body)
}

/** The icon keeps the marker's colour, as `currentColor` does on the web. */
export function MarkerIcon({ className = "", children, ...props }: BoxProps) {
  const around = useContext(IconContext)
  return (
    <Div aria-hidden {...props} className={`size-4 shrink-0 items-center justify-center ${className}`}>
      <IconContext.Provider value={{ size: 16, ...around }}>{children}</IconContext.Provider>
    </Div>
  )
}

export function MarkerContent({ className = "", ...props }: BoxProps) {
  return <Span {...props} className={`min-w-0 ${className}`} />
}
