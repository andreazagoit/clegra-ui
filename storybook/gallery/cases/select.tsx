import * as select from "@clegra/ui/components/select"
import * as selectDrawn from "@clegra/ui/drawn/components/select"

import { defineCase } from "../case"

export default defineCase("select", [select], [selectDrawn], ({ Select, SelectTrigger, SelectValue, SelectContent, SelectItem, Div }) => (
  <Div className="max-w-48">
    <Select defaultValue="open" items={[{ value: "open", label: "Open" }, { value: "closed", label: "Closed" }, { value: "on-hold", label: "On hold" }]}>
      <SelectTrigger className="w-48" aria-label="Status">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="open">Open</SelectItem>
        <SelectItem value="closed">Closed</SelectItem>
        <SelectItem value="on-hold">On hold</SelectItem>
      </SelectContent>
    </Select>
  </Div>
))
