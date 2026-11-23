import { Alert, Button, Text } from "@expo/ui/swift-ui"
import { Children, isValidElement, useContext, type ReactElement, type ReactNode } from "react"

import { ExpoHost } from "./expo-ui-controls"
import * as D from "../components/alert-dialog.native"

type El = ReactElement<Record<string, unknown>>
const elements = (nodes: unknown) => Children.toArray(nodes as ReactNode).filter(isValidElement) as El[]
const find = (nodes: unknown, type: unknown): El | undefined => {
  for (const el of elements(nodes)) {
    if (el.type === type) return el
    const inner = find(el.props.children, type)
    if (inner) return inner
  }
}

/**
 * iOS: the system's alert (SwiftUI through Expo UI) when the content is a text
 * title, an optional text description, and text Cancel and Action buttons.
 * With media, icons or other content it stays drawn (alert-dialog.native.tsx).
 */
export function AlertDialogContent(props: Parameters<typeof D.AlertDialogContent>[0]) {
  const alert = useContext(D.AlertCtx)
  const title = find(props.children, D.AlertDialogTitle)?.props.children
  const description = find(props.children, D.AlertDialogDescription)?.props.children
  const footer = find(props.children, D.AlertDialogFooter)
  const buttons = footer ? elements(footer.props.children) : []
  const plain = typeof title === "string" && (description === undefined || typeof description === "string") && !find(props.children, D.AlertDialogMedia) && buttons.length > 0 && buttons.every((b) => (b.type === D.AlertDialogAction || b.type === D.AlertDialogCancel) && typeof b.props.children === "string")
  if (!plain) return <D.AlertDialogContent {...props} />
  return (
    <ExpoHost matchContents>
      <Alert title={title} isPresented={alert.open} onIsPresentedChange={alert.setOpen}>
        <Alert.Trigger>
          <Text>{""}</Text>
        </Alert.Trigger>
        <Alert.Actions>
          {buttons.map((b, i) => {
            const cancel = b.type === D.AlertDialogCancel
            const click = b.props.onClick as ((event: unknown) => void) | undefined
            return <Button key={i} label={b.props.children as string} role={cancel ? "cancel" : b.props.variant === "destructive" ? "destructive" : "default"} onPress={() => (click?.(undefined), alert.setOpen(false))} />
          })}
        </Alert.Actions>
        {description ? (
          <Alert.Message>
            <Text>{description as string}</Text>
          </Alert.Message>
        ) : null}
      </Alert>
    </ExpoHost>
  )
}
