import { Children, createContext, isValidElement, useContext, useMemo, type ReactElement, type ReactNode } from "react"
import { Text } from "react-native"

import { IconContext } from "../native/icon-context"
import { rendered } from "../native/slot"
import { fonts, useColors } from "../native/theme"
import { useTw } from "../native/use-tw"
import { Div, type BoxProps } from "../primitives.native"
import { type as typeScale } from "../tokens"
import { Separator } from "./separator.native"

type Size = "default" | "sm" | "xs"
type Variant = "default" | "outline" | "muted"
const ItemSize = createContext<Size>("default")

const variants: Record<Variant, string> = { default: "border-transparent", outline: "border-border", muted: "border-transparent bg-muted/50" }
const sizes: Record<Size, string> = { default: "gap-3.5 px-4 py-3.5", sm: "gap-3.5 px-3.5 py-3", xs: "gap-2.5 px-3 py-2.5" }

/** The web's class builder (cva), for a row drawn by hand. */
export function itemVariants({ variant = "default", size = "default", className = "" }: { variant?: Variant | null; size?: Size | null; className?: string } = {}) {
  return `flex flex-row w-full flex-wrap items-center rounded-2xl border text-sm ${variants[variant ?? "default"]} ${sizes[size ?? "default"]} ${className}`
}

/** gap-4, or tighter when it holds small items (has-data-[size=sm]:gap-2.5, xs: gap-2). */
export function ItemGroup({ className = "", children, ...props }: BoxProps) {
  const sizes = Children.toArray(children).map((child) => (isValidElement<{ size?: Size }>(child) ? child.props.size : undefined))
  const gap = sizes.includes("xs") ? "gap-2" : sizes.includes("sm") ? "gap-2.5" : "gap-4"
  return (
    <Div role="list" {...props} className={`flex flex-col w-full ${gap} ${className}`}>
      {children}
    </Div>
  )
}

export function ItemSeparator({ className = "" }: { className?: string }) {
  return <Separator orientation="horizontal" className={`my-2 ${className}`} />
}

export function Item({ className, variant = "default", size = "default", render, children, ...props }: BoxProps & { variant?: Variant | null; size?: Size | null; render?: ReactElement }) {
  const classes = itemVariants({ variant, size, className })
  return (
    <ItemSize.Provider value={size ?? "default"}>
      {rendered(render, { ...props, className: classes }, (p) => <Div {...p}>{children}</Div>, children)}
    </ItemSize.Provider>
  )
}

const mediaSizes: Record<Size, string> = { default: "size-10 rounded-xl", sm: "size-8 rounded-xl", xs: "size-6 rounded-lg" }

export function ItemMedia({ className = "", variant = "default", children, ...props }: BoxProps & { variant?: "default" | "icon" | "image" | null }) {
  const size = useContext(ItemSize)
  const around = useContext(IconContext)
  const icons = useMemo(() => (variant === "icon" ? { ...around, size: 16 } : around), [around, variant])
  const look = variant === "image" ? `overflow-hidden ${mediaSizes[size]}` : ""
  return (
    <IconContext.Provider value={icons}>
      <Div {...props} className={`flex flex-row shrink-0 items-center justify-center gap-2 ${look} ${className}`}>
        {children}
      </Div>
    </IconContext.Provider>
  )
}

export function ItemContent({ className = "", children, ...props }: BoxProps) {
  const size = useContext(ItemSize)
  return (
    <Div {...props} className={`flex flex-col flex-1 ${size === "xs" ? "gap-0.5" : "gap-1"} ${className}`}>
      {children}
    </Div>
  )
}

/** text-sm with leading-snug (1.375), one line. */
export function ItemTitle({ className = "", children, ...props }: BoxProps) {
  const colors = useColors()
  const line = (text: string, key?: number) => (
    <Text key={key} numberOfLines={1} style={{ fontSize: 14, lineHeight: 19.25, fontWeight: "500", fontFamily: fonts.sans, color: colors.foreground }}>
      {text}
    </Text>
  )
  const parts = (Array.isArray(children) ? children : [children]) as ReactNode[]
  return (
    <Div {...props} className={`flex flex-row self-start items-center gap-2 ${className}`}>
      {parts.map((child, index) => (typeof child === "string" || typeof child === "number" ? line(String(child), index) : child))}
    </Div>
  )
}

/** Muted text, at most two lines. */
export function ItemDescription({ className = "", children }: BoxProps) {
  const colors = useColors()
  const own = useTw(className).text
  return (
    <Text numberOfLines={2} style={[typeScale.sm, { fontFamily: fonts.sans, color: colors.mutedForeground, textAlign: "left" }, own]}>
      {children}
    </Text>
  )
}

export function ItemActions({ className = "", children, ...props }: BoxProps) {
  return (
    <Div {...props} className={`flex flex-row items-center gap-2 ${className}`}>
      {children}
    </Div>
  )
}

const row = (base: string) =>
  function Part({ className = "", children, ...props }: BoxProps) {
    return (
      <Div {...props} className={`${base} ${className}`}>
        {children}
      </Div>
    )
  }

export const ItemHeader = row("flex flex-row w-full items-center justify-between gap-2")
export const ItemFooter = row("flex flex-row w-full items-center justify-between gap-2")
