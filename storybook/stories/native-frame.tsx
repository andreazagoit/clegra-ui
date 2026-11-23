import type { ReactNode } from "react"
import { View } from "react-native"

import { OverlayHost } from "@clegra/ui/native/overlay"
import { Toaster } from "@clegra/ui/drawn/components/sonner"

/** A React Native screen around a story: the overlays' host and the drawn toasts, as in the app. */
export function NativeFrame({ children }: { children: ReactNode }) {
  return (
    <OverlayHost>
      <View style={{ gap: 12 }}>{children}</View>
      <Toaster />
    </OverlayHost>
  )
}
