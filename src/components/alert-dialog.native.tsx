import { createContext, useContext, useState, type ReactElement, type ReactNode } from "react"
import { Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from "react-native"

import { Portal } from "../native/overlay"
import { Div, type BoxProps } from "../primitives.native"
import { rendered } from "../native/slot"
import { Button, type ButtonProps } from "./button.native"

type Ctx = { open: boolean; setOpen: (open: boolean) => void; size: "default" | "sm" }
const AlertCtx = createContext<Ctx>({ open: false, setOpen: () => {}, size: "default" })

/** shadcn's AlertDialog, drawn. Like Base UI's: a press outside does not close it, only Cancel (or a controlled `open`). */
export function AlertDialog({ open, defaultOpen, onOpenChange, children }: { open?: boolean; defaultOpen?: boolean; onOpenChange?: (open: boolean) => void; children?: ReactNode }) {
  const [own, setOwn] = useState(Boolean(defaultOpen))
  return <AlertCtx.Provider value={{ open: open ?? own, setOpen: (next) => (setOwn(next), onOpenChange?.(next)), size: "default" }}>{children}</AlertCtx.Provider>
}

export function AlertDialogTrigger({ render, children }: { render?: ReactElement; children?: ReactNode; className?: string }) {
  const { setOpen } = useContext(AlertCtx)
  return rendered(render, { onClick: () => setOpen(true) }, () => <Pressable onPress={() => setOpen(true)}>{children}</Pressable>, children)
}

export const AlertDialogPortal = ({ children }: { children?: ReactNode }) => <>{children}</>
export const AlertDialogOverlay = () => null

export function AlertDialogContent({ className = "", size = "default", children }: BoxProps & { size?: "default" | "sm" }) {
  const alert = useContext(AlertCtx)
  const { height } = useWindowDimensions()
  if (!alert.open) return null
  return (
    <Portal>
      <AlertCtx.Provider value={{ ...alert, size }}>
        <View style={[StyleSheet.absoluteFill, styles.back]}>
          <Div role="alertdialog" aria-modal className={`w-full ${size === "sm" ? "max-w-xs" : "max-w-xs sm:max-w-md"} rounded-4xl bg-popover p-6 text-popover-foreground border border-border ${className}`} style={[styles.shadow, { maxHeight: height * 0.9 }]}>
            <ScrollView contentContainerStyle={{ gap: 24 }}>{children}</ScrollView>
          </Div>
        </View>
      </AlertCtx.Provider>
    </Portal>
  )
}

/** The web's header: centred; left-aligned from `sm` up in the default size. */
export function AlertDialogHeader({ className = "", ...props }: BoxProps) {
  const { size } = useContext(AlertCtx)
  const { width } = useWindowDimensions()
  const left = size === "default" && width >= 640
  return <Div {...props} className={`flex flex-col gap-1.5 ${left ? "items-start text-left" : "items-center text-center"} ${className}`} />
}

/** Stacked (cancel under the action) on narrow windows, a row on the right from `sm`; two columns in the small size. */
export function AlertDialogFooter({ className = "", style, ...props }: BoxProps) {
  const { size } = useContext(AlertCtx)
  const { width } = useWindowDimensions()
  if (size === "sm") return <Div {...props} className={`flex flex-row gap-2 ${className}`} style={style} />
  return <Div {...props} className={`flex gap-2 ${width >= 640 ? "flex-row justify-end" : ""} ${className}`} style={[width >= 640 ? null : { flexDirection: "column-reverse" }, style]} />
}

export const AlertDialogMedia = ({ className = "", ...props }: BoxProps) => <Div {...props} className={`mb-2 flex size-16 items-center justify-center rounded-full bg-muted ${className}`} />
export const AlertDialogTitle = ({ className = "", ...props }: BoxProps) => <Div {...props} role="heading" className={`text-lg font-medium ${className}`} />
export const AlertDialogDescription = ({ className = "", ...props }: BoxProps) => <Div {...props} className={`text-sm text-muted-foreground ${className}`} />

/** A plain Button: as on the web, it runs `onClick` and leaves closing to the caller. */
export function AlertDialogAction({ className, ...props }: ButtonProps) {
  const { size } = useContext(AlertCtx)
  return <Button {...props} className={`${size === "sm" ? "flex-1" : ""} ${className ?? ""}`} />
}

export function AlertDialogCancel({ variant = "outline", size = "default", className, onClick, ...props }: ButtonProps) {
  const alert = useContext(AlertCtx)
  return <Button {...props} variant={variant} size={size} className={`${alert.size === "sm" ? "flex-1" : ""} ${className ?? ""}`} onClick={(event: unknown) => (onClick?.(event), alert.setOpen(false))} />
}

const styles = StyleSheet.create({
  back: { alignItems: "center", justifyContent: "center", padding: 16, backgroundColor: "rgba(0,0,0,0.3)" },
  shadow: { shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 25, shadowOffset: { width: 0, height: 20 } },
})

/** For the iOS file: the drawn state. */
export { AlertCtx }
