import { XIcon } from "../native/icons"
import { createContext, useContext, useState, type ReactElement, type ReactNode } from "react"
import { Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from "react-native"

import { Portal } from "../native/overlay"
import { Div, type BoxProps } from "../primitives.native"
import { rendered } from "../native/slot"
import { useColors } from "../native/theme"
import { useTw } from "../native/use-tw"
import { Button } from "./button.native"

type Ctx = { open: boolean; setOpen: (open: boolean) => void }
export const DialogCtx = createContext<Ctx>({ open: false, setOpen: () => {} })

export function Dialog({ open, defaultOpen, onOpenChange, children }: { open?: boolean; defaultOpen?: boolean; onOpenChange?: (open: boolean) => void; children?: ReactNode }) {
  const [own, setOwn] = useState(Boolean(defaultOpen))
  const shown = open ?? own
  return <DialogCtx.Provider value={{ open: shown, setOpen: (next) => (setOwn(next), onOpenChange?.(next)) }}>{children}</DialogCtx.Provider>
}

export function DialogTrigger({ render, children }: { render?: ReactElement; children?: ReactNode }) {
  const { setOpen } = useContext(DialogCtx)
  return rendered(render, { onClick: () => setOpen(true) }, () => <Pressable onPress={() => setOpen(true)}>{children}</Pressable>, children)
}

export function DialogClose({ render, children }: { render?: ReactElement; children?: ReactNode }) {
  const { setOpen } = useContext(DialogCtx)
  return rendered(render, { onClick: () => setOpen(false) }, () => <Pressable onPress={() => setOpen(false)}>{children}</Pressable>, children)
}

/** A drawn panel over the app. */
export function DialogContent({ className = "", showCloseButton = true, children, side }: BoxProps & { showCloseButton?: boolean; side?: "right" | "left" | "top" | "bottom"; onKeyDown?: unknown }) {
  const dialog = useContext(DialogCtx)
  const colors = useColors()
  const { height } = useWindowDimensions()
  const parsed = useTw(`w-full max-w-sm sm:max-w-md gap-4 rounded-3xl bg-popover p-6 text-sm border border-border ${className}`)
  if (!dialog.open) return null
  const close = () => dialog.setOpen(false)
  return (
    <Portal>
      <DialogCtx.Provider value={dialog}>
        <Pressable accessibilityLabel="Chiudi" onPress={close} style={[StyleSheet.absoluteFill, styles.back, side ? (side === "left" ? styles.left : styles.right) : null, { backgroundColor: colors.overlay }]}>
          <Pressable accessibilityRole="none" onPress={() => {}} style={[parsed.view, side ? { height: "100%", borderRadius: 0, maxWidth: 384 } : { maxHeight: height * 0.9 }]}>
            <ScrollView contentContainerStyle={{ gap: 16 }}>{children}</ScrollView>
            {showCloseButton && (
              <View style={styles.close}>
                <Button variant="ghost" size="icon-sm" aria-label="Chiudi" onClick={close as never}>
                  <XIcon />
                </Button>
              </View>
            )}
          </Pressable>
        </Pressable>
      </DialogCtx.Provider>
    </Portal>
  )
}

const part = (base: string) =>
  function Part({ className = "", ...props }: BoxProps) {
    return <Div {...props} className={`${base} ${className}`} />
  }

export const DialogHeader = part("flex flex-col gap-1.5")
export const DialogFooter = part("flex flex-row justify-end gap-2")
export const DialogTitle = part("text-base font-medium")
export const DialogDescription = part("text-sm text-muted-foreground")
export const DialogOverlay = () => null
export const DialogPortal = ({ children }: { children?: ReactNode }) => <>{children}</>

const styles = StyleSheet.create({
  back: { alignItems: "center", justifyContent: "center", padding: 16 },
  right: { alignItems: "flex-end", padding: 0 },
  left: { alignItems: "flex-start", padding: 0 },
  close: { position: "absolute", top: 8, right: 8 },
})
