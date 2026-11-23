import { Divider } from "@expo/ui/swift-ui"

import { ExpoHost, useHostLayout } from "./expo-ui-controls"
import { Separator as Drawn } from "../components/separator.native"

/**
 * iOS: SwiftUI's Divider (Expo UI) for a horizontal line, the system's
 * colour and hairline; the classes give only its place (margins, width). A
 * vertical one, which needs the height of its row, stays drawn.
 */
export function Separator(props: { orientation?: "horizontal" | "vertical"; className?: string }) {
  const layout = useHostLayout(`w-full ${props.className ?? ""}`)
  if (props.orientation === "vertical") return <Drawn {...props} />
  if (layout.hidden) return null
  return (
    <ExpoHost matchContents={{ vertical: true }} style={layout.style}>
      <Divider />
    </ExpoHost>
  )
}
