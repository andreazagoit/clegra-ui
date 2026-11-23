import * as checkbox from "@clegra/ui/components/checkbox"
import * as label from "@clegra/ui/components/label"
import * as checkboxDrawn from "@clegra/ui/drawn/components/checkbox"
import * as labelDrawn from "@clegra/ui/drawn/components/label"

import { defineCase } from "../case"

export default defineCase("checkbox", [checkbox, label], [checkboxDrawn, labelDrawn], ({ Checkbox, Label, Div }) => (
  <Div className="flex flex-row items-center gap-2">
    <Checkbox aria-label="Invoiced" defaultChecked />
    <Label>Invoiced</Label>
    <Checkbox aria-label="Shipped" />
    <Label>Shipped</Label>
  </Div>
))
