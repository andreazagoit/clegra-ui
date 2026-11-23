import type { ReactNode } from "react"
import { ScrollView } from "react-native"

import { useTw } from "../native/use-tw"

/** NSScrollView and UIScrollView, through React Native's own. */
export function ScrollArea({ className, children }: { className?: string; children?: ReactNode }) {
  const parsed = useTw(className)
  return <ScrollView style={parsed.view}>{children}</ScrollView>
}
export const ScrollBar = () => null
