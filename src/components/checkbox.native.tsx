import { useContext, useEffect, useRef, useState } from "react"
import { Pressable } from "react-native"

import { FormContext } from "../native/form-context"
import { CheckIcon } from "../native/icons"
import { useColors } from "../native/theme"

export type CheckboxProps = {
  checked?: boolean
  defaultChecked?: boolean
  onCheckedChange?: (checked: boolean) => void
  disabled?: boolean
  name?: string
  value?: string
  className?: string
  "aria-label"?: string
}

/** The web's checkbox (Base UI) drawn: 16 px, 5 px corners, filled with the primary colour when ticked. */
export function Checkbox({ checked, defaultChecked, onCheckedChange, disabled, name, value = "on", "aria-label": label }: CheckboxProps) {
  const colors = useColors()
  const form = useContext(FormContext)
  const [own, setOwn] = useState(Boolean(defaultChecked))
  const on = checked ?? own
  const latest = useRef(on)
  latest.current = on
  useEffect(() => {
    if (!name || !form) return
    return form.register(name, () => (latest.current ? value : []))
  }, [form, name, value])
  return (
    <Pressable
      role="checkbox"
      aria-checked={on}
      aria-label={label}
      disabled={disabled}
      onPress={() => {
        setOwn(!on)
        onCheckedChange?.(!on)
      }}
      style={{ width: 16, height: 16, borderRadius: 5, borderWidth: 1, borderColor: on ? colors.primary : "transparent", backgroundColor: on ? colors.primary : colors.input, alignItems: "center", justifyContent: "center", opacity: disabled ? 0.5 : 1 }}
    >
      {on && <CheckIcon size={14} color={colors.primaryForeground} />}
    </Pressable>
  )
}
