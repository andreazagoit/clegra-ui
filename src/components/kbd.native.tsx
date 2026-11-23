import { Div, type BoxProps } from "../primitives.native"

/** A key, as the web draws it: a muted rounded chip, text-xs, medium. */
export const Kbd = ({ className = "", ...props }: BoxProps) => <Div {...props} className={`flex flex-row h-5.5 min-w-5.5 items-center justify-center self-start gap-1 rounded-lg bg-muted px-1.5 text-xs font-medium text-muted-foreground ${className}`} />

export const KbdGroup = ({ className = "", ...props }: BoxProps) => <Div {...props} className={`flex flex-row items-center gap-1 ${className}`} />
