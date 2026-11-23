import * as button_group from "@clegra/ui/components/button-group"
import * as button from "@clegra/ui/components/button"
import * as button_groupDrawn from "@clegra/ui/drawn/components/button-group"
import * as buttonDrawn from "@clegra/ui/drawn/components/button"

import { defineCase } from "../case"

export default defineCase("button-group", [button_group, button], [button_groupDrawn, buttonDrawn], ({ ButtonGroup, ButtonGroupSeparator, ButtonGroupText, Button }) => (
  <ButtonGroup>
    <ButtonGroupText>View</ButtonGroupText>
    <Button variant="outline">List</Button>
    <ButtonGroupSeparator />
    <Button variant="outline">Grid</Button>
  </ButtonGroup>
))
