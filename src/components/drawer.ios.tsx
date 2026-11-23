import { presentationDragIndicator } from "@expo/ui/swift-ui/modifiers"

import { drawerContentFor } from "../native/expo-ui-drawer"

export * from "./drawer.native"

/**
 * iOS: a drawer from the bottom is the system's sheet (Expo UI's BottomSheet,
 * from native/expo-ui-drawer.tsx), with the system's drag to
 * dismiss and its drag indicator for `showSwipeHandle`. Drawers from the
 * other edges stay drawn (drawer.native.tsx).
 */
export const DrawerContent = drawerContentFor((handle) => ({ modifiers: [presentationDragIndicator(handle ? "visible" : "automatic")] }))
