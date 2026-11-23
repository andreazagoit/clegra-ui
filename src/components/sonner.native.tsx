import { CircleCheckIcon, InfoIcon, OctagonXIcon, TriangleAlertIcon } from "../native/icons"
import { View } from "react-native"

import { Div, Span } from "../primitives.native"
import { useColors } from "../native/theme"
import { useToasts, type Toast } from "../native/toast"

const icons = { success: CircleCheckIcon, error: OctagonXIcon, info: InfoIcon, warning: TriangleAlertIcon }

function Item({ toast }: { toast: Toast }) {
  const colors = useColors()
  const Icon = icons[toast.kind]
  return (
    <View role="status" style={{ flexDirection: "row", gap: 8, padding: 16, width: 356, borderRadius: 14, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.popover, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 12, shadowOffset: { width: 0, height: 4 } }}>
      <Icon />
      <Div className="flex flex-col flex-1 gap-0.5">
        <Span className="text-sm font-medium">{toast.title}</Span>
        {toast.description ? <Span className="text-xs text-muted-foreground">{toast.description}</Span> : null}
      </Div>
    </View>
  )
}

/** The toasts, bottom right. */
export function Toaster(_: { richColors?: boolean; position?: string; closeButton?: boolean }) {
  const toasts = useToasts()
  if (!toasts.length) return null
  return (
    <View pointerEvents="none" style={{ position: "absolute", right: 16, bottom: 16, gap: 8, zIndex: 100 }}>
      {toasts.map((toast) => (
        <Item key={toast.id} toast={toast} />
      ))}
    </View>
  )
}
