import { ProgressView } from "@expo/ui/swift-ui"
import { accessibilityLabel, tint } from "@expo/ui/swift-ui/modifiers"

import { ExpoHost } from "./expo-ui-controls"
import { useColors } from "./theme"
import { useTw } from "./use-tw"

/** iOS: SwiftUI's indeterminate ProgressView (Expo UI), in the colour the classes give. */
export function Spinner({ className }: { className?: string }) {
  const colors = useColors()
  const parsed = useTw(className)
  return (
    <ExpoHost matchContents>
      <ProgressView modifiers={[tint(parsed.icon?.color ?? colors.mutedForeground), accessibilityLabel("Caricamento")]} />
    </ExpoHost>
  )
}
