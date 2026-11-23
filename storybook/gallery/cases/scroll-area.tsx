import * as scroll_area from "@clegra/ui/components/scroll-area"
import * as scroll_areaDrawn from "@clegra/ui/drawn/components/scroll-area"

import { defineCase } from "../case"

export default defineCase("scroll-area", [scroll_area], [scroll_areaDrawn], ({ ScrollArea, Div, Span }) => (
  <ScrollArea className="h-24 max-w-sm rounded-lg border">
    <Div className="flex flex-col gap-1 p-2">
      {Array.from({ length: 12 }, (_, i) => (
        <Span key={i} className="text-sm">
          Row {i + 1}
        </Span>
      ))}
    </Div>
  </ScrollArea>
))
