import { Chart } from "@expo/ui/swift-ui"
import { Children, isValidElement, type ReactElement, type ReactNode } from "react"

import { ExpoHost } from "./expo-ui-controls"
import { Bar, BarChart as DrawnBarChart, Line, LineChart as DrawnLineChart, useChart, XAxis } from "../components/chart.native"

type ChartProps = { data?: Record<string, unknown>[]; children?: ReactNode; [key: string]: unknown }

/** One series over a category axis: the points Swift Charts takes. Anything else (several series, stacks) stays drawn. */
function single(props: ChartProps, series: unknown) {
  const parts = Children.toArray(props.children).filter(isValidElement) as ReactElement<Record<string, unknown>>[]
  const lines = parts.filter((p) => p.type === series)
  const axis = parts.find((p) => p.type === XAxis)?.props as { dataKey?: string; tickFormatter?: (v: never, i: number) => string } | undefined
  if (lines.length !== 1 || !axis?.dataKey || !props.data?.length) return null
  const s = lines[0]!.props as { dataKey: string; fill?: string; stroke?: string; radius?: number; type?: string; strokeWidth?: number }
  return { s, points: props.data.map((row, i) => ({ x: axis.tickFormatter ? axis.tickFormatter(row[axis.dataKey!] as never, i) : String(row[axis.dataKey!]), y: Number(row[s.dataKey]) || 0 })) }
}

/** iOS: a single bar series is Swift Charts (Expo UI); several stay drawn (chart.native.tsx). */
export function BarChart(props: ChartProps) {
  const chart = useChart()
  const one = single(props, Bar)
  if (!one) return <DrawnBarChart {...props} />
  const color = chart.color(one.s.fill)
  return (
    <ExpoHost style={{ flex: 1 }}>
      <Chart type="bar" showGrid data={one.points.map((p) => ({ ...p, color }))} barStyle={{ cornerRadius: typeof one.s.radius === "number" ? one.s.radius : 0 }} style={{ flex: 1 }} />
    </ExpoHost>
  )
}

/** iOS: a single line is Swift Charts (Expo UI); several stay drawn. */
export function LineChart(props: ChartProps) {
  const chart = useChart()
  const one = single(props, Line)
  if (!one) return <DrawnLineChart {...props} />
  return (
    <ExpoHost style={{ flex: 1 }}>
      <Chart type="line" showGrid data={one.points} lineStyle={{ color: chart.color(one.s.stroke ?? one.s.fill), width: one.s.strokeWidth ?? 2 }} style={{ flex: 1 }} />
    </ExpoHost>
  )
}
