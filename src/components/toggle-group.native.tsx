import { Children, createContext, isValidElement, useContext, useEffect, useRef, useState, type ReactNode } from "react"
import type { ViewStyle } from "react-native"

import { FormContext } from "../native/form-context"
import { Div } from "../primitives.native"
import { ToggleView, type ToggleSize, type ToggleVariant } from "./toggle.native"

type Ctx = { value: string[]; flip: (value: string) => void; variant?: ToggleVariant | null; size?: ToggleSize | null; spacing: number; orientation: "horizontal" | "vertical"; disabled?: boolean }
const GroupCtx = createContext<Ctx | null>(null)
const PlaceCtx = createContext<{ first: boolean; last: boolean }>({ first: true, last: true })

export type ToggleGroupProps = {
  value?: string[]
  defaultValue?: string[]
  onValueChange?: (value: string[]) => void
  /** Several on at once; otherwise pressing one turns the others off (and pressing it again turns it off). */
  multiple?: boolean
  disabled?: boolean
  variant?: ToggleVariant | null
  size?: ToggleSize | null
  spacing?: number
  orientation?: "horizontal" | "vertical"
  name?: string
  className?: string
  children?: ReactNode
  "aria-label"?: string
}

/** shadcn's ToggleGroup, drawn: toggles `spacing` × 4 px apart; with spacing 0 they join into one rounded bar. */
export function ToggleGroup({ value, defaultValue, onValueChange, multiple, disabled, variant, size, spacing = 2, orientation = "horizontal", name, className = "", children, "aria-label": label }: ToggleGroupProps) {
  const [own, setOwn] = useState<string[]>(defaultValue ?? [])
  const shown = value ?? own
  const form = useContext(FormContext)
  const latest = useRef(shown)
  latest.current = shown
  useEffect(() => {
    if (!name || !form) return
    return form.register(name, () => latest.current)
  }, [form, name])
  const flip = (item: string) => {
    const next = shown.includes(item) ? shown.filter((v) => v !== item) : multiple ? [...shown, item] : [item]
    setOwn(next)
    onValueChange?.(next)
  }
  const items = Children.toArray(children).filter(isValidElement)
  const vertical = orientation === "vertical"
  return (
    <GroupCtx.Provider value={{ value: shown, flip, variant, size, spacing, orientation, disabled }}>
      <Div role="group" aria-label={label} className={`flex ${vertical ? "flex-col items-stretch" : "flex-row items-center"} ${className}`} style={{ gap: spacing * 4, alignSelf: "flex-start" }}>
        {items.map((child, index) => (
          <PlaceCtx.Provider key={child.key ?? index} value={{ first: index === 0, last: index === items.length - 1 }}>
            {child}
          </PlaceCtx.Provider>
        ))}
      </Div>
    </GroupCtx.Provider>
  )
}

export function ToggleGroupItem({ value, variant = "default", size = "default", disabled, className, children, "aria-label": label }: { value: string; variant?: ToggleVariant | null; size?: ToggleSize | null; disabled?: boolean; className?: string; children?: ReactNode; "aria-label"?: string }) {
  const group = useContext(GroupCtx)
  const place = useContext(PlaceCtx)
  const v = group?.variant || variant
  const s = group?.size || size
  let joined: ViewStyle | undefined
  if (group && group.spacing === 0) {
    const r = 30.8
    const h = group.orientation === "horizontal"
    joined = h
      ? { borderRadius: 0, borderTopLeftRadius: place.first ? r : 0, borderBottomLeftRadius: place.first ? r : 0, borderTopRightRadius: place.last ? r : 0, borderBottomRightRadius: place.last ? r : 0, ...(v === "outline" && !place.first ? { borderLeftWidth: 0 } : {}) }
      : { borderRadius: 0, borderTopLeftRadius: place.first ? r : 0, borderTopRightRadius: place.first ? r : 0, borderBottomLeftRadius: place.last ? r : 0, borderBottomRightRadius: place.last ? r : 0, ...(v === "outline" && !place.first ? { borderTopWidth: 0 } : {}) }
  }
  return (
    <ToggleView on={Boolean(group?.value.includes(value))} onPress={() => group?.flip(value)} variant={v} size={s} disabled={disabled || group?.disabled} className={`shrink-0 ${className ?? ""}`} style={joined} aria-label={label}>
      {children}
    </ToggleView>
  )
}

/** For the iOS file: the drawn state. */
export { GroupCtx as ToggleGroupCtx }
