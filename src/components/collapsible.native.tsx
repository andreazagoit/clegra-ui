import { createContext, useContext, useState, type ReactElement, type ReactNode } from "react"
import { Pressable } from "react-native"

import { rendered } from "../native/slot"

const Ctx = createContext<{ open: boolean; toggle: () => void }>({ open: false, toggle: () => {} })

export function Collapsible({ open, defaultOpen, onOpenChange, render, children }: { open?: boolean; defaultOpen?: boolean; onOpenChange?: (open: boolean) => void; render?: ReactElement; children?: ReactNode }) {
  const [own, setOwn] = useState(Boolean(defaultOpen))
  const shown = open ?? own
  const value = { open: shown, toggle: () => (setOwn(!shown), onOpenChange?.(!shown)) }
  return <Ctx.Provider value={value}>{rendered(render, {}, () => <>{children}</>, children)}</Ctx.Provider>
}

/** The web's trigger is a <button> in the collapsible's block: as wide as its content, unless it asks for the full width. */
export function CollapsibleTrigger({ render, onClick, children, ...props }: { render?: ReactElement; onClick?: () => void; children?: ReactNode; [key: `data-${string}`]: unknown }) {
  const { toggle } = useContext(Ctx)
  const press = () => {
    toggle()
    onClick?.()
  }
  const classes = `${(render?.props as { className?: string } | undefined)?.className ?? ""}`
  const style = /(^|\s)(w-full|flex-1|self-stretch)(\s|$)/.test(classes) ? undefined : { alignSelf: "flex-start" as const }
  return rendered(render, { ...props, onClick: press, style: [(render?.props as { style?: unknown } | undefined)?.style, style] }, () => <Pressable onPress={press} style={style}>{children}</Pressable>, children)
}

export function CollapsibleContent({ children }: { children?: ReactNode }) {
  return useContext(Ctx).open ? <>{children}</> : null
}
