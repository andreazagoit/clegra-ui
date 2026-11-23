import * as toggle from "@clegra/ui/components/toggle"
import * as toggleDrawn from "@clegra/ui/drawn/components/toggle"

import { defineCase } from "../case"

export default defineCase("toggle", [toggle], [toggleDrawn], ({ Toggle, Div, icons }) => (
  <Div className="flex flex-row items-center gap-2">
    <Toggle aria-label="Search">
      <icons.Search />
    </Toggle>
    <Toggle variant="outline" aria-label="Open only" defaultPressed>
      Open only
    </Toggle>
    <Toggle size="sm" aria-label="Small">
      Small
    </Toggle>
  </Div>
))
