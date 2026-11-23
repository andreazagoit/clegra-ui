import { Children, cloneElement, createContext, isValidElement, useContext, useState, type ComponentType, type ReactElement, type ReactNode } from "react"
import { Pressable, View, type LayoutChangeEvent } from "react-native"
import Svg, { Circle, G, Line as SvgLine, Path, Rect, Text as SvgText } from "react-native-svg"

import { fonts, useColors, useResolvedTheme } from "../native/theme"
import { Div, Span, type BoxProps } from "../primitives.native"

const THEMES = { light: "", dark: ".dark" } as const

export type ChartConfig = Record<
  string,
  {
    label?: ReactNode
    icon?: ComponentType
  } & ({ color?: string; theme?: never } | { color?: never; theme: Record<keyof typeof THEMES, string> })
>

type ChartContextProps = { config: ChartConfig; color: (value: string | undefined) => string | undefined }
const ChartContext = createContext<ChartContextProps | null>(null)

export function useChart() {
  const context = useContext(ChartContext)
  if (!context) throw new Error("useChart must be used within a <ChartContainer />")
  return context
}

/** --chart-1 … --chart-5 of Clegra's theme (src/brand/theme.css, light). */
const palette: Record<string, string> = { "chart-1": "#2D4BEE", "chart-2": "#8FA2FF", "chart-3": "#1F35C4", "chart-4": "#6B6B6B", "chart-5": "#A3A3A3" }

/** A CSS colour as the web resolves it: var(--color-key) from the config, var(--chart-n), a theme colour, or the value itself. */
function useResolve(config: ChartConfig) {
  const colors = useColors() as Record<string, string>
  const theme = useResolvedTheme()
  const resolve = (value: string | undefined, depth = 0): string | undefined => {
    if (!value || depth > 4) return value
    const v = /^(?:hsl\()?var\(--([\w-]+)\)\)?$/.exec(value.trim())
    if (!v) return value
    const name = v[1]!
    if (name.startsWith("color-")) {
      const key = name.slice(6)
      const item = config[key]
      if (item) return resolve(item.theme?.[theme] ?? item.color, depth + 1)
      return resolve(`var(--${key})`, depth + 1)
    }
    return palette[name] ?? colors[name.replace(/-([a-z0-9])/g, (_, c: string) => c.toUpperCase())] ?? value
  }
  return resolve
}

/** The chart's box: as wide as its parent and 16:9 (aspect-video) unless the classes give it a height. */
export function ChartContainer({ id: _id, className = "", children, config, initialDimension: _initial, style, ...props }: BoxProps & { config: ChartConfig; children: ReactNode; initialDimension?: { width: number; height: number } }) {
  const resolve = useResolve(config)
  const sized = /(^|\s)(h-|min-h-|aspect-square)/.test(className)
  const square = /(^|\s)aspect-square/.test(className)
  return (
    <ChartContext.Provider value={{ config, color: (value) => resolve(value) }}>
      <Div {...props} data-slot="chart" className={`flex flex-row justify-center text-xs ${className}`} style={[sized && !square ? null : { aspectRatio: square ? 1 : 16 / 9 }, style]}>
        <View style={{ flex: 1, alignSelf: "stretch" }}>{children}</View>
      </Div>
    </ChartContext.Provider>
  )
}

export const ChartStyle = (_: { id: string; config: ChartConfig }) => null

type Payload = { dataKey: string; name: string; value: unknown; color?: string; fill?: string; payload: Record<string, unknown>; type?: string }

function getPayloadConfigFromPayload(config: ChartConfig, payload: unknown, key: string) {
  if (typeof payload !== "object" || payload === null) return undefined
  const inner = "payload" in payload && typeof payload.payload === "object" && payload.payload !== null ? (payload.payload as Record<string, unknown>) : undefined
  let labelKey = key
  if (key in payload && typeof (payload as Record<string, unknown>)[key] === "string") labelKey = (payload as Record<string, unknown>)[key] as string
  else if (inner && key in inner && typeof inner[key] === "string") labelKey = inner[key] as string
  return labelKey in config ? config[labelKey] : config[key]
}

type TooltipContentProps = {
  active?: boolean
  payload?: Payload[]
  className?: string
  indicator?: "line" | "dot" | "dashed"
  hideLabel?: boolean
  hideIndicator?: boolean
  label?: unknown
  labelFormatter?: (label: ReactNode, payload: Payload[]) => ReactNode
  labelClassName?: string
  formatter?: (value: unknown, name: string, item: Payload, index: number, payload: Record<string, unknown>) => ReactNode
  color?: string
  nameKey?: string
  labelKey?: string
}

export function ChartTooltipContent({ active, payload, className = "", indicator = "dot", hideLabel = false, hideIndicator = false, label, labelFormatter, labelClassName = "", formatter, color, nameKey, labelKey }: TooltipContentProps) {
  const { config } = useChart()
  if (!active || !payload?.length) return null
  const tooltipLabel = (() => {
    if (hideLabel) return null
    const [item] = payload
    const key = `${labelKey ?? item?.dataKey ?? item?.name ?? "value"}`
    const itemConfig = getPayloadConfigFromPayload(config, item, key)
    const value = !labelKey && typeof label === "string" ? (config[label]?.label ?? label) : itemConfig?.label
    if (labelFormatter) return <Div className={`font-medium ${labelClassName}`}>{labelFormatter(value as ReactNode, payload)}</Div>
    if (!value) return null
    return <Div className={`font-medium ${labelClassName}`}>{value as ReactNode}</Div>
  })()
  const nestLabel = payload.length === 1 && indicator !== "dot"
  return (
    <Div className={`flex flex-col min-w-32 items-start gap-1.5 rounded-xl bg-popover px-2.5 py-1.5 text-xs text-popover-foreground shadow-lg border border-foreground/5 dark:border-foreground/10 ${className}`}>
      {!nestLabel ? tooltipLabel : null}
      <Div className="flex flex-col self-stretch gap-1.5">
        {payload
          .filter((item) => item.type !== "none")
          .map((item, index) => {
            const key = `${nameKey ?? item.name ?? item.dataKey ?? "value"}`
            const itemConfig = getPayloadConfigFromPayload(config, item, key)
            const indicatorColor = color ?? (item.payload?.fill as string | undefined) ?? item.color
            const Icon = itemConfig?.icon
            return (
              <Div key={index} className={`flex flex-row w-full flex-wrap gap-2 ${indicator === "dot" ? "items-center" : "items-stretch"}`}>
                {formatter && item?.value !== undefined && item.name ? (
                  formatter(item.value, item.name, item, index, item.payload)
                ) : (
                  <>
                    {Icon ? (
                      <Icon />
                    ) : (
                      !hideIndicator && (
                        <View
                          style={[
                            { flexShrink: 0, borderRadius: 2, backgroundColor: indicatorColor, borderColor: indicatorColor },
                            indicator === "dot" && { width: 10, height: 10 },
                            indicator === "line" && { width: 4, alignSelf: "stretch" },
                            indicator === "dashed" && { width: 0, borderWidth: 1.5, borderStyle: "dashed", backgroundColor: "transparent", alignSelf: "stretch" },
                            nestLabel && indicator === "dashed" && { marginVertical: 2 },
                          ]}
                        />
                      )
                    )}
                    <Div className={`flex flex-row flex-1 justify-between ${nestLabel ? "items-end" : "items-center"}`}>
                      <Div className="flex flex-col gap-1.5">
                        {nestLabel ? tooltipLabel : null}
                        <Span className="text-xs text-muted-foreground" style={{ lineHeight: 12 }}>
                          {(itemConfig?.label ?? item.name) as ReactNode}
                        </Span>
                      </Div>
                      {item.value != null && (
                        <Span className="font-mono text-xs font-medium text-foreground tabular-nums" style={{ lineHeight: 12 }}>
                          {typeof item.value === "number" ? item.value.toLocaleString() : String(item.value)}
                        </Span>
                      )}
                    </Div>
                  </>
                )}
              </Div>
            )
          })}
      </Div>
    </Div>
  )
}

type LegendItem = { value: string; dataKey: string; color?: string; type?: string }

export function ChartLegendContent({ className = "", hideIcon = false, payload, verticalAlign = "bottom", nameKey }: { className?: string; hideIcon?: boolean; payload?: LegendItem[]; verticalAlign?: "top" | "middle" | "bottom"; nameKey?: string }) {
  const { config } = useChart()
  if (!payload?.length) return null
  return (
    <Div className={`flex flex-row items-center justify-center gap-4 ${verticalAlign === "top" ? "pb-3" : "pt-3"} ${className}`}>
      {payload
        .filter((item) => item.type !== "none")
        .map((item, index) => {
          const key = `${nameKey ?? item.dataKey ?? "value"}`
          const itemConfig = getPayloadConfigFromPayload(config, item, key)
          const Icon = itemConfig?.icon
          return (
            <Div key={index} className="flex flex-row items-center gap-1.5">
              {Icon && !hideIcon ? <Icon /> : <View style={{ width: 8, height: 8, flexShrink: 0, borderRadius: 2, backgroundColor: item.color }} />}
              <Span className="text-xs">{itemConfig?.label as ReactNode}</Span>
            </Div>
          )
        })}
    </Div>
  )
}

/* Recharts' pieces, drawn: the chart reads them as its children. */

type AxisProps = { dataKey?: string; hide?: boolean; tickLine?: boolean; axisLine?: boolean; tickMargin?: number; tickFormatter?: (value: never, index: number) => string; width?: number; height?: number; tickCount?: number; domain?: unknown; type?: string; [key: string]: unknown }
type SeriesProps = { dataKey: string; name?: string; fill?: string; stroke?: string; radius?: number | number[]; strokeWidth?: number; type?: "linear" | "monotone" | "natural" | "step"; dot?: boolean; stackId?: string; hide?: boolean; [key: string]: unknown }
type GridProps = { vertical?: boolean; horizontal?: boolean; strokeDasharray?: string; [key: string]: unknown }
type TooltipProps = { content?: ReactElement | ((props: TooltipContentProps) => ReactNode); cursor?: boolean | object; [key: string]: unknown }
type LegendProps = { content?: ReactElement | ((props: { payload: LegendItem[] }) => ReactNode); verticalAlign?: "top" | "middle" | "bottom"; [key: string]: unknown }

export const XAxis = (_: AxisProps) => null
export const YAxis = (_: AxisProps) => null
export const CartesianGrid = (_: GridProps) => null
export const Bar = (_: SeriesProps) => null
export const Line = (_: SeriesProps) => null
export const ChartTooltip = (_: TooltipProps) => null
export const ChartLegend = (_: LegendProps) => null
export { ChartTooltip as Tooltip, ChartLegend as Legend }

/** Round ticks from 0 to past the largest value, as recharts' getNiceTickValues (tickCount 5). */
function niceTicks(max: number, count = 5) {
  if (max <= 0) return Array.from({ length: count }, (_, i) => i)
  const raw = max / (count - 1)
  const digits = Math.floor(Math.log10(raw)) + 1
  const unit = 10 ** digits
  const scale = digits !== 1 ? 0.05 : 0.1
  const step = Math.ceil(raw / unit / scale - 1e-9) * scale * unit
  return Array.from({ length: count }, (_, i) => Number((i * step).toPrecision(12)))
}

/** A smooth path through the points (monotone cubic, as d3's curveMonotoneX). */
function curve(points: [number, number][], type: SeriesProps["type"]) {
  if (points.length < 2 || type === "linear" || !type) return points.map(([x, y], i) => `${i ? "L" : "M"}${x},${y}`).join("")
  if (type === "step") return points.map(([x, y], i) => (i ? `H${(points[i - 1]![0] + x) / 2}V${y}H${x}` : `M${x},${y}`)).join("")
  const n = points.length
  const d = points.slice(0, -1).map(([x, y], i) => (points[i + 1]![1] - y) / (points[i + 1]![0] - x))
  const m = points.map((_, i) => (i === 0 ? d[0]! : i === n - 1 ? d[n - 2]! : d[i - 1]! * d[i]! <= 0 ? 0 : (d[i - 1]! + d[i]!) / 2))
  let path = `M${points[0]![0]},${points[0]![1]}`
  for (let i = 0; i < n - 1; i++) {
    const [x0, y0] = points[i]!
    const [x1, y1] = points[i + 1]!
    const h = (x1 - x0) / 3
    path += `C${x0 + h},${y0 + m[i]! * h},${x1 - h},${y1 - m[i + 1]! * h},${x1},${y1}`
  }
  return path
}

type ChartProps = { data?: Record<string, unknown>[]; margin?: { top?: number; right?: number; bottom?: number; left?: number }; accessibilityLayer?: boolean; children?: ReactNode; barGap?: number; barCategoryGap?: number | string; [key: string]: unknown }

function CartesianChart({ kind, data = [], margin, children, barGap = 4, barCategoryGap = "10%" }: ChartProps & { kind: "bar" | "line" }) {
  const chart = useChart()
  const colors = useColors()
  const [size, setSize] = useState({ width: 0, height: 0 })
  const [active, setActive] = useState<number | null>(null)
  const parts = Children.toArray(children).filter(isValidElement) as ReactElement<Record<string, unknown>>[]
  const find = <P,>(type: unknown) => parts.find((p) => p.type === type) as ReactElement<P> | undefined
  const xAxis = find<AxisProps>(XAxis)?.props
  const yAxis = find<AxisProps>(YAxis)?.props
  const grid = find<GridProps>(CartesianGrid)?.props
  const tooltip = find<TooltipProps>(ChartTooltip)?.props
  const legend = find<LegendProps>(ChartLegend)?.props
  const series = parts.filter((p) => p.type === (kind === "bar" ? Bar : Line)).map((p) => p.props as SeriesProps).filter((s) => !s.hide)
  const colorOf = (s: SeriesProps) => chart.color(kind === "bar" ? (s.fill ?? s.stroke) : (s.stroke ?? s.fill)) ?? colors.foreground

  const m = { top: 5, right: 5, bottom: 5, left: 5, ...margin }
  const xHeight = xAxis && !xAxis.hide ? (xAxis.height ?? 30) : 0
  const yWidth = yAxis && !yAxis.hide ? (yAxis.width ?? 60) : 0
  const x0 = m.left + yWidth
  const x1 = size.width - m.right
  const y0 = legend?.verticalAlign === "top" ? 0 : m.top
  // A legend takes the margin's place on its side, as recharts lays it out.
  const y1 = size.height - (legend && legend.verticalAlign !== "top" ? 0 : m.bottom) - xHeight
  const values = data.flatMap((row) => {
    if (series.some((s) => s.stackId)) return [series.reduce((sum, s) => sum + (Number(row[s.dataKey]) || 0), 0)]
    return series.map((s) => Number(row[s.dataKey]) || 0)
  })
  const ticks = niceTicks(Math.max(0, ...values), yAxis?.tickCount ?? 5)
  const top = ticks.at(-1) || 1
  const y = (v: number) => y1 - (v / top) * (y1 - y0)
  const n = Math.max(1, data.length)
  const band = (x1 - x0) / n
  const center = (i: number) => (kind === "bar" ? x0 + band * (i + 0.5) : n === 1 ? (x0 + x1) / 2 : x0 + ((x1 - x0) * i) / (n - 1))
  const gap = typeof barCategoryGap === "string" ? (band * Number.parseFloat(barCategoryGap)) / 100 : barCategoryGap
  const stacked = series.some((s) => s.stackId)
  const groups = stacked ? 1 : series.length
  const barWidth = Math.max(1, (band - 2 * gap - (groups - 1) * barGap) / Math.max(1, groups))
  const label = (i: number) => (xAxis?.dataKey ? data[i]?.[xAxis.dataKey] : i)
  const tick = (value: unknown, i: number) => (xAxis?.tickFormatter ? xAxis.tickFormatter(value as never, i) : String(value ?? ""))
  const muted = colors.mutedForeground
  const font = { fontSize: 12, fontFamily: fonts.sans, fill: muted }

  const legendItems: LegendItem[] = series.map((s) => ({ value: s.dataKey, dataKey: s.dataKey, color: colorOf(s), type: "rect" }))
  const legendNode = legend ? (isValidElement(legend.content) ? cloneElement(legend.content as ReactElement<Record<string, unknown>>, { payload: legendItems, verticalAlign: legend.verticalAlign }) : typeof legend.content === "function" ? legend.content({ payload: legendItems }) : <ChartLegendContent payload={legendItems} verticalAlign={legend.verticalAlign} />) : null

  const payload = (i: number): Payload[] => series.map((s) => ({ dataKey: s.dataKey, name: s.name ?? s.dataKey, value: data[i]?.[s.dataKey], color: colorOf(s), fill: colorOf(s), payload: data[i] ?? {} }))
  const tip = tooltip && active !== null ? { active: true, payload: payload(active), label: label(active) } : null
  const tipNode = tip ? (isValidElement(tooltip!.content) ? cloneElement(tooltip!.content as ReactElement<Record<string, unknown>>, tip) : typeof tooltip!.content === "function" ? tooltip!.content(tip as TooltipContentProps) : <ChartTooltipContent {...(tip as TooltipContentProps)} />) : null

  const measure = (event: LayoutChangeEvent) => setSize({ width: event.nativeEvent.layout.width, height: event.nativeEvent.layout.height })
  const ready = size.width > 0 && size.height > 0 && y1 > y0
  return (
    <View style={{ flex: 1, alignSelf: "stretch" }}>
      {legend?.verticalAlign === "top" && <View style={{ marginTop: m.top }}>{legendNode}</View>}
      <View style={{ flex: 1 }} onLayout={measure}>
        {ready && (
          <Svg width={size.width} height={size.height} role="img">
            {grid && grid.horizontal !== false && ticks.map((t) => <SvgLine key={`h${t}`} x1={x0} x2={x1} y1={y(t)} y2={y(t)} stroke={colors.border} strokeOpacity={0.5} strokeDasharray={grid.strokeDasharray} />)}
            {grid && grid.vertical !== false && data.map((_, i) => <SvgLine key={`v${i}`} x1={center(i)} x2={center(i)} y1={y0} y2={y1} stroke={colors.border} strokeOpacity={0.5} strokeDasharray={grid.strokeDasharray} />)}
            {tooltip && tooltip.cursor !== false && active !== null && (kind === "bar" ? <Rect x={x0 + band * active} y={y0} width={band} height={y1 - y0} fill={colors.muted} /> : <SvgLine x1={center(active)} x2={center(active)} y1={y0} y2={y1} stroke={colors.border} />)}
            {kind === "bar" &&
              data.map((row, i) => {
                let base = 0
                return (
                  <G key={i}>
                    {series.map((s, k) => {
                      const v = Number(row[s.dataKey]) || 0
                      const left = stacked ? x0 + band * i + gap : x0 + band * i + gap + k * (barWidth + barGap)
                      const yTop = y(base + v)
                      const h = y(base) - yTop
                      if (stacked) base += v
                      const r = Math.min(Array.isArray(s.radius) ? (s.radius[0] ?? 0) : (s.radius ?? 0), barWidth / 2, h / 2)
                      return h > 0 ? <Rect key={s.dataKey} x={left} y={yTop} width={barWidth} height={h} rx={r} ry={r} fill={colorOf(s)} /> : null
                    })}
                  </G>
                )
              })}
            {kind === "line" &&
              series.map((s) => {
                const points = data.map((row, i) => [center(i), y(Number(row[s.dataKey]) || 0)] as [number, number])
                return (
                  <G key={s.dataKey}>
                    <Path d={curve(points, s.type)} fill="none" stroke={colorOf(s)} strokeWidth={s.strokeWidth ?? 1} />
                    {s.dot !== false && points.map(([px, py], i) => <Circle key={i} cx={px} cy={py} r={3} fill={colors.background} stroke={colorOf(s)} />)}
                  </G>
                )
              })}
            {xAxis && !xAxis.hide && (
              <G>
                {xAxis.axisLine !== false && <SvgLine x1={x0} x2={x1} y1={y1} y2={y1} stroke={muted} />}
                {data.map((_, i) => (
                  <G key={i}>
                    {xAxis.tickLine !== false && <SvgLine x1={center(i)} x2={center(i)} y1={y1} y2={y1 + 6} stroke={muted} />}
                    <SvgText {...font} x={center(i)} y={y1 + (xAxis.tickLine !== false ? 6 : 0) + (xAxis.tickMargin ?? 2) + 9} textAnchor="middle">
                      {tick(label(i), i)}
                    </SvgText>
                  </G>
                ))}
              </G>
            )}
            {yAxis && !yAxis.hide && (
              <G>
                {yAxis.axisLine !== false && <SvgLine x1={x0} x2={x0} y1={y0} y2={y1} stroke={muted} />}
                {ticks.map((t, i) => (
                  <SvgText key={t} {...font} x={x0 - (yAxis.tickLine !== false ? 6 : 0) - (yAxis.tickMargin ?? 2)} y={y(t) + 4} textAnchor="end">
                    {yAxis.tickFormatter ? yAxis.tickFormatter(t as never, i) : String(t)}
                  </SvgText>
                ))}
              </G>
            )}
          </Svg>
        )}
        {ready &&
          tooltip &&
          data.map((_, i) => (
            <Pressable
              key={i}
              accessibilityLabel={String(label(i))}
              onHoverIn={() => setActive(i)}
              onHoverOut={() => setActive((current) => (current === i ? null : current))}
              onPress={() => setActive((current) => (current === i ? null : i))}
              style={{ position: "absolute", top: y0, height: y1 - y0, left: kind === "bar" ? x0 + band * i : center(i) - (x1 - x0) / Math.max(1, n - 1) / 2, width: kind === "bar" ? band : (x1 - x0) / Math.max(1, n - 1) }}
            />
          ))}
        {tipNode && active !== null && (
          <View pointerEvents="none" style={{ position: "absolute", top: y0, ...(center(active) > size.width / 2 ? { right: size.width - center(active) + 10 } : { left: center(active) + 10 }) }}>
            {tipNode}
          </View>
        )}
      </View>
      {legend && legend.verticalAlign !== "top" && <View style={{ marginBottom: m.bottom }}>{legendNode}</View>}
    </View>
  )
}

export const BarChart = (props: ChartProps) => <CartesianChart {...props} kind="bar" />
export const LineChart = (props: ChartProps) => <CartesianChart {...props} kind="line" />
