import { createContext, useContext, useState, type ReactNode } from "react"
import { Pressable } from "react-native"

import { IconContext } from "../native/icon-context"
import { Div, Span } from "../primitives.native"
import { useColors, useResolvedTheme } from "../native/theme"

export const TabsContext = createContext<{ value: unknown; set: (value: unknown) => void }>({ value: null, set: () => {} })

/** The client's segmented control. */
export function Tabs({ value, defaultValue, onValueChange, className, children }: { value?: unknown; defaultValue?: unknown; onValueChange?: (value: unknown) => void; className?: string; children?: ReactNode }) {
  const [own, setOwn] = useState(defaultValue)
  const shown = value ?? own
  return (
    <TabsContext.Provider value={{ value: shown, set: (next) => (setOwn(next), onValueChange?.(next)) }}>
      <Div className={`flex flex-col gap-2 ${className ?? ""}`}>{children}</Div>
    </TabsContext.Provider>
  )
}

export const TabsList = ({ className = "", children, "aria-label": label }: { className?: string; children?: ReactNode; "aria-label"?: string }) => (
  <Div role="tablist" aria-label={label} className={`flex flex-row self-start items-center rounded-full bg-muted p-1 h-9 ${className}`}>
    {children}
  </Div>
)

/** An alpha applied to a colour given as #rrggbb or rgba(): Tailwind's `/30`. */
const faded = (color: string, alpha: number) => {
  const rgba = /rgba\((\d+),(\d+),(\d+),([\d.]+)\)/.exec(color.replace(/\s/g, ""))
  if (rgba) return `rgba(${rgba[1]},${rgba[2]},${rgba[3]},${Number(rgba[4]) * alpha})`
  const n = parseInt(color.slice(1), 16)
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`
}

/**
 * A tab, as the web's: 1 px less than the list's inner height, a transparent
 * border, the background colour when active (in dark, input/30 with the input's border);
 * inactive text at 60% of the foreground (muted in dark).
 */
export function TabsTrigger({ value, children }: { value: unknown; children?: ReactNode; className?: string }) {
  const tabs = useContext(TabsContext)
  const colors = useColors()
  const dark = useResolvedTheme() === "dark"
  const active = tabs.value === value
  const color = active ? colors.foreground : dark ? colors.mutedForeground : faded(colors.foreground, 0.6)
  const background = active ? (dark ? faded(colors.input, 0.3) : colors.background) : "transparent"
  return (
    <Pressable role="tab" aria-selected={active} onPress={() => tabs.set(value)} style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 27, paddingHorizontal: 12, borderRadius: 9999, borderWidth: 1, borderColor: active && dark ? colors.input : "transparent", backgroundColor: background }}>
      <IconContext.Provider value={{ size: 16, color }}>
        {(Array.isArray(children) ? children : [children]).map((child, index) =>
          typeof child === "string" ? (
            <Span key={index} className="text-sm font-medium" style={{ color }}>
              {child}
            </Span>
          ) : (
            <IconContext.Consumer key={index}>{() => child as ReactNode}</IconContext.Consumer>
          ),
        )}
      </IconContext.Provider>
    </Pressable>
  )
}

export function TabsContent({ value, children }: { value: unknown; className?: string; children?: ReactNode }) {
  return useContext(TabsContext).value === value ? <>{children}</> : null
}

/** The web's class builder, for a list drawn by hand. */
export const tabsListVariants = ({ variant = "default" }: { variant?: "default" | "line" } = {}) => `flex flex-row self-start items-center rounded-full p-1 h-9 ${variant === "line" ? "gap-1 bg-transparent" : "bg-muted"}`
