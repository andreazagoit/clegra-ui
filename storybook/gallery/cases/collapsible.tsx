import * as collapsible from "@clegra/ui/components/collapsible"
import * as button from "@clegra/ui/components/button"
import * as collapsibleDrawn from "@clegra/ui/drawn/components/collapsible"
import * as buttonDrawn from "@clegra/ui/drawn/components/button"

import { defineCase } from "../case"

export default defineCase("collapsible", [collapsible, button], [collapsibleDrawn, buttonDrawn], (kit) => (
  <kit.Collapsible>
    <kit.CollapsibleTrigger render={<kit.Button variant="outline" size="sm" />}>Show details</kit.CollapsibleTrigger>
    <kit.CollapsibleContent>
      <kit.Span className="text-sm text-muted-foreground">Created on 2 November.</kit.Span>
    </kit.CollapsibleContent>
  </kit.Collapsible>
))
