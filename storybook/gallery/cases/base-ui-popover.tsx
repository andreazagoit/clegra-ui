import * as popover from "@clegra/ui/base-ui/popover"
import * as button from "@clegra/ui/components/button"
import * as popoverDrawn from "@clegra/ui/drawn/base-ui/popover"
import * as buttonDrawn from "@clegra/ui/drawn/components/button"

import { defineCase } from "../case"

export default defineCase("popover (base-ui)", [popover, button], [popoverDrawn, buttonDrawn], ({ Popover, Button, Span }) => (
  <Popover.Root>
    <Popover.Trigger render={<Button variant="outline" />}>Open popover</Popover.Trigger>
    <Popover.Portal>
      <Popover.Positioner sideOffset={4}>
        <Popover.Popup className="w-64 rounded-xl border bg-popover p-3 text-sm shadow-md">
          <Span className="text-sm">Some content next to the button.</Span>
        </Popover.Popup>
      </Popover.Positioner>
    </Popover.Portal>
  </Popover.Root>
))
