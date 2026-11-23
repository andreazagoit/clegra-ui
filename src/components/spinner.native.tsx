import { ActivityIndicator } from "react-native"

import { useColors } from "../native/theme"
import { useTw } from "../native/use-tw"

/** The system's progress indicator (NSProgressIndicator, UIActivityIndicatorView). */
export function Spinner({ className }: { className?: string }) {
  const colors = useColors()
  const parsed = useTw(className)
  return <ActivityIndicator accessibilityLabel="Caricamento" size="small" color={parsed.icon?.color ?? colors.mutedForeground} />
}
