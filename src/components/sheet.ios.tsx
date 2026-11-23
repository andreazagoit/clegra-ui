import { DialogContent as Drawn } from "./dialog.native"
import { DialogContent } from "./dialog.ios"

export * from "./sheet.native"

/**
 * iOS: a sheet from the bottom is the system's sheet (dialog.ios.tsx: Expo
 * UI's BottomSheet with the content in RNHostView). From the left, right or
 * top (or with no side) it stays the drawn panel (dialog.native.tsx): iOS has
 * no side sheet.
 */
export function SheetContent(props: Parameters<typeof Drawn>[0]) {
  return props.side === "bottom" ? <DialogContent {...props} /> : <Drawn {...props} />
}
