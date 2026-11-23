import { useContext, useEffect, useRef, useState } from "react"
import { Pressable, View } from "react-native"

import { FormContext } from "../native/form-context"
import { useColors, useResolvedTheme } from "../native/theme"

export type SwitchProps = {
  checked?: boolean
  defaultChecked?: boolean
  onCheckedChange?: (checked: boolean) => void
  disabled?: boolean
  name?: string
  size?: "sm" | "default"
  className?: string
  "aria-label"?: string
}

const sizes = { default: { width: 44, height: 20, thumb: [24, 16] }, sm: { width: 28, height: 16, thumb: [16, 12] } } as const

/** The web's switch drawn: a pill track (border 2), a pill thumb that slides right when on. */
export function Switch({ checked, defaultChecked, onCheckedChange, disabled, name, size = "default", "aria-label": label }: SwitchProps) {
  const colors = useColors()
  const dark = useResolvedTheme() === "dark"
  const form = useContext(FormContext)
  const [own, setOwn] = useState(Boolean(defaultChecked))
  const on = checked ?? own
  const latest = useRef(on)
  latest.current = on
  useEffect(() => {
    if (!name || !form) return
    return form.register(name, () => (latest.current ? "on" : []))
  }, [form, name])
  const box = sizes[size]
  const [thumbWidth, thumbHeight] = box.thumb
  return (
    <Pressable
      role="switch"
      aria-checked={on}
      aria-label={label}
      disabled={disabled}
      onPress={() => {
        setOwn(!on)
        onCheckedChange?.(!on)
      }}
      style={{ width: box.width, height: box.height, borderRadius: 999, borderWidth: 2, borderColor: on ? colors.primary : "transparent", backgroundColor: on ? colors.primary : colors.input, justifyContent: "center", opacity: disabled ? 0.5 : 1 }}
    >
      <View style={{ width: thumbWidth, height: thumbHeight, borderRadius: 999, backgroundColor: dark ? (on ? colors.primaryForeground : colors.foreground) : colors.background, transform: [{ translateX: on ? thumbWidth - 8 : 0 }], shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 2, shadowOffset: { width: 0, height: 1 } }} />
    </Pressable>
  )
}
