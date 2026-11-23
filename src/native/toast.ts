import { useSyncExternalStore } from "react"

/** sonner's `toast` for React Native (metro.config.js sends it here); <Toaster /> in components/sonner.tsx draws them. */
export type Toast = { id: number; kind: "success" | "error" | "info" | "warning"; title: string; description?: string }

let toasts: Toast[] = []
let next = 1
const listeners = new Set<() => void>()
const changed = () => listeners.forEach((l) => l())

function show(kind: Toast["kind"], title: string, options?: { description?: string }) {
  const id = next++
  toasts = [...toasts, { id, kind, title, description: options?.description }]
  changed()
  setTimeout(() => dismiss(id), 4000)
  return id
}

function dismiss(id: number) {
  toasts = toasts.filter((t) => t.id !== id)
  changed()
}

export const toast = Object.assign((title: string, options?: { description?: string }) => show("info", title, options), {
  success: (title: string, options?: { description?: string }) => show("success", title, options),
  error: (title: string, options?: { description?: string }) => show("error", title, options),
  info: (title: string, options?: { description?: string }) => show("info", title, options),
  warning: (title: string, options?: { description?: string }) => show("warning", title, options),
  dismiss,
})

export const useToasts = () =>
  useSyncExternalStore(
    (listener) => {
      listeners.add(listener)
      return () => void listeners.delete(listener)
    },
    () => toasts,
    () => toasts,
  )
