import { useRef, useState } from "react"
import { View, type GestureResponderEvent } from "react-native"

import { useColors } from "../native/theme"
import { useTw } from "../native/use-tw"

export type SliderProps = {
  value?: number | number[]
  defaultValue?: number | number[]
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  onValueChange?: (value: number | number[]) => void
  className?: string
  "aria-label"?: string
}

const first = (v: number | number[] | undefined) => (Array.isArray(v) ? v[0] : v)

/** The web's slider drawn, one thumb: an 8 px track (the control's height, as on the web), the filled part in primary, a 24×16 white pill thumb overflowing it. */
export function Slider({ value, defaultValue, min = 0, max = 100, step = 1, disabled, onValueChange, "aria-label": label }: SliderProps) {
  const colors = useColors()
  const track = useTw("bg-input/90")
  const [own, setOwn] = useState(first(defaultValue) ?? min)
  const shown = first(value) ?? own
  const width = useRef(0)
  const set = (event: GestureResponderEvent) => {
    if (disabled || !width.current) return
    const ratio = Math.max(0, Math.min(1, event.nativeEvent.locationX / width.current))
    const next = Math.round((min + ratio * (max - min)) / step) * step
    setOwn(next)
    onValueChange?.(Array.isArray(value ?? defaultValue) ? [next] : next)
  }
  const ratio = (shown - min) / (max - min || 1)
  return (
    <View
      role="slider"
      aria-label={label}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={shown}
      onLayout={(event) => (width.current = event.nativeEvent.layout.width)}
      onStartShouldSetResponder={() => !disabled}
      onMoveShouldSetResponder={() => !disabled}
      onResponderGrant={set}
      onResponderMove={set}
      style={{ height: 8, justifyContent: "center", opacity: disabled ? 0.5 : 1 }}
    >
      <View pointerEvents="none" style={{ height: 8, borderRadius: 999, backgroundColor: track.view.backgroundColor, overflow: "hidden" }}>
        <View style={{ height: "100%", width: `${ratio * 100}%`, backgroundColor: colors.primary }} />
      </View>
      <View pointerEvents="none" style={{ position: "absolute", top: -4, left: `${ratio * 100}%`, marginLeft: -24 * ratio, width: 24, height: 16, borderRadius: 999, backgroundColor: "#ffffff", shadowColor: "#000", shadowOpacity: 0.15, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, borderWidth: 1, borderColor: "rgba(0,0,0,0.1)" }} />
    </View>
  )
}
