import * as message from "@clegra/ui/components/message"
import * as bubble from "@clegra/ui/components/bubble"
import * as messageDrawn from "@clegra/ui/drawn/components/message"
import * as bubbleDrawn from "@clegra/ui/drawn/components/bubble"

import { defineCase } from "../case"

export default defineCase("message", [message, bubble], [messageDrawn, bubbleDrawn], ({ MessageGroup, Message, MessageAvatar, MessageContent, MessageHeader, MessageFooter, Bubble, BubbleContent, Span }) => (
  <MessageGroup className="max-w-md">
    <Message>
      <MessageAvatar className="size-8">
        <Span className="text-xs font-medium">EW</Span>
      </MessageAvatar>
      <MessageContent>
        <MessageHeader>Emma</MessageHeader>
        <Bubble variant="secondary">
          <BubbleContent>The customer confirmed the order.</BubbleContent>
        </Bubble>
        <MessageFooter>10:42</MessageFooter>
      </MessageContent>
    </Message>
    <Message align="end">
      <MessageContent>
        <Bubble>
          <BubbleContent>Great, I'll send it to production.</BubbleContent>
        </Bubble>
        <MessageFooter>Read</MessageFooter>
      </MessageContent>
    </Message>
    <Message>
      <MessageContent>
        <MessageHeader>Assistant</MessageHeader>
        <Bubble variant="ghost">
          <BubbleContent>I found three open orders for Acme Ltd.</BubbleContent>
        </Bubble>
      </MessageContent>
    </Message>
  </MessageGroup>
))
