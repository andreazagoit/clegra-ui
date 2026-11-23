import * as switch_ from "@clegra/ui/components/switch"
import * as label from "@clegra/ui/components/label"
import * as switch_Drawn from "@clegra/ui/drawn/components/switch"
import * as labelDrawn from "@clegra/ui/drawn/components/label"

import { defineCase } from "../case"

export default defineCase("switch", [switch_, label], [switch_Drawn, labelDrawn], ({ Switch, Label, Div }) => (
  <Div className="flex flex-row items-center gap-3">
    <Switch aria-label="Notifications" defaultChecked />
    <Label>Notifications</Label>
    <Switch aria-label="Small" size="sm" />
  </Div>
))
