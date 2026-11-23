import { createContext, useContext, useEffect, useRef, useState, type ReactNode, type RefObject } from "react"
import { Dimensions, Pressable, StyleSheet, View, type ViewStyle, type ViewInstance } from "react-native"

type Entry = { id: object; node: ReactNode }
const HostContext = createContext<(id: object, node: ReactNode | null) => void>(() => {})

/**
 * Where everything floating shows (dialogs, sheets, menus, selects, popovers),
 * over the whole app, in the app's own tree (not React Native's Modal).
 */
export function OverlayHost({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<Entry[]>([])
  const set = useRef((id: object, node: ReactNode | null) =>
    setEntries((list) => {
      const rest = list.filter((e) => e.id !== id)
      if (node === null) return rest.length === list.length ? list : rest
      return list.some((e) => e.id === id) ? list.map((e) => (e.id === id ? { id, node } : e)) : [...rest, { id, node }]
    }),
  ).current
  return (
    <HostContext.Provider value={set}>
      <View style={{ flex: 1 }}>
        {children}
        {entries.map((entry, index) => (
          <View key={index} pointerEvents="box-none" style={[StyleSheet.absoluteFill, { zIndex: 50 + index }]}>
            {entry.node}
          </View>
        ))}
      </View>
    </HostContext.Provider>
  )
}

/** Shows `children` in the host. Contexts don't cross: the caller wraps them again. */
export function Portal({ children }: { children: ReactNode }) {
  const set = useContext(HostContext)
  const id = useRef({}).current
  useEffect(() => {
    set(id, children)
  })
  useEffect(() => () => set(id, null), [id, set])
  return null
}

export type Rect = { x: number; y: number; width: number; height: number }

/** Where a trigger is in the window, for what opens under it. */
export function useAnchor(): { ref: RefObject<ViewInstance | null>; rect: Rect | null; measure: (then?: () => void) => void } {
  const ref = useRef<ViewInstance>(null)
  const [rect, setRect] = useState<Rect | null>(null)
  const measure = (then?: () => void) =>
    void ref.current?.measureInWindow((x, y, width, height) => {
      setRect({ x, y, width, height })
      then?.()
    })
  return { ref, rect, measure }
}

/** A panel under its anchor, over it near the window's bottom; a press outside closes it. */
export function Floating({ rect, onClose, align = "start", width, height = 240, children, style }: { rect: Rect | null; onClose: () => void; align?: "start" | "end" | "center"; width?: number; height?: number; children: ReactNode; style?: ViewStyle }) {
  if (!rect) return null
  const screen = Dimensions.get("window")
  const above = rect.y + rect.height + height > screen.height - 8
  const w = width ?? rect.width
  const left = align === "end" ? rect.x + rect.width - w : align === "center" ? rect.x + rect.width / 2 - w / 2 : rect.x
  return (
    <>
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Chiudi" />
      <View style={[{ position: "absolute", left: Math.max(8, left), minWidth: width ? undefined : rect.width, width }, above ? { bottom: screen.height - rect.y + 4 } : { top: rect.y + rect.height + 4 }, style]}>{children}</View>
    </>
  )
}
