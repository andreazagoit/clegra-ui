import { Children, createContext, useContext, useState, type ReactElement, type ReactNode } from "react"
import { View } from "react-native"

import { MessageContext } from "../native/chat-context"
import { rendered } from "../native/slot"
import { useColors, useResolvedTheme } from "../native/theme"
import { Div, Span, type BoxProps } from "../primitives.native"

export type BubbleVariant = "default" | "secondary" | "muted" | "tinted" | "outline" | "ghost" | "destructive"

const BubbleContext = createContext<{ variant: BubbleVariant; align: "start" | "end" }>({ variant: "default", align: "start" })

/** The web's `oklch(from var(--primary) 0.93 calc(c*0.4) h)` (light) and `0.3` (dark), worked out from the primary. */
const tinted = { light: "#f5d8ff", dark: "#372051" }

const looks: Record<BubbleVariant, string> = {
  default: "bg-primary text-primary-foreground",
  secondary: "bg-secondary text-secondary-foreground",
  muted: "bg-muted",
  tinted: "text-foreground",
  outline: "border-border bg-background",
  ghost: "rounded-none bg-transparent",
  destructive: "bg-destructive/10 text-destructive dark:bg-destructive/20",
}

export function BubbleGroup({ className = "", ...props }: BoxProps) {
  return <Div data-slot="bubble-group" {...props} className={`flex min-w-0 flex-col gap-2 ${className}`} />
}

/** One bubble: at most 80% of the row wide, on the side of its message (or its own `align`). */
export function Bubble({ variant = "default", align = "start", className = "", style, ...props }: BoxProps & { variant?: BubbleVariant | null; align?: "start" | "end" }) {
  const message = useContext(MessageContext)
  const look = variant ?? "default"
  const end = align === "end" || message?.align === "end"
  return (
    <BubbleContext.Provider value={{ variant: look, align }}>
      <Div data-slot="bubble" {...props} className={`relative flex min-w-0 flex-col gap-1 ${className}`} style={[{ alignSelf: end ? "flex-end" : "flex-start", maxWidth: look === "ghost" ? "100%" : "80%" }, style]} />
    </BubbleContext.Provider>
  )
}

/** Text runs at the web's leading-relaxed for text-sm (1.625 × 14 px). */
const relaxed = (children: ReactNode) => Children.map(children, (child) => (typeof child === "string" || typeof child === "number" ? <Span style={{ lineHeight: 22.75 }}>{child}</Span> : child))

/** The bubble's body; `render` makes it a link or a button (a pressable bubble). */
export function BubbleContent({ className = "", render, children, style, ...props }: BoxProps & { render?: ReactElement }) {
  const { variant, align } = useContext(BubbleContext)
  const dark = useResolvedTheme() === "dark"
  const classes = `max-w-full min-w-0 overflow-hidden rounded-3xl border border-transparent ${variant === "ghost" ? "" : "px-3.5 py-2.5"} text-sm ${looks[variant]} ${className}`
  const box = [{ alignSelf: align === "end" ? "flex-end" : "flex-start" }, variant === "tinted" ? { backgroundColor: dark ? tinted.dark : tinted.light } : null, style]
  return rendered(render, { ...props, className: classes, style: box }, () => (
    <Div data-slot="bubble-content" {...props} className={classes} style={box}>
      {relaxed(children)}
    </Div>
  ), relaxed(children))
}

/**
 * Reactions pinned to the bubble's edge, three quarters outside it, ringed
 * with the card's colour (the web's ring-3 ring-card, drawn as a border).
 */
export function BubbleReactions({ side = "bottom", align = "end", className = "", style, children, ...props }: BoxProps & { align?: "start" | "end"; side?: "top" | "bottom" }) {
  const colors = useColors()
  const [height, setHeight] = useState(0)
  const inner = Math.max(0, height - 6)
  const shift = side === "bottom" ? inner * 0.75 : -inner * 0.75
  const pressable = Children.toArray(children).some((child) => (child as ReactElement)?.props && "onClick" in ((child as ReactElement).props as object))
  return (
    <View
      onLayout={(event) => setHeight(event.nativeEvent.layout.height)}
      style={{ position: "absolute", zIndex: 10, [side]: -3, [align === "start" ? "left" : "right"]: 9, borderWidth: 3, borderColor: colors.card, borderRadius: 9999, transform: [{ translateY: shift }], opacity: height ? 1 : 0 }}
    >
      <Div data-slot="bubble-reactions" {...props} className={`flex flex-row shrink-0 items-center justify-center gap-1 rounded-full bg-muted text-sm ${pressable ? "" : "px-1.5 py-0.5"} ${className}`} style={style}>
        {children}
      </Div>
    </View>
  )
}
