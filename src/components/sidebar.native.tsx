import { MenuIcon } from "../native/icons"
import { createContext, useContext, useMemo, useState, type CSSProperties, type ReactElement, type ReactNode } from "react"
import { Pressable, ScrollView, type ViewStyle } from "react-native"

import { useIsMobile } from "../hooks/use-mobile.native"
import { IconContext } from "../native/icon-context"
import { Div, Span, type BoxProps } from "../primitives.native"
import { rendered } from "../native/slot"
import { useColors } from "../native/theme"
import { useTw } from "../native/use-tw"
import { Button } from "./button.native"
import { Input, type InputProps } from "./input.native"
import { Dialog, DialogContent } from "./dialog.native"

type Ctx = { isMobile: boolean; state: "expanded" | "collapsed"; open: boolean; setOpen: (open: boolean) => void; openMobile: boolean; setOpenMobile: (open: boolean) => void; toggleSidebar: () => void }
const SidebarCtx = createContext<Ctx | null>(null)

export function useSidebar() {
  const context = useContext(SidebarCtx)
  if (!context) throw new Error("useSidebar must be used within a SidebarProvider.")
  return context
}

/** The same parts as @clegra/ui's web. */
export function SidebarProvider({ open = true, children, className = "" }: { open?: boolean; defaultOpen?: boolean; onOpenChange?: (open: boolean) => void; style?: CSSProperties; className?: string; children?: ReactNode }) {
  const isMobile = useIsMobile()
  const [openMobile, setOpenMobile] = useState(false)
  const value = useMemo<Ctx>(() => ({ isMobile, state: "expanded", open, setOpen: () => {}, openMobile, setOpenMobile, toggleSidebar: () => setOpenMobile((v) => !v) }), [isMobile, open, openMobile])
  return (
    <SidebarCtx.Provider value={value}>
      <Div className={`flex flex-row flex-1 w-full ${className}`}>{children}</Div>
    </SidebarCtx.Provider>
  )
}

export function Sidebar({ className = "", children }: BoxProps & { collapsible?: "offcanvas" | "icon" | "none"; side?: "left" | "right"; variant?: "sidebar" | "floating" | "inset" }) {
  const { isMobile, openMobile, setOpenMobile } = useSidebar()
  if (isMobile)
    return (
      <Dialog open={openMobile} onOpenChange={setOpenMobile}>
        <DialogContent side="left" showCloseButton={false} className="w-72 p-0 gap-0">
          <Div className="flex flex-col flex-1 bg-sidebar">{children}</Div>
        </DialogContent>
      </Dialog>
    )
  return <Div className={`flex flex-col h-full w-56 bg-sidebar text-sidebar-foreground border-r border-border ${className}`}>{children}</Div>
}

export function SidebarTrigger({ className = "" }: { className?: string }) {
  const { toggleSidebar } = useSidebar()
  return (
    <Button variant="ghost" size="icon-sm" className={className} aria-label="Toggle Sidebar" onClick={toggleSidebar as never}>
      <MenuIcon />
    </Button>
  )
}

const part = (base: string) =>
  function Part({ className = "", ...props }: BoxProps) {
    return <Div {...props} className={`${base} ${className}`} />
  }

export const SidebarRail = () => null
export const SidebarInset = part("flex flex-1 flex-col bg-background")
export const SidebarHeader = part("flex flex-col gap-2 p-2")
export const SidebarFooter = part("flex flex-col gap-2 p-2")
export const SidebarSeparator = () => <Div className="bg-sidebar-border h-px mx-2" />
export const SidebarContent = ({ children }: BoxProps) => (
  <ScrollView style={{ flex: 1, minHeight: 0 }}>
    <Div className="flex flex-col gap-0">{children}</Div>
  </ScrollView>
)
export const SidebarGroup = part("flex flex-col w-full min-w-0 p-2")
export const SidebarGroupLabel = part("flex flex-row h-8 shrink-0 items-center rounded-xl px-3 text-xs font-medium text-sidebar-foreground/70")
export const SidebarGroupAction = () => null
export const SidebarGroupContent = part("w-full text-sm")
export const SidebarMenu = part("flex flex-col w-full min-w-0 gap-0.5")
export const SidebarMenuItem = part("relative")
export const SidebarMenuSkeleton = () => null
export const SidebarMenuAction = () => null
export const SidebarMenuSub = part("flex flex-col mx-3.5 min-w-0 gap-1 border-l border-sidebar-border px-2.5 py-0.5")
export const SidebarMenuSubItem = part("relative")
export const SidebarMenuBadge = ({ className = "", children }: BoxProps) => (
  <Div className={`absolute right-1 top-2 flex flex-row h-5 min-w-5 items-center justify-center rounded-md px-1 ${className}`}>
    <Span className="text-xs font-medium text-sidebar-foreground">{children}</Span>
  </Div>
)

export const SidebarInput = ({ className = "", ...props }: InputProps) => <Input {...props} className={`h-8 w-full bg-background ${className}`} />

function Row({ classes, active, render, children, onClick, style, ...props }: { classes: string; active?: boolean; render?: ReactElement; children?: ReactNode; onClick?: (event: never) => void; style?: ViewStyle; [key: `data-${string}`]: unknown }) {
  const colors = useColors()
  const [hover, setHover] = useState(false)
  const parsed = useTw(classes)
  const lit = active || hover
  const color = lit ? colors.sidebarAccentForeground : colors.sidebarForeground
  const content = (
    <IconContext.Provider value={{ size: 16, color }}>
      <Div className={active ? "flex flex-row flex-1 min-w-0 items-center gap-2 font-medium" : "flex flex-row flex-1 min-w-0 items-center gap-2"} style={{ color }}>
        {children}
      </Div>
    </IconContext.Provider>
  )
  const box = [parsed.view, lit ? { backgroundColor: colors.sidebarAccent } : null, style]
  return rendered(
    render,
    { style: box, onHoverIn: () => setHover(true), onHoverOut: () => setHover(false), onClick },
    () => (
      <Pressable {...(props as object)} onPress={onClick as never} onHoverIn={() => setHover(true)} onHoverOut={() => setHover(false)} style={box}>
        {content}
      </Pressable>
    ),
    content,
  )
}

const sizes = { default: "h-9", sm: "h-8", lg: "h-14 px-3" }

export function SidebarMenuButton({ render, isActive, size = "default", className = "", onClick, children, ...props }: { render?: ReactElement; isActive?: boolean; size?: keyof typeof sizes; variant?: "default" | "outline"; tooltip?: unknown; className?: string; onClick?: (event: never) => void; children?: ReactNode; [key: `data-${string}`]: unknown }) {
  return (
    <Row {...props} classes={`flex flex-row w-full items-center gap-2 overflow-hidden rounded-xl px-3 py-2 ${sizes[size]} ${className}`} active={isActive} render={render} onClick={onClick}>
      {children}
    </Row>
  )
}

export function SidebarMenuSubButton({ render, isActive, className = "", children }: { render?: ReactElement; isActive?: boolean; size?: "sm" | "md"; className?: string; children?: ReactNode }) {
  return (
    <Row classes={`flex flex-row h-7 min-w-0 items-center gap-2 overflow-hidden rounded-xl px-2.5 ${className}`} active={isActive} render={render}>
      {children}
    </Row>
  )
}
