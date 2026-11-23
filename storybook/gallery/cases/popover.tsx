import * as popover from "@clegra/ui/components/popover"
import * as button from "@clegra/ui/components/button"
import * as popoverDrawn from "@clegra/ui/drawn/components/popover"
import * as buttonDrawn from "@clegra/ui/drawn/components/button"

import { defineCase } from "../case"

export default defineCase("popover", [popover, button], [popoverDrawn, buttonDrawn], ({ Popover, PopoverTrigger, PopoverContent, PopoverHeader, PopoverTitle, PopoverDescription, Button }) => (
  <Popover>
    <PopoverTrigger render={<Button variant="outline" />}>Dimensions</PopoverTrigger>
    <PopoverContent align="start">
      <PopoverHeader>
        <PopoverTitle>Dimensions</PopoverTitle>
        <PopoverDescription>The column width in pixels.</PopoverDescription>
      </PopoverHeader>
    </PopoverContent>
  </Popover>
))
