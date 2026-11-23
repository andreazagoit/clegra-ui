import * as input from "@clegra/ui/components/input"
import * as inputDrawn from "@clegra/ui/drawn/components/input"

import { defineCase } from "../case"

export default defineCase("input", [input], [inputDrawn], ({ Input, Div }) => (
  <Div className="flex flex-col gap-2 max-w-sm">
    <Input placeholder="Company name" aria-label="Company name" />
    <Input defaultValue="Read only" readOnly aria-label="Read only" />
  </Div>
))
