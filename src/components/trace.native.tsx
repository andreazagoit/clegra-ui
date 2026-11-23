import * as L from "lucide-react-native"
import { createContext, useContext, useState, type ComponentType, type ReactNode } from "react"
import { View } from "react-native"

import { IconContext } from "../native/icon-context"
import { wrapIcon, type IconProps } from "../native/icons"
import { useColors } from "../native/theme"
import { Div, Span, type BoxProps } from "../primitives.native"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./collapsible.native"

const ChevronRightIcon = wrapIcon("ChevronRightIcon", L.ChevronRightIcon as unknown as ComponentType<IconProps>)

type TraceStatus = "running" | "error" | "pending"

const LineContext = createContext<TraceStatus | undefined>(undefined)
const OpenContext = createContext(false)

/** The steps an assistant took: lines, some of which open to show what happened. */
export function Trace({ className = "", ...props }: BoxProps) {
  return <Div data-slot="trace" {...props} className={`flex w-full min-w-0 flex-col gap-3 ${className}`} />
}

/** One step: icon, title, a detail; red on error, faded while pending. */
export function TraceLine({ className = "", status, style, ...props }: BoxProps & { status?: TraceStatus }) {
  const colors = useColors()
  return (
    <LineContext.Provider value={status}>
      <IconContext.Provider value={{ size: 16, color: status === "error" ? colors.destructive : colors.mutedForeground }}>
        <Div data-slot="trace-line" {...props} className={`flex flex-row max-w-full min-w-0 items-center gap-2 text-sm ${status === "error" ? "text-destructive" : "text-muted-foreground"} ${className}`} style={[{ alignSelf: "flex-start", opacity: status === "pending" ? 0.6 : 1 }, style]} />
      </IconContext.Provider>
    </LineContext.Provider>
  )
}

export function TraceIcon({ className = "", children, ...props }: BoxProps) {
  const around = useContext(IconContext)
  return (
    <Div aria-hidden {...props} className={`flex size-4 shrink-0 items-center justify-center ${className}`}>
      <IconContext.Provider value={{ size: 16, ...around }}>{children}</IconContext.Provider>
    </Div>
  )
}

export function TraceTitle({ className = "", ...props }: BoxProps) {
  const running = useContext(LineContext) === "running"
  return <Span data-slot="trace-title" {...props} className={`min-w-0 truncate ${className}`} style={running ? { opacity: 0.7 } : undefined} />
}

export function TraceDescription({ className = "", ...props }: BoxProps) {
  return <Span data-slot="trace-description" {...props} className={`shrink-0 text-muted-foreground/70 tabular-nums ${className}`} />
}

type CollapsibleProps = { className?: string; children?: ReactNode; defaultOpen?: boolean; open?: boolean; onOpenChange?: (open: boolean) => void }

/** A step that opens: its trigger turns its chevron, its content hangs from a rule on the left. */
export function TraceCollapsible({ className = "", open, defaultOpen, onOpenChange, children }: CollapsibleProps) {
  const [own, setOwn] = useState(Boolean(defaultOpen))
  const shown = open ?? own
  return (
    <OpenContext.Provider value={shown}>
      <Collapsible open={shown} onOpenChange={(next) => (setOwn(next), onOpenChange?.(next))}>
        <Div data-slot="trace-collapsible" className={`flex w-full min-w-0 flex-col ${className}`}>
          {children}
        </Div>
      </Collapsible>
    </OpenContext.Provider>
  )
}

export function TraceCollapsibleTrigger({ className = "", children }: { className?: string; children?: ReactNode }) {
  const open = useContext(OpenContext)
  const colors = useColors()
  return (
    <CollapsibleTrigger aria-expanded={open}>
      <Div className={`flex flex-row max-w-full min-w-0 items-center gap-1 rounded-lg text-muted-foreground ${className}`} style={{ alignSelf: "flex-start" }}>
        {children}
        <View style={{ transform: [{ rotate: open ? "90deg" : "0deg" }] }}>
          <TraceIcon>
            <ChevronRightIcon color={colors.mutedForeground} />
          </TraceIcon>
        </View>
      </Div>
    </CollapsibleTrigger>
  )
}

export function TraceCollapsibleContent({ className = "", children }: { className?: string; children?: ReactNode }) {
  return (
    <CollapsibleContent>
      <Div data-slot="trace-collapsible-content-inner" className={`mt-2.5 mb-1 min-w-0 border-l pr-1 pl-4 text-muted-foreground ${className}`} style={{ marginLeft: 7 }}>
        {typeof children === "string" ? <Span style={{ lineHeight: 22.75 }}>{children}</Span> : children}
      </Div>
    </CollapsibleContent>
  )
}
