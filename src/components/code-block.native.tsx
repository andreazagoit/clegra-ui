import * as L from "lucide-react-native"
import * as RN from "react-native"
import { Children, createContext, isValidElement, useContext, useEffect, useState, type ComponentType, type ReactNode } from "react"
import { ScrollView, StyleSheet, View } from "react-native"

import { wrapIcon, type IconProps } from "../native/icons"
import { fonts, useColors } from "../native/theme"
import { Div, Span, type BoxProps } from "../primitives.native"
import { Button, type ButtonProps } from "./button.native"

const CheckIcon = wrapIcon("CheckIcon", L.CheckIcon as unknown as ComponentType<IconProps>)
const CopyIcon = wrapIcon("CopyIcon", L.CopyIcon as unknown as ComponentType<IconProps>)

type Size = "default" | "sm"
type Variant = "default" | "destructive"

const BlockContext = createContext<{ size: Size; variant: Variant; header: boolean; footer: boolean } | null>(null)
const InHeader = createContext(false)
const Numbered = createContext(false)

/** leading-relaxed of the block's text size. */
const lineHeight = (size: Size) => (size === "sm" ? 19.5 : 22.75)

/**
 * Code in a muted box with a hairline ring (drawn over it, so it takes no
 * room, as the web's ring-1). Header and footer change the content's padding,
 * as the web's `group-has-*` selectors do.
 */
export function CodeBlock({ className = "", variant = "default", size = "default", style, children, ...props }: BoxProps & { variant?: Variant | null; size?: Size }) {
  const colors = useColors()
  const v = variant ?? "default"
  const types = Children.toArray(children).filter(isValidElement).map((child) => child.type)
  const ring = v === "destructive" ? `${colors.destructive}26` : colors.foreground === "#fafafa" ? "rgba(250,250,250,0.1)" : "rgba(10,10,10,0.05)"
  return (
    <BlockContext.Provider value={{ size, variant: v, header: types.includes(CodeBlockHeader), footer: types.includes(CodeBlockFooter) }}>
      <Div data-slot="code-block" {...props} className={`relative flex w-full min-w-0 flex-col overflow-hidden ${size === "sm" ? "rounded-xl text-xs" : "rounded-2xl text-sm"} ${v === "destructive" ? "bg-destructive/5 text-destructive dark:bg-destructive/10" : "bg-muted text-foreground"} ${className}`} style={style}>
        {children}
        <View pointerEvents="none" style={[StyleSheet.absoluteFill, { borderWidth: 1, borderColor: ring, borderRadius: size === "sm" ? 19.6 : 25.2 }]} />
      </Div>
    </BlockContext.Provider>
  )
}

export function CodeBlockHeader({ className = "", ...props }: BoxProps) {
  const block = useContext(BlockContext)
  return (
    <InHeader.Provider value>
      <Div data-slot="code-block-header" {...props} className={`flex flex-row min-w-0 shrink-0 items-center gap-2 ${block?.size === "sm" ? "px-3 pt-3" : "px-5 pt-5"} ${block?.variant === "destructive" ? "text-destructive" : "text-muted-foreground"} ${className}`} />
    </InHeader.Provider>
  )
}

export function CodeBlockTitle({ className = "", ...props }: BoxProps) {
  const block = useContext(BlockContext)
  return <Div data-slot="code-block-title" {...props} className={`flex flex-row min-w-0 items-center gap-1.5 font-medium ${block?.size === "sm" ? "text-xs" : "text-sm"} ${block?.variant === "destructive" ? "text-destructive" : "text-foreground"} ${className}`} />
}

/** In the header, at its end; straight in the block, floating at its top corner (always shown: no hover on touch). */
export function CodeBlockActions({ className = "", style, ...props }: BoxProps) {
  const header = useContext(InHeader)
  const sm = useContext(BlockContext)?.size === "sm"
  const floating = header ? null : { position: "absolute" as const, top: sm ? 8 : 16, right: sm ? 8 : 16, zIndex: 10 }
  return <Div data-slot="code-block-actions" {...props} className={`flex flex-row shrink-0 items-center gap-1 ${header ? "ml-auto -my-1 -mr-1.5" : ""} ${className}`} style={[floating, style]} />
}

/** The clipboard: the browser's where there is one, else React Native's. */
function copy(value: string) {
  const clipboard = (globalThis as { navigator?: { clipboard?: { writeText: (text: string) => Promise<void> } } }).navigator?.clipboard
  if (clipboard) return clipboard.writeText(value)
  ;(RN as unknown as { Clipboard: { setString: (text: string) => void } }).Clipboard.setString(value)
  return Promise.resolve()
}

/** Copies `value`; the icon turns into a tick for two seconds. */
export function CodeBlockCopyButton({ value, variant = "ghost", size = "icon-xs", onClick, className = "", ...props }: ButtonProps & { value: string }) {
  const [copied, setCopied] = useState(false)
  const header = useContext(InHeader)
  const colors = useColors()
  useEffect(() => {
    if (!copied) return
    const timeout = setTimeout(() => setCopied(false), 2000)
    return () => clearTimeout(timeout)
  }, [copied])
  const floating = header ? undefined : { backgroundColor: colors.background, borderWidth: 1, borderColor: colors.foreground === "#fafafa" ? "rgba(250,250,250,0.1)" : "rgba(10,10,10,0.1)" }
  return (
    <Button
      data-slot="code-block-copy-button"
      variant={variant}
      size={size}
      aria-label={copied ? "Copied" : "Copy"}
      className={`text-muted-foreground ${className}`}
      style={floating}
      onClick={(event) => {
        onClick?.(event)
        copy(value).then(() => setCopied(true)).catch(() => {})
      }}
      {...props}
    >
      {copied ? <CheckIcon /> : <CopyIcon />}
    </Button>
  )
}

/** The code: monospaced, scrolling sideways unless `wrap`; a string with `lineNumbers` becomes numbered lines. */
export function CodeBlockContent({ className = "", children, style, wrap = false, lineNumbers = false, startLine = 1 }: BoxProps & { wrap?: boolean; lineNumbers?: boolean; startLine?: number }) {
  const block = useContext(BlockContext)
  const sm = block?.size === "sm"
  const [width, setWidth] = useState(0)
  // Small blocks keep py-3 at the bottom even with a footer: it wins over pb-2 in the web's CSS.
  const pad = sm ? { paddingHorizontal: 12, paddingTop: block?.header ? 6 : 12, paddingBottom: 12 } : { paddingHorizontal: 20, paddingTop: block?.header ? 8 : 20, paddingBottom: block?.footer ? 8 : 20 }
  const lines =
    lineNumbers && typeof children === "string"
      ? children
          .replace(/\n$/, "")
          .split("\n")
          .map((line, index) => (
            <CodeBlockLine key={index} number={startLine + index}>
              {line}
            </CodeBlockLine>
          ))
      : typeof children === "string"
        ? <Code>{children}</Code>
        : Children.map(children, (child, index) => (isValidElement(child) && child.type === CodeBlockLine && lineNumbers ? <CodeBlockLine {...(child.props as object)} number={startLine + index} /> : child))
  const body = (
    <Numbered.Provider value={lineNumbers}>
      <Div className={`flex flex-col ${className}`} style={[pad, { minWidth: wrap ? undefined : width }, style]}>
        {lines}
      </Div>
    </Numbered.Provider>
  )
  return wrap ? body : (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} onLayout={(event) => setWidth(event.nativeEvent.layout.width)}>
      {body}
    </ScrollView>
  )
}

function Code({ children, color }: { children: ReactNode; color?: string }) {
  const block = useContext(BlockContext)
  const size = block?.size ?? "default"
  return <Span style={{ fontFamily: fonts.mono, fontSize: size === "sm" ? 12 : 14, lineHeight: lineHeight(size), color }}>{children}</Span>
}

const lineLooks = { default: "", added: "bg-foreground/5", removed: "bg-destructive/10", highlighted: "bg-foreground/5" } as const

/** A line: its number in a column, its mark (+ or −) in the margin, its background for added, removed, highlighted. */
export function CodeBlockLine({ className = "", variant = "default", children, number }: BoxProps & { variant?: keyof typeof lineLooks | null; number?: number }) {
  const colors = useColors()
  const block = useContext(BlockContext)
  const numbered = useContext(Numbered)
  const sm = block?.size === "sm"
  const v = variant ?? "default"
  const mark = v === "added" ? "+" : v === "removed" ? "−" : null
  const empty = children === undefined || children === null || children === "" || (Array.isArray(children) && children.length === 0)
  return (
    <Div data-slot="code-block-line" className={`relative flex flex-row ${lineLooks[v]} ${className}`} style={{ marginHorizontal: sm ? -12 : -20, paddingHorizontal: sm ? 12 : 20, columnGap: 12, minHeight: lineHeight(block?.size ?? "default") }}>
      {mark ? (
        <View style={{ position: "absolute", left: 4, top: 0 }}>
          <Code color={v === "removed" ? colors.destructive : colors.mutedForeground}>{mark}</Code>
        </View>
      ) : null}
      {numbered && number !== undefined ? (
        <View style={{ minWidth: 24, alignItems: "flex-end" }}>
          <Code color={colors.mutedForeground}>{String(number)}</Code>
        </View>
      ) : null}
      <View style={{ minWidth: 0 }}>{typeof children === "string" || empty ? <Code>{empty ? " " : children}</Code> : children}</View>
    </Div>
  )
}

export function CodeBlockFooter({ className = "", ...props }: BoxProps) {
  const block = useContext(BlockContext)
  return <Div data-slot="code-block-footer" {...props} className={`flex flex-row min-w-0 shrink-0 items-center gap-2 ${block?.size === "sm" ? "px-3 pb-3" : "px-5 pb-5"} text-muted-foreground ${className}`} />
}
