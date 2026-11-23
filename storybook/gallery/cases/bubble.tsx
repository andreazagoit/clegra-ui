import * as bubble from "@clegra/ui/components/bubble"
import * as bubbleDrawn from "@clegra/ui/drawn/components/bubble"

import { defineCase } from "../case"

export default defineCase("bubble", [bubble], [bubbleDrawn], ({ BubbleGroup, Bubble, BubbleContent, BubbleReactions, Div }) => (
  <Div className="flex max-w-md flex-col gap-6">
    <BubbleGroup>
      <Bubble align="end">
        <BubbleContent>Can you send me the quote for Acme Ltd?</BubbleContent>
      </Bubble>
      <Bubble variant="secondary">
        <BubbleContent>Sure, it's 2026-114: three lines, €1,240.00 in total.</BubbleContent>
        <BubbleReactions>👍 2</BubbleReactions>
      </Bubble>
    </BubbleGroup>
    <BubbleGroup>
      <Bubble variant="muted">
        <BubbleContent>Muted</BubbleContent>
      </Bubble>
      <Bubble variant="tinted">
        <BubbleContent>Tinted</BubbleContent>
      </Bubble>
      <Bubble variant="outline">
        <BubbleContent>Outline</BubbleContent>
      </Bubble>
      <Bubble variant="destructive">
        <BubbleContent>Couldn't send</BubbleContent>
      </Bubble>
      <Bubble variant="ghost">
        <BubbleContent>Ghost: the assistant's text, with no background.</BubbleContent>
      </Bubble>
    </BubbleGroup>
  </Div>
))
