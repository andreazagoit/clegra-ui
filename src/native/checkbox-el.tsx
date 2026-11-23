import { CheckIcon } from "./icons"
import { useContext, useEffect, useRef, useState } from "react"
import { Pressable } from "react-native"

import { FormContext } from "./form-context"
import { useColors } from "./theme"

/** `<input type="checkbox">`. */
export function Checkbox({ name, checked, defaultChecked, onChange, "aria-label": label }: { name?: string; checked?: boolean; defaultChecked?: boolean; onChange?: (event: { target: { checked: boolean } }) => void; className?: string; "aria-label"?: string }) {
  const colors = useColors()
  const form = useContext(FormContext)
  const [own, setOwn] = useState(Boolean(defaultChecked))
  const on = checked ?? own
  const latest = useRef(on)
  latest.current = on
  useEffect(() => {
    if (!name || !form) return
    return form.register(name, () => (latest.current ? "on" : []))
  }, [form, name])
  return (
    <Pressable
      role="checkbox"
      aria-checked={on}
      accessibilityLabel={label}
      onPress={() => {
        setOwn(!on)
        onChange?.({ target: { checked: !on } })
      }}
      style={{ width: 16, height: 16, borderRadius: 3, borderWidth: 1, borderColor: on ? colors.primary : colors.input, backgroundColor: on ? colors.primary : "transparent", alignItems: "center", justifyContent: "center" }}
    >
      {on && <CheckIcon size={12} color={colors.primaryForeground} />}
    </Pressable>
  )
}
