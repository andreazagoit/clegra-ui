import * as toggleGroup from "@clegra/ui/components/toggle-group"
import * as toggleGroupDrawn from "@clegra/ui/drawn/components/toggle-group"

import { defineCase } from "../case"

export default defineCase("toggle-group", [toggleGroup], [toggleGroupDrawn], ({ ToggleGroup, ToggleGroupItem, Div }) => (
  <Div className="flex flex-col gap-3">
    <ToggleGroup variant="outline" spacing={0} defaultValue={["day"]} aria-label="Period">
      <ToggleGroupItem value="day">Day</ToggleGroupItem>
      <ToggleGroupItem value="week">Week</ToggleGroupItem>
      <ToggleGroupItem value="month">Month</ToggleGroupItem>
    </ToggleGroup>
    <ToggleGroup multiple defaultValue={["email"]} aria-label="Channels">
      <ToggleGroupItem value="email">Email</ToggleGroupItem>
      <ToggleGroupItem value="telegram">Telegram</ToggleGroupItem>
    </ToggleGroup>
  </Div>
))
