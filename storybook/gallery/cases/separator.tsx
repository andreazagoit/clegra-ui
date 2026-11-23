import * as separator from "@clegra/ui/components/separator"
import * as separatorDrawn from "@clegra/ui/drawn/components/separator"

import { defineCase } from "../case"

export default defineCase("separator", [separator], [separatorDrawn], ({ Separator, Div, Span }) => (
  <Div className="flex flex-col gap-2 max-w-sm">
    <Span className="text-sm">Above</Span>
    <Separator />
    <Div className="flex flex-row h-5 items-center gap-2">
      <Span className="text-sm">A</Span>
      <Separator orientation="vertical" />
      <Span className="text-sm">B</Span>
    </Div>
  </Div>
))
