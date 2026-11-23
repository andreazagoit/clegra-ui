import { createContext, useContext, type ReactNode } from "react"
import { View } from "react-native"

import { useColors } from "../native/theme"
import { Div, Span } from "../primitives.native"

const Value = createContext<number | null>(null)

/** The web's progress bar drawn: a label and value above a 12 px pill track. */
export function Progress({ value = null, className = "", children }: { value?: number | null; max?: number; className?: string; children?: ReactNode }) {
  return (
    <Value.Provider value={value}>
      <Div className={`flex flex-row flex-wrap gap-3 ${className}`}>
        {children}
        <ProgressTrack>
          <ProgressIndicator />
        </ProgressTrack>
      </Div>
    </Value.Provider>
  )
}

export function ProgressTrack({ children }: { className?: string; children?: ReactNode }) {
  const colors = useColors()
  return <View style={{ height: 12, width: "100%", borderRadius: 999, overflow: "hidden", backgroundColor: colors.muted, flexDirection: "row" }}>{children}</View>
}

export function ProgressIndicator(_: { className?: string }) {
  const value = useContext(Value)
  const colors = useColors()
  return <View style={{ height: "100%", width: `${Math.max(0, Math.min(100, value ?? 0))}%`, backgroundColor: colors.primary }} />
}

export const ProgressLabel = ({ className = "", children }: { className?: string; children?: ReactNode }) => <Span className={`text-sm font-medium ${className}`}>{children}</Span>

export function ProgressValue({ className = "" }: { className?: string }) {
  const value = useContext(Value)
  return <Span className={`ml-auto text-sm text-muted-foreground tabular-nums ${className}`}>{value === null ? "" : `${Math.round(value)}%`}</Span>
}
