import * as hoverCard from "@clegra/ui/components/hover-card"
import * as button from "@clegra/ui/components/button"
import * as hoverCardDrawn from "@clegra/ui/drawn/components/hover-card"
import * as buttonDrawn from "@clegra/ui/drawn/components/button"

import { defineCase } from "../case"

export default defineCase("hover-card", [hoverCard, button], [hoverCardDrawn, buttonDrawn], ({ HoverCard, HoverCardTrigger, HoverCardContent, Button, Div }) => (
  <HoverCard>
    <HoverCardTrigger delay={200} closeDelay={200} render={<Button variant="link" />}>@clegra</HoverCardTrigger>
    <HoverCardContent>
      <Div className="flex flex-col gap-1">
        <Div className="text-sm font-medium">Clegra</Div>
        <Div className="text-sm text-muted-foreground">The assistant for businesses.</Div>
      </Div>
    </HoverCardContent>
  </HoverCard>
))
