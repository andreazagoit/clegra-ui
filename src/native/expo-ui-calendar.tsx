import { DatePicker } from "@expo/ui/swift-ui"
import { datePickerStyle, tint } from "@expo/ui/swift-ui/modifiers"
import { useState } from "react"

import { ExpoHost } from "./expo-ui-controls"
import { useColors } from "./theme"
import { Calendar as Drawn, type CalendarProps } from "../components/calendar.native"

/**
 * iOS: one month picking one day is SwiftUI's graphical DatePicker (Expo UI),
 * the system calendar. Several days, a range, several months, disabled days
 * other than a before/after bound, or custom formatting stay drawn
 * (calendar.native.tsx).
 */
export function Calendar(props: CalendarProps) {
  const colors = useColors()
  const [own, setOwn] = useState<Date | undefined>(undefined)
  const bound = (m: unknown) => (m && typeof m === "object" && !(m instanceof Date) && !Array.isArray(m) && ("before" in m || "after" in m) && !("before" in m && "after" in m) ? (m as { before?: Date; after?: Date }) : null)
  const limit = props.disabled === undefined ? {} : bound(props.disabled)
  const plain = props.mode === "single" && (props.numberOfMonths ?? 1) === 1 && limit && !props.hidden && !props.formatters && !props.components
  if (!plain) return <Drawn {...props} />
  const selected = props.selected !== undefined ? props.selected : own
  return (
    <ExpoHost matchContents>
      <DatePicker
        selection={selected ?? props.today ?? new Date()}
        range={{ ...(limit.before ? { start: limit.before } : {}), ...(limit.after ? { end: limit.after } : {}) }}
        displayedComponents={["date"]}
        onDateChange={(date) => {
          setOwn(date)
          props.onSelect?.(date)
        }}
        modifiers={[datePickerStyle("graphical"), tint(colors.primary)]}
      />
    </ExpoHost>
  )
}
