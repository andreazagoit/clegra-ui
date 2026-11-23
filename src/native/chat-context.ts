import { createContext } from "react"

/**
 * What a message tells the pieces inside it, as the web's `group/message`
 * selectors do: its side (bubbles and footers follow it), whether it has a
 * footer (the avatar rises above it) and whether its bubble is a ghost one
 * (header and footer lose their inset).
 */
export const MessageContext = createContext<{ align: "start" | "end"; footer: boolean; ghost: boolean } | null>(null)
