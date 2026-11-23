import * as chart from "@clegra/ui/components/chart"
import * as chartDrawn from "@clegra/ui/drawn/components/chart"
import * as recharts from "./chart-recharts"

import { defineCase } from "../case"

const data = [
  { month: "January", desktop: 186, mobile: 80 },
  { month: "February", desktop: 305, mobile: 200 },
  { month: "March", desktop: 237, mobile: 120 },
  { month: "April", desktop: 73, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "June", desktop: 214, mobile: 140 },
]

const config = {
  desktop: { label: "Desktop", color: "var(--chart-2)" },
  mobile: { label: "Mobile", color: "var(--chart-4)" },
}

export default defineCase("chart", [chart, recharts], [chartDrawn], ({ ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, BarChart, Bar, XAxis, CartesianGrid }) => (
  <ChartContainer config={config} className="h-[200px] w-full">
    <BarChart accessibilityLayer data={data}>
      <CartesianGrid vertical={false} />
      <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} tickFormatter={(value: string) => value.slice(0, 3)} />
      <ChartTooltip content={<ChartTooltipContent />} />
      <ChartLegend content={<ChartLegendContent />} />
      <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} />
      <Bar dataKey="mobile" fill="var(--color-mobile)" radius={4} />
    </BarChart>
  </ChartContainer>
))
