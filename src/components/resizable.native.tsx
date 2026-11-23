import { Children, cloneElement, createContext, isValidElement, useContext, useRef, useState, type ReactNode } from "react"
import { View, type GestureResponderEvent, type LayoutChangeEvent } from "react-native"

import { useColors } from "../native/theme"
import { Div, type BoxProps } from "../primitives.native"

type Orientation = "horizontal" | "vertical"
/** react-resizable-panels' sizes: a number is pixels, a string is a percentage ("50" or "50%"). */
type Size = number | string

type Group = {
  orientation: Orientation
  sizes: number[]
  /** Moves the border after panel `index` by `delta` pixels, from the sizes when the drag began. */
  drag: (index: number, delta: number, from: number[]) => void
}
const GroupContext = createContext<Group | null>(null)

const percent = (size: Size | undefined, total: number) => (size === undefined ? undefined : typeof size === "number" ? (total ? (size / total) * 100 : undefined) : Number.parseFloat(size))

type PanelProps = BoxProps & { defaultSize?: Size; minSize?: Size; maxSize?: Size; id?: string; onResize?: (size: { asPercentage: number; inPixels: number }) => void; index?: number }
type HandleProps = { withHandle?: boolean; className?: string; disabled?: boolean; index?: number }

/** The panels side by side (or stacked); dragging a handle moves the border between its two panels. */
export function ResizablePanelGroup({ orientation = "horizontal", className = "", style, children, onLayoutChange, ...props }: BoxProps & { orientation?: Orientation; onLayoutChange?: (layout: Record<string, number>) => void }) {
  const items = Children.toArray(children).filter(isValidElement)
  const panels = items.filter((child) => child.type === ResizablePanel) as React.ReactElement<PanelProps>[]
  const [total, setTotal] = useState(0)
  const [own, setOwn] = useState<number[] | null>(null)
  const limits = panels.map((panel) => ({ min: percent(panel.props.minSize, total) ?? 0, max: percent(panel.props.maxSize, total) ?? 100 }))
  const initial = () => {
    const given = panels.map((panel) => percent(panel.props.defaultSize, total))
    const known = given.reduce<number>((sum, size) => sum + (size ?? 0), 0)
    const rest = given.filter((size) => size === undefined).length
    return given.map((size) => size ?? (rest ? (100 - known) / rest : 0))
  }
  const sizes = own ?? initial()
  const drag = (index: number, delta: number, from: number[]) => {
    if (!total) return
    const change = (delta / total) * 100
    const a = limits[index]!
    const b = limits[index + 1]!
    const pair = from[index]! + from[index + 1]!
    let first = Math.min(Math.max(from[index]! + change, a.min, pair - b.max), a.max, pair - b.min)
    first = Math.max(0, Math.min(pair, first))
    const next = [...from]
    next[index] = first
    next[index + 1] = pair - first
    setOwn(next)
    panels.forEach((panel, i) => panel.props.onResize?.({ asPercentage: next[i]!, inPixels: (next[i]! / 100) * total }))
    onLayoutChange?.(Object.fromEntries(panels.map((panel, i) => [panel.props.id ?? String(i), next[i]!])))
  }
  let panel = 0
  let handle = 0
  const laidOut = items.map((child) => (child.type === ResizablePanel ? cloneElement(child as React.ReactElement<PanelProps>, { index: panel++ }) : child.type === ResizableHandle ? cloneElement(child as React.ReactElement<HandleProps>, { index: handle++ }) : child))
  const measure = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout
    setTotal(orientation === "horizontal" ? width : height)
  }
  return (
    <GroupContext.Provider value={{ orientation, sizes, drag }}>
      <Div {...props} aria-orientation={orientation} onLayout={measure} className={`flex w-full ${orientation === "vertical" ? "flex-col" : "flex-row"} ${className}`} style={style}>
        {laidOut}
      </Div>
    </GroupContext.Provider>
  )
}

export function ResizablePanel({ index = 0, className = "", style, children, defaultSize: _d, minSize: _min, maxSize: _max, onResize: _r, ...props }: PanelProps) {
  const group = useContext(GroupContext)
  const size = group?.sizes[index] ?? 100
  return (
    <Div {...props} className={className} style={[{ flexGrow: size, flexShrink: 1, flexBasis: 0, overflow: "hidden" }, style]}>
      {children}
    </Div>
  )
}

/** A 1 px line with a wider grip area: hitSlop natively, a 5 px transparent strip over the panels on the web. */
export function ResizableHandle({ withHandle, className = "", disabled, index = 0 }: HandleProps) {
  const group = useContext(GroupContext)
  const colors = useColors()
  const start = useRef<{ at: number; sizes: number[] } | null>(null)
  const horizontal = (group?.orientation ?? "horizontal") === "horizontal"
  const point = (event: GestureResponderEvent) => (horizontal ? event.nativeEvent.pageX : event.nativeEvent.pageY)
  const responder = disabled
    ? {}
    : {
        onStartShouldSetResponder: () => true,
        onMoveShouldSetResponder: () => true,
        onResponderTerminationRequest: () => false,
        onResponderGrant: (event: GestureResponderEvent) => void (start.current = { at: point(event), sizes: group?.sizes ?? [] }),
        onResponderMove: (event: GestureResponderEvent) => start.current && group?.drag(index, point(event) - start.current.at, start.current.sizes),
        onResponderRelease: () => void (start.current = null),
      }
  const sizes = group?.sizes ?? []
  return (
    <View
      role="separator"
      aria-orientation={horizontal ? "vertical" : "horizontal"}
      aria-valuenow={Math.round(sizes[index] ?? 0)}
      hitSlop={horizontal ? { left: 6, right: 6 } : { top: 6, bottom: 6 }}
      {...responder}
      style={[{ position: "relative", zIndex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.border, cursor: horizontal ? "ew-resize" : "ns-resize" } as object, horizontal ? { width: 1, alignSelf: "stretch" } : { height: 1, width: "100%" }]}
    >
      <View style={horizontal ? { position: "absolute", top: 0, bottom: 0, left: -2, width: 5 } : { position: "absolute", left: 0, right: 0, top: -2, height: 5 }} />
      {withHandle && <Div className={`flex shrink-0 rounded-lg bg-border ${className}`} style={[{ zIndex: 10 }, horizontal ? { height: 24, width: 4 } : { height: 4, width: 24 }]} />}
    </View>
  )
}
