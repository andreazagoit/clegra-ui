import { ProgressView } from "@expo/ui/swift-ui"
import { progressViewStyle, tint } from "@expo/ui/swift-ui/modifiers"
import type { ReactNode } from "react"

import { ExpoHost } from "./expo-ui-controls"
import { useColors } from "./theme"
import { Progress as Drawn } from "../components/progress.native"

/** iOS: SwiftUI's linear ProgressView (Expo UI) for a bare bar; with a label or value inside, drawn. */
export function Progress(props: { value?: number | null; max?: number; className?: string; children?: ReactNode }) {
  const colors = useColors()
  if (props.children) return <Drawn {...props} />
  const max = props.max ?? 100
  return (
    <ExpoHost matchContents={{ vertical: true }} style={{ alignSelf: "stretch" }}>
      <ProgressView value={props.value === null || props.value === undefined ? null : props.value / max} modifiers={[progressViewStyle("linear"), tint(colors.primary)]} />
    </ExpoHost>
  )
}
