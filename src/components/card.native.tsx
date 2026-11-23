import { StyleSheet, View } from "react-native"

import { useTw } from "../native/use-tw"
import type { BoxProps } from "../primitives.native"
import { Div } from "../primitives.native"

const part = (base: string) =>
  function Part({ className = "", ...props }: BoxProps) {
    return <Div {...props} className={`${base} ${className}`} />
  }

/**
 * The web's card: its hairline is a ring (a shadow that takes no room), so
 * here it is a border drawn over the card rather than around its content.
 */
export function Card({ className = "", children, ...props }: BoxProps) {
  const ring = useTw("border-foreground/5 dark:border-foreground/10").view.borderColor
  return (
    <Div {...props} className={`flex flex-col gap-6 overflow-hidden rounded-4xl bg-card py-6 text-sm text-card-foreground shadow-md ${className}`}>
      {children}
      <View pointerEvents="none" style={[StyleSheet.absoluteFill, { borderWidth: 1, borderColor: ring, borderRadius: 36 }]} />
    </Div>
  )
}
export const CardHeader = part("flex flex-col gap-1.5 px-6")
export const CardTitle = part("text-base font-medium")
export const CardDescription = part("text-sm text-muted-foreground")
export const CardAction = part("self-start")
export const CardContent = part("px-6")
export const CardFooter = part("flex flex-row items-center px-6")
