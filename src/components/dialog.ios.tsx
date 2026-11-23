import { presentationDragIndicator } from "@expo/ui/swift-ui/modifiers"

import { dialogContentFor } from "../native/expo-ui-dialog"

export * from "./dialog.native"

/**
 * iOS: a dialog is the system's sheet from the bottom (Expo UI's BottomSheet,
 * from native/expo-ui-dialog.tsx) with the drag indicator and
 * the swipe to dismiss. A side panel stays drawn (dialog.native.tsx).
 */
export const DialogContent = dialogContentFor({ modifiers: [presentationDragIndicator("visible")] })
