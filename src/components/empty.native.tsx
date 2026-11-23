import { Div, type BoxProps } from "../primitives.native"

const part = (base: string) =>
  function Part({ className = "", ...props }: BoxProps) {
    return <Div {...props} className={`${base} ${className}`} />
  }

export const Empty = part("flex w-full flex-1 flex-col items-center justify-center gap-4 rounded-2xl border-dashed border-border p-12 text-center")
export const EmptyHeader = part("flex max-w-sm flex-col items-center gap-2")
export const EmptyMedia = ({ className = "", variant = "default", ...props }: BoxProps & { variant?: "default" | "icon" }) => <Div {...props} className={`mb-2 flex shrink-0 items-center justify-center ${variant === "icon" ? "size-10 rounded-xl bg-muted text-foreground" : ""} ${className}`} />
export const EmptyTitle = part("text-lg font-medium tracking-tight")
export const EmptyDescription = part("text-sm leading-relaxed text-muted-foreground text-center")
export const EmptyContent = part("flex w-full max-w-sm flex-col items-center gap-4 text-sm")
