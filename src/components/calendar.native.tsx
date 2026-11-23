import { addDays, addMonths, differenceInCalendarDays, endOfMonth, endOfWeek, format, isAfter, isBefore, isSameDay, isSameMonth, startOfDay, startOfMonth, startOfWeek, type Locale } from "date-fns"
import * as L from "lucide-react-native"
import { useState, type ComponentType, type ReactNode } from "react"
import { Pressable, Text, View } from "react-native"

import { wrapIcon, type IconProps } from "../native/icons"
import { fonts, useColors } from "../native/theme"
import { Div } from "../primitives.native"
import { Button, type ButtonVariant } from "./button.native"

const ChevronLeftIcon = wrapIcon("ChevronLeftIcon", L.ChevronLeftIcon as unknown as ComponentType<IconProps>)
const ChevronRightIcon = wrapIcon("ChevronRightIcon", L.ChevronRightIcon as unknown as ComponentType<IconProps>)

export type DateRange = { from: Date | undefined; to?: Date | undefined }
/** react-day-picker's matchers, the common ones. */
export type Matcher = boolean | Date | Date[] | ((date: Date) => boolean) | { before: Date } | { after: Date } | { from: Date; to?: Date } | { dayOfWeek: number[] }

type Common = {
  className?: string
  showOutsideDays?: boolean
  captionLayout?: "label" | "dropdown" | "dropdown-months" | "dropdown-years"
  buttonVariant?: ButtonVariant
  locale?: Partial<Locale>
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6
  month?: Date
  defaultMonth?: Date
  onMonthChange?: (month: Date) => void
  numberOfMonths?: number
  disabled?: Matcher | Matcher[]
  hidden?: Matcher | Matcher[]
  today?: Date
  fixedWeeks?: boolean
  required?: boolean
  startMonth?: Date
  endMonth?: Date
  formatters?: { formatCaption?: (month: Date, options?: { locale?: Partial<Locale> }) => string; formatWeekdayName?: (day: Date, options?: { locale?: Partial<Locale> }) => string; formatDay?: (day: Date, options?: { locale?: Partial<Locale> }) => string }
  /** Accepted for compatibility; the drawn calendar draws its own parts. */
  classNames?: Record<string, string>
  components?: Record<string, unknown>
  showWeekNumber?: boolean
}
type Single = { mode: "single"; selected?: Date; onSelect?: (date: Date | undefined) => void }
type Multiple = { mode: "multiple"; selected?: Date[]; onSelect?: (dates: Date[] | undefined) => void }
type Range = { mode: "range"; selected?: DateRange; onSelect?: (range: DateRange | undefined) => void }
type None = { mode?: undefined; selected?: undefined; onSelect?: undefined }
export type CalendarProps = Common & (Single | Multiple | Range | None)

function matches(date: Date, matcher: Matcher | Matcher[] | undefined): boolean {
  if (matcher === undefined) return false
  if (Array.isArray(matcher)) return matcher.some((m) => (m instanceof Date ? isSameDay(m, date) : matches(date, m)))
  if (typeof matcher === "boolean") return matcher
  if (matcher instanceof Date) return isSameDay(matcher, date)
  if (typeof matcher === "function") return matcher(date)
  if ("dayOfWeek" in matcher) return matcher.dayOfWeek.includes(date.getDay())
  if ("before" in matcher && "after" in matcher) return isBefore(date, (matcher as { before: Date }).before) || isAfter(date, (matcher as { after: Date }).after)
  if ("before" in matcher) return differenceInCalendarDays(matcher.before, date) > 0
  if ("after" in matcher) return differenceInCalendarDays(date, matcher.after) > 0
  if ("from" in matcher) return matcher.to ? differenceInCalendarDays(date, matcher.from) >= 0 && differenceInCalendarDays(matcher.to, date) >= 0 : isSameDay(matcher.from, date)
  return false
}

/** The weeks of a month as react-day-picker shows them: whole weeks, six of them with fixedWeeks. */
function weeksOf(month: Date, weekStartsOn: number, fixed: boolean) {
  const options = { weekStartsOn: weekStartsOn as 0 }
  const first = startOfWeek(startOfMonth(month), options)
  const last = endOfWeek(endOfMonth(month), options)
  const days = differenceInCalendarDays(last, first) + 1
  const count = fixed ? 6 : days / 7
  return Array.from({ length: count }, (_, w) => Array.from({ length: 7 }, (_, d) => addDays(first, w * 7 + d)))
}

const CELL = 32

/**
 * react-day-picker drawn with date-fns: the same props (mode, selected,
 * onSelect, month, disabled, locale…), the same cells (32 px, round, primary
 * when picked, muted for today and the middle of a range).
 */
export function Calendar(props: CalendarProps) {
  const { className = "", showOutsideDays = true, buttonVariant = "ghost", locale, weekStartsOn = (locale?.options?.weekStartsOn ?? 0) as 0, numberOfMonths = 1, disabled, hidden, fixedWeeks, formatters, startMonth, endMonth } = props
  const colors = useColors()
  const today = startOfDay(props.today ?? new Date())
  const [ownMonth, setOwnMonth] = useState(startOfMonth(props.defaultMonth ?? props.month ?? today))
  const month = props.month ? startOfMonth(props.month) : ownMonth
  const [ownSelected, setOwnSelected] = useState<unknown>(undefined)
  const selected = props.selected !== undefined ? props.selected : ownSelected
  const options = { locale: locale as Locale }

  const go = (next: Date) => {
    setOwnMonth(next)
    props.onMonthChange?.(next)
  }
  const canPrev = !startMonth || isAfter(month, startOfMonth(startMonth))
  const canNext = !endMonth || isBefore(addMonths(month, numberOfMonths - 1), startOfMonth(endMonth))

  const pick = (day: Date) => {
    let next: unknown
    if (props.mode === "single") next = selected && isSameDay(selected as Date, day) ? (props.required ? selected : undefined) : day
    else if (props.mode === "multiple") {
      const list = (selected as Date[] | undefined) ?? []
      next = list.some((d) => isSameDay(d, day)) ? list.filter((d) => !isSameDay(d, day)) : [...list, day]
    } else if (props.mode === "range") {
      const range = selected as DateRange | undefined
      if (!range?.from || range.to) next = { from: day, to: undefined }
      else if (isBefore(day, range.from)) next = { from: day, to: range.from }
      else next = { from: range.from, to: day }
    } else return
    setOwnSelected(next)
    ;(props.onSelect as ((value: unknown) => void) | undefined)?.(next)
  }

  const state = (day: Date) => {
    if (props.mode === "single") return { single: Boolean(selected && isSameDay(selected as Date, day)) }
    if (props.mode === "multiple") return { single: ((selected as Date[] | undefined) ?? []).some((d) => isSameDay(d, day)) }
    if (props.mode === "range") {
      const range = selected as DateRange | undefined
      const start = Boolean(range?.from && isSameDay(range.from, day))
      const end = Boolean(range?.to && isSameDay(range.to, day))
      const middle = Boolean(range?.from && range.to && isAfter(day, range.from) && isBefore(day, range.to))
      return { single: start && (!range?.to || end), start: start && Boolean(range?.to) && !end, end: end && !start, middle }
    }
    return { single: false }
  }

  const caption = (m: Date) => formatters?.formatCaption?.(m, options) ?? format(m, "LLLL y", options)
  const weekday = (d: Date) => formatters?.formatWeekdayName?.(d, options) ?? format(d, "cccccc", options)
  const label = (d: Date) => formatters?.formatDay?.(d, options) ?? format(d, "d", options)
  const text = (color: string, size = 14, weight: "400" | "500" = "400"): object => ({ color, fontSize: size, fontWeight: weight, fontFamily: fonts.sans, textAlign: "center" })

  const months = Array.from({ length: numberOfMonths }, (_, i) => addMonths(month, i))
  return (
    <Div data-slot="calendar" className={`self-start bg-background p-3 ${className}`}>
      <View style={{ position: "relative", gap: 16 }}>
        <View style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 1, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }} pointerEvents="box-none">
          <Button variant={buttonVariant} size="icon-sm" aria-label="Go to the Previous Month" disabled={!canPrev} onClick={() => go(addMonths(month, -1))}>
            <ChevronLeftIcon className="size-4" />
          </Button>
          <Button variant={buttonVariant} size="icon-sm" aria-label="Go to the Next Month" disabled={!canNext} onClick={() => go(addMonths(month, 1))}>
            <ChevronRightIcon className="size-4" />
          </Button>
        </View>
        {months.map((m) => (
          <View key={m.toISOString()} style={{ gap: 16 }}>
            <View style={{ height: CELL, alignItems: "center", justifyContent: "center", paddingHorizontal: CELL }}>
              <Text role="status" aria-live="polite" style={text(colors.foreground, 14, "500")}>
                {caption(m)}
              </Text>
            </View>
            <View role="grid" aria-label={caption(m)}>
              <View style={{ flexDirection: "row" }}>
                {weeksOf(m, weekStartsOn, false)[0]!.map((d) => (
                  <Text key={d.toISOString()} style={[text(colors.mutedForeground, 12.8), { flex: 1, width: CELL, lineHeight: 19.2 }]}>
                    {weekday(d)}
                  </Text>
                ))}
              </View>
              {weeksOf(m, weekStartsOn, Boolean(fixedWeeks)).map((week) => (
                <View key={week[0]!.toISOString()} style={{ flexDirection: "row", marginTop: 8 }}>
                  {week.map((day) => {
                    const outside = !isSameMonth(day, m)
                    if ((outside && !showOutsideDays) || matches(day, hidden)) return <View key={day.toISOString()} style={{ width: CELL, height: CELL }} />
                    const off = matches(day, disabled)
                    const s = state(day)
                    const isToday = isSameDay(day, today)
                    const filled = s.single || s.start || s.end
                    const cellBg = s.middle ? colors.muted : s.start || s.end ? colors.muted : isToday && !filled ? colors.muted : "transparent"
                    const round = { borderTopLeftRadius: s.middle || s.end ? 0 : CELL, borderBottomLeftRadius: s.middle || s.end ? 0 : CELL, borderTopRightRadius: s.middle || s.start ? 0 : CELL, borderBottomRightRadius: s.middle || s.start ? 0 : CELL }
                    return (
                      <View key={day.toISOString()} style={[{ width: CELL, height: CELL, backgroundColor: cellBg, opacity: off ? 0.5 : 1 }, round]}>
                        <DayButton day={day} selected={Boolean(filled || s.middle)} disabled={off} onPress={() => pick(day)} background={filled ? colors.primary : "transparent"} color={filled ? colors.primaryForeground : outside || off ? colors.mutedForeground : colors.foreground} hover={filled ? colors.primary : s.middle ? colors.muted : colors.muted}>
                          {label(day)}
                        </DayButton>
                      </View>
                    )
                  })}
                </View>
              ))}
            </View>
          </View>
        ))}
      </View>
    </Div>
  )
}

function DayButton({ day, selected, disabled, onPress, background, color, hover, children }: { day: Date; selected: boolean; disabled: boolean; onPress: () => void; background: string; color: string; hover: string; children: ReactNode }) {
  const [over, setOver] = useState(false)
  return (
    <Pressable
      role="button"
      aria-selected={selected}
      aria-label={format(day, "PPPP")}
      data-day={day.toLocaleDateString()}
      disabled={disabled}
      onPress={onPress}
      onHoverIn={() => setOver(true)}
      onHoverOut={() => setOver(false)}
      style={{ width: CELL, height: CELL, borderRadius: CELL, alignItems: "center", justifyContent: "center", backgroundColor: over && !disabled ? hover : background }}
    >
      <Text style={{ color, fontSize: 14, lineHeight: 14, fontFamily: fonts.sans }}>{children}</Text>
    </Pressable>
  )
}

/** The web's day button, for `components={{ DayButton }}`; drawn cells use their own. */
export const CalendarDayButton = DayButton
