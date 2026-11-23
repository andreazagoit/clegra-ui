import * as button from "@clegra/ui/components/button"
import * as buttonDrawn from "@clegra/ui/drawn/components/button"

import { defineCase } from "../case"

export default defineCase("button", [button], [buttonDrawn], ({ Button, Div, icons }) => (
  <Div className="flex flex-row flex-wrap items-center gap-2">
    <Button>Save</Button>
    <Button variant="secondary">Cancel</Button>
    <Button variant="outline">Export</Button>
    <Button variant="ghost">More</Button>
    <Button variant="destructive">Delete</Button>
    <Button variant="link">Details</Button>
    <Button size="sm">Small</Button>
    <Button size="icon" aria-label="Add">
      <icons.Plus />
    </Button>
    <Button disabled>Disabled</Button>
  </Div>
))
