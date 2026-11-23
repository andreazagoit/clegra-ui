import { DisclosureGroup, RNHostView } from "@expo/ui/swift-ui"
import { disabled as off } from "@expo/ui/swift-ui/modifiers"
import { Children, isValidElement, useContext, useId, type ReactNode } from "react"
import { View } from "react-native"

import { ExpoHost } from "./expo-ui-controls"
import { Div, type BoxProps } from "../primitives.native"
import { AccordionContent, AccordionItem as DrawnItem, AccordionLast, AccordionRoot, AccordionTrigger } from "../components/accordion.native"

/** The trigger's text and the content of an item, when the trigger is plain text; else null. */
function partsOf(children: ReactNode): { label: string; content: ReactNode } | null {
  let label: string | null = null
  let content: ReactNode = null
  for (const child of Children.toArray(children)) {
    if (!isValidElement<{ children?: ReactNode }>(child)) return null
    if (child.type === AccordionTrigger && typeof child.props.children === "string") label = child.props.children
    else if (child.type === AccordionContent) content = child.props.children
    else return null
  }
  return label === null ? null : { label, content }
}

/**
 * iOS: a row with a text trigger is SwiftUI's DisclosureGroup (Expo UI), the
 * system's own disclosure row, inside the drawn bordered list; its content
 * stays React Native (RNHostView). The root keeps the open values, so `multiple`
 * and the controlled `value` work as on the web. Anything richer stays drawn.
 */
export function AccordionItem(props: BoxProps & { value?: unknown; disabled?: boolean }) {
  const root = useContext(AccordionRoot)
  const last = useContext(AccordionLast)
  const own = useId()
  const parts = partsOf(props.children)
  if (!parts) return <DrawnItem {...props} />
  const value = props.value ?? own
  return (
    <Div className={`px-4 py-2 ${last ? "" : "border-b"}`}>
      <ExpoHost matchContents>
        <DisclosureGroup label={parts.label} isExpanded={root.open.includes(value)} onIsExpandedChange={(expanded) => expanded !== root.open.includes(value) && root.toggle(value)} modifiers={[off(Boolean(props.disabled || root.disabled))]}>
          <RNHostView matchContents>
            <View>
              <Div className="pt-2 pb-2 text-sm">{parts.content}</Div>
            </View>
          </RNHostView>
        </DisclosureGroup>
      </ExpoHost>
    </Div>
  )
}

