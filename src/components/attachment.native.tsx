import { Children, createContext, isValidElement, useContext, useEffect, useMemo, useRef, type ReactElement, type ReactNode } from "react"
import { Animated, Pressable, ScrollView, StyleSheet } from "react-native"

import { IconContext } from "../native/icon-context"
import { rendered } from "../native/slot"
import { useColors } from "../native/theme"
import { Div, Span, type BoxProps } from "../primitives.native"
import { Button, type ButtonProps } from "./button.native"

type AttachmentState = "idle" | "uploading" | "processing" | "error" | "done"
type AttachmentSize = "default" | "sm" | "xs"
type AttachmentOrientation = "horizontal" | "vertical"

const AttachmentContext = createContext<{ state: AttachmentState; size: AttachmentSize; orientation: AttachmentOrientation }>({ state: "done", size: "default", orientation: "horizontal" })

/** The web's `has-data-[slot=…]` paddings: with media, p (it wins in the web's CSS order); with text alone, px/py. */
const paddings: Record<AttachmentSize, { content: string; media: string; gap: string; text: string }> = {
  default: { content: "px-2.5 py-2", media: "p-2", gap: "gap-2", text: "text-sm" },
  sm: { content: "px-2 py-1.5", media: "p-1.5", gap: "gap-2.5", text: "text-xs" },
  xs: { content: "px-1.5 py-1", media: "p-1", gap: "gap-1.5", text: "text-xs" },
}
const mediaWidths: Record<AttachmentSize, number> = { default: 40, sm: 32, xs: 28 }

/**
 * A file in a conversation or a composer: a bordered card with its media
 * (icon, image or spinner), its name and details, and its actions. Dashed while
 * idle, red while in error.
 */
export function Attachment({ className = "", state = "done", size = "default", orientation = "horizontal", style, children, ...props }: BoxProps & { state?: AttachmentState; size?: AttachmentSize | null; orientation?: AttachmentOrientation | null }) {
  const colors = useColors()
  const s = size ?? "default"
  const o = orientation ?? "horizontal"
  const slots = Children.toArray(children).filter(isValidElement).map((child) => child.type)
  const content = slots.includes(AttachmentContent)
  const media = slots.includes(AttachmentMedia)
  const pad = media ? paddings[s].media : content ? paddings[s].content : ""
  const shape = o === "vertical" ? `flex-col ${content ? "w-30" : "w-24"}` : "flex-row items-center min-w-40"
  const border = state === "error" ? { borderColor: `${colors.destructive}4d` } : state === "idle" ? { borderStyle: "dashed" as const } : null
  return (
    <AttachmentContext.Provider value={{ state, size: s, orientation: o }}>
      <Div data-slot="attachment" {...props} className={`relative flex max-w-full min-w-0 shrink-0 flex-wrap ${s === "xs" ? "rounded-2xl" : "rounded-3xl"} border bg-card text-card-foreground ${paddings[s].gap} ${paddings[s].text} ${pad} ${shape} ${className}`} style={[{ alignSelf: "flex-start", width: o === "vertical" ? (content ? 120 : 96) : undefined }, border, style]}>
        {children}
      </Div>
    </AttachmentContext.Provider>
  )
}

/** The square on the left (or on top): an icon, an image, a spinner. */
export function AttachmentMedia({ className = "", variant = "icon", style, children, ...props }: BoxProps & { variant?: "icon" | "image" | null }) {
  const { state, size, orientation } = useContext(AttachmentContext)
  const colors = useColors()
  const error = state === "error"
  const vertical = orientation === "vertical"
  const dim = variant === "image" && state !== "done" && state !== "idle"
  const icon = vertical ? 24 : size === "xs" ? 14 : 16
  return (
    <Div data-slot="attachment-media" {...props} className={`relative flex shrink-0 items-center justify-center overflow-hidden ${size === "xs" ? "rounded-xl" : "rounded-2xl"} ${error ? "bg-destructive/10 text-destructive" : "bg-muted text-foreground"} ${className}`} style={[{ width: vertical ? "100%" : mediaWidths[size], aspectRatio: 1, opacity: dim ? 0.6 : 1 }, style]}>
      <IconContext.Provider value={{ size: icon, color: error ? colors.destructive : colors.foreground }}>{children}</IconContext.Provider>
    </Div>
  )
}

export function AttachmentContent({ className = "", style, ...props }: BoxProps) {
  const { orientation } = useContext(AttachmentContext)
  return <Div data-slot="attachment-content" {...props} className={`max-w-full min-w-0 ${orientation === "vertical" ? "px-1" : ""} ${className}`} style={[{ flex: orientation === "vertical" ? undefined : 1 }, style]} />
}

/** While uploading or processing the name pulses, as the web's shimmer runs over it. */
function useShimmer(on: boolean) {
  const value = useRef(new Animated.Value(1)).current
  useEffect(() => {
    if (!on) return value.setValue(1)
    const loop = Animated.loop(Animated.sequence([Animated.timing(value, { toValue: 0.45, duration: 700, useNativeDriver: false }), Animated.timing(value, { toValue: 1, duration: 700, useNativeDriver: false })]))
    loop.start()
    return () => loop.stop()
  }, [on, value])
  return value
}

/** The title inherits leading-tight (1.25 of the card's size); the description's text-xs keeps its own 16 px. */
const tight = (size: AttachmentSize) => (size === "default" ? 17.5 : 15)

export function AttachmentTitle({ className = "", style, ...props }: BoxProps) {
  const { state, size } = useContext(AttachmentContext)
  const opacity = useShimmer(state === "uploading" || state === "processing")
  return (
    <Animated.View style={{ opacity }}>
      <Span data-slot="attachment-title" {...props} className={`truncate font-medium ${className}`} style={[{ lineHeight: tight(size) }, style]} />
    </Animated.View>
  )
}

export function AttachmentDescription({ className = "", style, ...props }: BoxProps) {
  const { state } = useContext(AttachmentContext)
  return <Span data-slot="attachment-description" {...props} className={`mt-0.5 truncate text-xs ${state === "error" ? "text-destructive/80" : "text-muted-foreground"} ${className}`} style={[{ lineHeight: 16 }, style]} />
}

export function AttachmentActions({ className = "", ...props }: BoxProps) {
  const { orientation } = useContext(AttachmentContext)
  return <Div data-slot="attachment-actions" {...props} className={`relative flex flex-row shrink-0 items-center ${orientation === "vertical" ? "absolute top-3 right-3 gap-1" : ""} ${className}`} style={{ zIndex: 20 }} />
}

export function AttachmentAction({ variant, size = "icon-xs", ...props }: ButtonProps) {
  return <Button data-slot="attachment-action" variant={variant ?? "ghost"} size={size} {...props} />
}

/** The whole card as one button (open the file), under the actions. */
export function AttachmentTrigger({ render, onClick, children, ...props }: { render?: ReactElement; onClick?: (event: unknown) => void; children?: ReactNode; "aria-label"?: string }) {
  const style = useMemo(() => [StyleSheet.absoluteFill, { zIndex: 10 }], [])
  return rendered(render, { ...props, onClick, style }, () => (
    <Pressable accessibilityRole="button" accessibilityLabel={props["aria-label"]} onPress={onClick} style={style}>
      {children}
    </Pressable>
  ), children)
}

/** A row of attachments that scrolls sideways. */
export function AttachmentGroup({ className = "", children }: BoxProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 4 }}>
      <Div className={`flex flex-row min-w-0 gap-3 ${className}`}>{children}</Div>
    </ScrollView>
  )
}
