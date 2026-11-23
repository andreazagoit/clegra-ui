import { Children, createContext, isValidElement, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react"
import { Pressable, ScrollView, type LayoutChangeEvent } from "react-native"

import { Div, type BoxProps } from "../primitives.native"
import { useColors } from "../native/theme"
import { useTw } from "../native/use-tw"

/**
 * A table of views laid out as the web's automatic table layout: each column
 * as wide as its widest cell (no wrapping), and the room left in the table's
 * width shared out in proportion to those widths. A column with its own width
 * class keeps it (w-0: its content; w-12: the checkboxes'). Rows have the web's
 * collapsed borders: the last row of the body has none.
 */
type Layout = { report: (column: number, width: number) => void; widths: number[] | null }
const LayoutContext = createContext<Layout>({ report: () => {}, widths: null })
const Head = createContext(false)
const Column = createContext(0)
const LastRow = createContext(false)

const fixed = (className: string) => {
  const width = /(?:^|\s)w-(\d+)(?:\s|$)/.exec(className)?.[1]
  return width === undefined ? undefined : width === "0" ? 44 : Number(width) * 4
}

export function Table({ className = "", children }: BoxProps) {
  const natural = useRef<number[]>([]).current
  const [width, setWidth] = useState(0)
  const [version, setVersion] = useState(0)
  const report = useCallback((column: number, w: number) => {
    if ((natural[column] ?? 0) >= w - 0.5) return
    natural[column] = w
    setVersion((v) => v + 1)
  }, [natural])
  const widths = useMemo(() => {
    if (!width || !natural.length) return null
    const sum = natural.reduce((a, b) => a + (b ?? 0), 0)
    const extra = width - sum
    return natural.map((w) => (extra > 0 && sum ? w + (extra * w) / sum : w))
  }, [width, natural, version]) // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <LayoutContext.Provider value={{ report, widths }}>
      <ScrollView horizontal contentContainerStyle={{ flexGrow: 1 }} onLayout={(event: LayoutChangeEvent) => setWidth(event.nativeEvent.layout.width)}>
        <Div role="table" className={`text-sm ${className}`} style={{ minWidth: "100%" }}>
          {children}
        </Div>
      </ScrollView>
    </LayoutContext.Provider>
  )
}

export function TableHeader({ children }: BoxProps) {
  return (
    <Head.Provider value={true}>
      <Div role="rowgroup">{children}</Div>
    </Head.Provider>
  )
}

/** The body: its last row loses its border, as the web's `[&_tr:last-child]:border-0`. */
export function TableBody({ children }: BoxProps) {
  const rows = Children.toArray(children)
  return (
    <Div role="rowgroup">
      {rows.map((row, index) => (
        <LastRow.Provider key={isValidElement(row) ? (row.key ?? index) : index} value={index === rows.length - 1}>
          {row}
        </LastRow.Provider>
      ))}
    </Div>
  )
}
export const TableFooter = ({ children }: BoxProps) => <Div className="border-t border-border bg-muted/50 font-medium">{children}</Div>
export const TableCaption = ({ children, className = "" }: BoxProps) => <Div className={`mt-4 text-sm text-muted-foreground ${className}`}>{children}</Div>

export function TableRow({ className = "", children, onClick, ...props }: BoxProps) {
  const inHead = useContext(Head)
  const last = useContext(LastRow)
  const [hover, setHover] = useState(false)
  const colors = useColors()
  const parsed = useTw(`flex flex-row items-stretch ${last ? "" : "border-b border-border"} ${className}`)
  return (
    <Pressable {...(props as object)} role="row" disabled={!onClick} onPress={onClick as never} onHoverIn={() => setHover(true)} onHoverOut={() => setHover(false)} style={[parsed.view, hover && !inHead ? { backgroundColor: `${colors.muted}80` } : null]}>
      {Children.toArray(children).map((cell, index) => (
        <Column.Provider key={index} value={index}>
          {cell}
        </Column.Provider>
      ))}
    </Pressable>
  )
}

/** A cell sized by its column: it reports its content's width, then takes the column's. */
function Cell({ className, role, padding, children, onClick, style }: { className: string; role: string; padding: number; children?: ReactNode; onClick?: BoxProps["onClick"]; style?: object }) {
  const layout = useContext(LayoutContext)
  const column = useContext(Column)
  const own = fixed(className)
  const width = own ?? layout.widths?.[column]
  return (
    <Div role={role} onClick={onClick} className={className} style={[{ flexShrink: 0, width }, style]}>
      <Div className="flex flex-row items-center" style={{ flexShrink: 0 }} onLayout={(event: LayoutChangeEvent) => own === undefined && layout.report(column, event.nativeEvent.layout.width + padding)}>
        {children}
      </Div>
    </Div>
  )
}

export function TableHead({ className = "", children }: BoxProps & { colSpan?: number }) {
  const right = /(^|\s)text-right(\s|$)/.test(className)
  return (
    <Cell role="columnheader" padding={24} className={`flex flex-row h-12 items-center px-3 text-left font-medium text-foreground ${right ? "justify-end" : ""} ${className}`} style={{ height: 47, paddingTop: 1 }}>
      {children as ReactNode}
    </Cell>
  )
}

export function TableCell({ className = "", children, onClick }: BoxProps & { colSpan?: number }) {
  const right = /(^|\s)text-right(\s|$)/.test(className)
  return (
    <Cell role="cell" onClick={onClick} padding={24} className={`flex flex-row items-center p-3 ${right ? "justify-end" : ""} ${className}`}>
      {children}
    </Cell>
  )
}

