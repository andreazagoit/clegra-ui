import * as input_group from "@clegra/ui/components/input-group"
import * as input_groupDrawn from "@clegra/ui/drawn/components/input-group"

import { defineCase } from "../case"

export default defineCase("input-group", [input_group], [input_groupDrawn], ({ InputGroup, InputGroupAddon, InputGroupInput, InputGroupText, Div, icons }) => (
  <Div className="max-w-sm">
    <InputGroup>
      <InputGroupAddon>
        <icons.Search />
      </InputGroupAddon>
      <InputGroupInput placeholder="Search" aria-label="Search" />
      <InputGroupAddon align="inline-end">
        <InputGroupText>⌘K</InputGroupText>
      </InputGroupAddon>
    </InputGroup>
  </Div>
))
