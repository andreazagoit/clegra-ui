import { Children, createContext, isValidElement, useContext } from "react"

import { Div, Span, type BoxProps } from "../primitives.native"
import { Button, type ButtonProps } from "./button.native"
import { Input, type InputProps } from "./input.native"
import { Textarea } from "./textarea.native"

type Align = "inline-start" | "inline-end" | "block-start" | "block-end"

/** Which addons sit beside the control: an addon on a side takes the control's padding there down to 6 px, as the web's. */
const Sides = createContext<{ start: boolean; end: boolean }>({ start: false, end: false })

/** A field with things inside (search box, ⌘K): the input's filled look, the control borderless inside it. */
export function InputGroup({ className = "", children, ...props }: BoxProps) {
  const aligns = Children.toArray(children).flatMap((child) => (isValidElement(child) && child.type === InputGroupAddon ? [((child.props as { align?: Align }).align ?? "inline-start") as Align] : []))
  const block = aligns.some((a) => a.startsWith("block"))
  return (
    <Sides.Provider value={{ start: aligns.includes("inline-start"), end: aligns.includes("inline-end") }}>
      <Div {...props} role="group" className={`relative flex ${block ? "flex-col rounded-3xl" : "flex-row h-9 rounded-4xl"} w-full min-w-0 items-center border border-transparent bg-input/50 ${className}`}>
        {children}
      </Div>
    </Sides.Provider>
  )
}

const addonLooks: Record<Align, string> = {
  "inline-start": "pl-3",
  "inline-end": "pr-3",
  "block-start": "w-full justify-start px-3 pt-3",
  "block-end": "w-full justify-start px-3 pb-3",
}

export const InputGroupAddon = ({ className = "", align = "inline-start", ...props }: BoxProps & { align?: Align }) => <Div {...props} className={`flex flex-row h-auto items-center justify-center gap-2 py-2 text-sm font-medium text-muted-foreground ${addonLooks[align]} ${className}`} />
export const InputGroupButton = (props: ButtonProps) => <Button size="xs" variant="ghost" {...props} />
export const InputGroupText = ({ className = "", ...props }: BoxProps) => <Span {...props} className={`flex flex-row items-center gap-2 text-sm text-muted-foreground ${className}`} />

export function InputGroupInput({ className = "", ...props }: InputProps) {
  const sides = useContext(Sides)
  return <Input {...props} className={`flex-1 border-0 ${sides.start ? "pl-1.5" : ""} ${sides.end ? "pr-1.5" : ""} ${className}`} style={{ borderWidth: 0, backgroundColor: "transparent" }} />
}
export const InputGroupTextarea = ({ className = "", ...props }: InputProps) => <Textarea {...props} className={`flex-1 border-0 py-2.5 ${className}`} style={{ borderWidth: 0, backgroundColor: "transparent" }} />
