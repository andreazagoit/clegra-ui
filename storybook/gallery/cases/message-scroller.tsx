import * as scroller from "@clegra/ui/components/message-scroller"
import * as bubble from "@clegra/ui/components/bubble"
import * as scrollerDrawn from "@clegra/ui/drawn/components/message-scroller"
import * as bubbleDrawn from "@clegra/ui/drawn/components/bubble"

import { defineCase } from "../case"

const turns = [
  ["Hi, are there any open orders for Acme Ltd?", "Yes, three: 2026-210, 2026-211 and 2026-214."],
  ["Which one is due first?", "2026-210, delivery expected on 12 November."],
  ["Is it in production yet?", "Yes, since 28 October, in the paint shop."],
  ["Send me the summary.", "Done: you'll find it in the customer's documents."],
]

export default defineCase("message-scroller", [scroller, bubble], [scrollerDrawn, bubbleDrawn], ({ MessageScrollerProvider, MessageScroller, MessageScrollerViewport, MessageScrollerContent, MessageScrollerItem, MessageScrollerButton, BubbleGroup, Bubble, BubbleContent, Div }) => (
  <Div className="h-64 max-w-md rounded-2xl border">
    <MessageScrollerProvider>
      <MessageScroller>
        <MessageScrollerViewport aria-label="Conversation">
          <MessageScrollerContent className="p-4">
            {turns.map(([question, answer], index) => (
              <MessageScrollerItem key={index} messageId={`turn-${index}`} scrollAnchor>
                <BubbleGroup>
                  <Bubble align="end">
                    <BubbleContent>{question}</BubbleContent>
                  </Bubble>
                  <Bubble variant="secondary">
                    <BubbleContent>{answer}</BubbleContent>
                  </Bubble>
                </BubbleGroup>
              </MessageScrollerItem>
            ))}
          </MessageScrollerContent>
        </MessageScrollerViewport>
        <MessageScrollerButton />
      </MessageScroller>
    </MessageScrollerProvider>
  </Div>
))
