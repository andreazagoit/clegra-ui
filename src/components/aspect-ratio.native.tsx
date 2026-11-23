import { Div, type BoxProps } from "../primitives.native"

/** A box as wide as its parent and `ratio` times less tall, as `aspect-(--ratio)` on the web. */
export function AspectRatio({ ratio, className = "", style, children, ...props }: BoxProps & { ratio: number }) {
  return (
    <Div {...props} data-slot="aspect-ratio" className={`relative ${className}`} style={[{ aspectRatio: ratio }, style]}>
      {children}
    </Div>
  )
}
