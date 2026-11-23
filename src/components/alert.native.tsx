import { Children, createContext, isValidElement, useContext, type ReactNode } from "react"

import { IconContext } from "../native/icon-context"
import { useColors } from "../native/theme"
import { Div, type BoxProps } from "../primitives.native"

const Variant = createContext<"default" | "destructive">("default")

const looks = { default: "bg-card text-card-foreground", destructive: "bg-card text-destructive" }

/**
 * The web's alert: a bordered card; an icon given first sits in its own column
 * beside the title and the description, as the web's grid puts it.
 */
export function Alert({ variant = "default", className = "", children, ...props }: BoxProps & { variant?: keyof typeof looks }) {
  const colors = useColors()
  const parts = Children.toArray(children)
  const icon = parts[0] && isValidElement(parts[0]) && ![AlertTitle, AlertDescription, AlertAction].includes(parts[0].type as never) ? parts[0] : null
  const rest = icon ? parts.slice(1) : parts
  return (
    <Variant.Provider value={variant}>
    <Div role="alert" {...props} className={`relative flex flex-row w-full gap-2.5 rounded-2xl border px-4 py-3 text-sm ${looks[variant]} ${className}`}>
      {icon ? <IconContext.Provider value={{ size: 16, color: variant === "destructive" ? colors.destructive : colors.cardForeground }}><Div className="pt-0.5">{icon}</Div></IconContext.Provider> : null}
      <Div className="flex flex-col flex-1 gap-0.5">{rest as ReactNode}</Div>
    </Div>
    </Variant.Provider>
  )
}

export const AlertTitle = ({ className = "", ...props }: BoxProps) => <Div {...props} className={`font-medium ${className}`} />
export function AlertDescription({ className = "", ...props }: BoxProps) {
  const destructive = useContext(Variant) === "destructive"
  return <Div {...props} className={`text-sm ${destructive ? "text-destructive/90" : "text-muted-foreground"} ${className}`} />
}
export const AlertAction = ({ className = "", ...props }: BoxProps) => <Div {...props} className={`absolute top-2.5 right-3 ${className}`} />
