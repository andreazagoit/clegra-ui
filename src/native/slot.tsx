import { cloneElement, type ReactElement, type ReactNode } from "react"

/** Base UI's `render` prop: the element given, with these props and children. */
export function rendered(render: ReactElement | undefined, props: Record<string, unknown>, fallback: (props: Record<string, unknown>) => ReactNode, children?: ReactNode) {
  if (!render) return fallback(props)
  return cloneElement(render, props as never, children ?? (render.props as { children?: ReactNode }).children)
}
