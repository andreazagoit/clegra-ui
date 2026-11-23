import * as tooltip from "@clegra/ui/components/tooltip"
import * as button from "@clegra/ui/components/button"
import * as tooltipDrawn from "@clegra/ui/drawn/components/tooltip"
import * as buttonDrawn from "@clegra/ui/drawn/components/button"

import { defineCase } from "../case"

export default defineCase("tooltip", [tooltip, button], [tooltipDrawn, buttonDrawn], ({ TooltipProvider, Tooltip, TooltipTrigger, TooltipContent, Button }) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger render={<Button variant="outline" />}>Hover me</TooltipTrigger>
      <TooltipContent>A hint</TooltipContent>
    </Tooltip>
  </TooltipProvider>
))
