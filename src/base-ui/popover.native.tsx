import { createContext, useContext, useState, type ReactElement, type ReactNode } from "react"
import { Pressable, View } from "react-native"

import { Floating, Portal, useAnchor, type Rect } from "../native/overlay"
import { rendered } from "../native/slot"
import { useColors } from "../native/theme"

type Ctx = { open: boolean; setOpen: (open: boolean) => void; anchor: ReturnType<typeof useAnchor> }
const PopoverCtx = createContext<Ctx | null>(null)

/** Base UI's Popover, which the client uses directly. */
function Root({ open, onOpenChange, children }: { open?: boolean; onOpenChange?: (open: boolean) => void; children?: ReactNode }) {
  const [own, setOwn] = useState(false)
  const anchor = useAnchor()
  return <PopoverCtx.Provider value={{ open: open ?? own, setOpen: (next) => (setOwn(next), onOpenChange?.(next)), anchor }}>{children}</PopoverCtx.Provider>
}

function Trigger({ render, children }: { render?: ReactElement; children?: ReactNode; id?: string; className?: string }) {
  const popover = useContext(PopoverCtx)!
  const press = () => popover.anchor.measure(() => popover.setOpen(true))
  return (
    <View ref={popover.anchor.ref} collapsable={false} style={{ alignSelf: "flex-start", alignItems: "flex-start" }}>
      {rendered(render, { onClick: press }, () => <Pressable onPress={press}>{children}</Pressable>, children)}
    </View>
  )
}

const Portalled = ({ children }: { children?: ReactNode }) => <>{children}</>

const PositionContext = createContext<{ align?: "start" | "end" | "center" }>({})
const Positioner = ({ align, children }: { align?: "start" | "end" | "center"; sideOffset?: number; className?: string; children?: ReactNode }) => <PositionContext.Provider value={{ align }}>{children}</PositionContext.Provider>

function Popup({ className = "", children }: { className?: string; children?: ReactNode }) {
  const popover = useContext(PopoverCtx)!
  const { align } = useContext(PositionContext)
  const colors = useColors()
  if (!popover.open) return null
  const width = /w-(\d+)/.exec(className)?.[1]
  return (
    <Portal>
      <PopoverCtx.Provider value={popover}>
        <Floating rect={popover.anchor.rect as Rect} onClose={() => popover.setOpen(false)} align={align} width={width ? Number(width) * 4 : undefined} height={320}>
          <View style={{ padding: 12, gap: 12, borderRadius: 14, backgroundColor: colors.popover, borderWidth: 1, borderColor: colors.border, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 12, shadowOffset: { width: 0, height: 4 } }}>{children}</View>
        </Floating>
      </PopoverCtx.Provider>
    </Portal>
  )
}

export const Popover = { Root, Trigger, Portal: Portalled, Positioner, Popup }
