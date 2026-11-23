import { Children, isValidElement, useContext, type ReactNode } from "react"

import { MessageContext } from "../native/chat-context"
import { Div, type BoxProps } from "../primitives.native"
import { Bubble } from "./bubble.native"

const childrenOf = (node: ReactNode) => Children.toArray(node).filter(isValidElement) as { type: unknown; props: { children?: ReactNode; variant?: string } }[]

export function MessageGroup({ className = "", ...props }: BoxProps) {
  return <Div data-slot="message-group" {...props} className={`flex min-w-0 flex-col gap-2 ${className}`} />
}

/**
 * One message: avatar and content in a row, reversed for `align="end"`. It
 * looks into its content as the web's `group-has-*` selectors do: a footer
 * lifts the avatar, a ghost bubble takes the header's and footer's inset away.
 */
export function Message({ className = "", align = "start", style, children, ...props }: BoxProps & { align?: "start" | "end" }) {
  const content = childrenOf(children).filter((child) => child.type === MessageContent).flatMap((child) => childrenOf(child.props.children))
  const footer = content.some((child) => child.type === MessageFooter)
  const ghost = content.some((child) => child.type === Bubble && child.props.variant === "ghost")
  return (
    <MessageContext.Provider value={{ align, footer, ghost }}>
      <Div data-slot="message" {...props} className={`relative flex w-full min-w-0 gap-2 text-sm ${className}`} style={[{ flexDirection: align === "end" ? "row-reverse" : "row" }, style]}>
        {children}
      </Div>
    </MessageContext.Provider>
  )
}

export function MessageAvatar({ className = "", style, ...props }: BoxProps) {
  const footer = useContext(MessageContext)?.footer
  return <Div data-slot="message-avatar" {...props} className={`flex min-w-8 shrink-0 items-center justify-center self-end overflow-hidden rounded-full bg-muted ${className}`} style={[footer ? { transform: [{ translateY: -32 }] } : null, style]} />
}

export function MessageContent({ className = "", style, ...props }: BoxProps) {
  const end = useContext(MessageContext)?.align === "end"
  return <Div data-slot="message-content" {...props} className={`flex w-full min-w-0 flex-col gap-2.5 ${className}`} style={[{ flex: 1, alignItems: end ? "flex-end" : "stretch" }, style]} />
}

const edge = (ghost: boolean | undefined) => (ghost ? "px-0" : "px-3.5")

export function MessageHeader({ className = "", ...props }: BoxProps) {
  const message = useContext(MessageContext)
  return <Div data-slot="message-header" {...props} className={`flex flex-row max-w-full min-w-0 items-center ${edge(message?.ghost)} text-xs font-medium text-muted-foreground ${className}`} />
}

export function MessageFooter({ className = "", ...props }: BoxProps) {
  const message = useContext(MessageContext)
  return <Div data-slot="message-footer" {...props} className={`flex flex-row max-w-full min-w-0 items-center ${edge(message?.ghost)} text-xs font-medium text-muted-foreground ${message?.align === "end" ? "justify-end" : ""} ${className}`} />
}
