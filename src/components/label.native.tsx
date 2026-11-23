import { Children } from "react"
import { StyleSheet, type TextStyle } from "react-native"

import { Div, Span, type BoxProps } from "../primitives.native"

const leadings: Record<string, number> = { none: 14, tight: 17.5, snug: 19.25, normal: 20, relaxed: 22.75 }

/**
 * The web's label: a row, text-sm, medium, leading-none (14 px lines). A
 * `leading-*` class or a `lineHeight` in `style` (FieldLabel's snug) sets the
 * text's line instead. `htmlFor` means nothing off the web.
 */
export const Label = ({ className = "", style, htmlFor: _htmlFor, children, ...props }: BoxProps & { htmlFor?: string }) => {
  const given = (StyleSheet.flatten(style) as TextStyle | undefined)?.lineHeight
  const named = /(?:^|\s)leading-(none|tight|snug|normal|relaxed)(?:\s|$)/.exec(className)?.[1]
  const lineHeight = given ?? leadings[named ?? "none"]
  return (
    <Div {...props} style={style} className={`flex flex-row items-center gap-2 text-sm font-medium ${className}`}>
      {Children.map(children, (child) => (typeof child === "string" || typeof child === "number" ? <Span style={{ lineHeight }}>{child}</Span> : child))}
    </Div>
  )
}
