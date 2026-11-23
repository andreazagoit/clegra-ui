import { Children, cloneElement, isValidElement, type ReactElement } from "react"

import { Div, type BoxProps } from "../primitives.native"

type Orientation = "horizontal" | "vertical"

const R = 36

/**
 * Buttons joined into one control, as the web's: only the outer corners are
 * round, and each piece after the first loses the border it would share with
 * the one before (its left one, or its top one when vertical).
 */
/** The group's classes, as the web's buttonGroupVariants gives them. */
export function buttonGroupVariants({ orientation = "horizontal" }: { orientation?: Orientation | null } = {}) {
  return orientation === "vertical" ? "flex w-fit flex-col items-stretch" : "flex w-fit flex-row items-stretch"
}

export function ButtonGroup({ className = "", orientation = "horizontal", children, ...props }: BoxProps & { orientation?: Orientation | null }) {
  const vertical = orientation === "vertical"
  const parts = Children.toArray(children).filter(isValidElement) as ReactElement<{ style?: unknown }>[]
  const joined = parts.map((child, index) => {
    const first = index === 0
    const last = index === parts.length - 1
    const corners = vertical
      ? { borderTopLeftRadius: first ? R : 0, borderTopRightRadius: first ? R : 0, borderBottomLeftRadius: last ? R : 0, borderBottomRightRadius: last ? R : 0 }
      : { borderTopLeftRadius: first ? R : 0, borderBottomLeftRadius: first ? R : 0, borderTopRightRadius: last ? R : 0, borderBottomRightRadius: last ? R : 0 }
    const seam = first ? null : vertical ? { borderTopWidth: 0 } : { borderLeftWidth: 0 }
    return child.type === ButtonGroupSeparator ? child : cloneElement(child, { style: [child.props.style, corners, seam] })
  })
  return (
    <Div role="group" {...props} className={`flex ${vertical ? "flex-col" : "flex-row"} items-stretch ${className}`} style={{ alignSelf: "flex-start" }}>
      {joined}
    </Div>
  )
}

export const ButtonGroupText = ({ className = "", ...props }: BoxProps) => <Div {...props} className={`flex flex-row items-center gap-2 rounded-4xl border border-border bg-muted px-2.5 text-sm font-medium ${className}`} />

export const ButtonGroupSeparator = ({ orientation = "vertical", className = "" }: { orientation?: Orientation; className?: string }) => <Div className={`bg-input self-stretch ${orientation === "vertical" ? "w-px my-px" : "h-px mx-px"} ${className}`} />
