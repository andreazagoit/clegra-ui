import { Popover as SwiftPopover, RNHostView } from "@expo/ui/swift-ui"
import { Children, isValidElement, useState, type ReactElement, type ReactNode } from "react"
import { View } from "react-native"

import { ExpoHost } from "./expo-ui-controls"
import { useAnchor } from "./overlay"
import { rendered } from "./slot"
import { Div } from "../primitives.native"
import { Popover as Drawn, PopoverContent, PopoverCtx, PopoverTrigger } from "../components/popover.native"

type Props = Parameters<typeof Drawn>[0]
const edges = { top: "bottom", bottom: "top", left: "trailing", right: "leading", "inline-start": "trailing", "inline-end": "leading" } as const
const anchors = { top: "top", bottom: "bottom", left: "leading", right: "trailing", "inline-start": "leading", "inline-end": "trailing" } as const

/**
 * iOS: SwiftUI's popover (Expo UI) holding the drawn content, with the
 * system's arrow and dismissal, when the Popover's children are its trigger
 * and its content. Any other arrangement stays drawn (popover.native.tsx).
 */
export function Popover(props: Props) {
  const { open, defaultOpen, onOpenChange, children } = props
  const [own, setOwn] = useState(Boolean(defaultOpen))
  const anchor = useAnchor()
  const parts = Children.toArray(children).filter(isValidElement) as ReactElement<Record<string, unknown>>[]
  const trigger = parts.find((p) => p.type === PopoverTrigger)
  const content = parts.find((p) => p.type === PopoverContent)
  if (!trigger || !content || parts.length !== 2) return <Drawn {...props} />
  const shown = open ?? own
  const setOpen = (next: boolean) => (setOwn(next), onOpenChange?.(next))
  const side = (content.props.side as keyof typeof edges | undefined) ?? "bottom"
  const { render, children: label, className } = trigger.props as { render?: ReactElement; children?: ReactNode; className?: string }
  return (
    <PopoverCtx.Provider value={{ open: false, setOpen, anchor }}>
      <ExpoHost matchContents>
        <SwiftPopover isPresented={shown} onIsPresentedChange={setOpen} attachmentAnchor={anchors[side]} arrowEdge={edges[side]}>
          <SwiftPopover.Trigger>
            <RNHostView matchContents>
              <View>{rendered(render, { onClick: () => setOpen(!shown) }, () => <Div className={className} onClick={() => setOpen(!shown)}>{label}</Div>, label)}</View>
            </RNHostView>
          </SwiftPopover.Trigger>
          <SwiftPopover.Content>
            <RNHostView matchContents>
              <Div className={`flex flex-col w-72 gap-4 p-4 text-sm text-popover-foreground ${(content.props.className as string | undefined) ?? ""}`}>{content.props.children as ReactNode}</Div>
            </RNHostView>
          </SwiftPopover.Content>
        </SwiftPopover>
      </ExpoHost>
    </PopoverCtx.Provider>
  )
}
