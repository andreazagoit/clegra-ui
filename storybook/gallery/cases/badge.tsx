import * as badge from "@clegra/ui/components/badge"
import * as badgeDrawn from "@clegra/ui/drawn/components/badge"

import { defineCase } from "../case"

export default defineCase("badge", [badge], [badgeDrawn], ({ Badge, Div }) => (
  <Div className="flex flex-row flex-wrap items-center gap-2">
    <Badge>New</Badge>
    <Badge variant="secondary">Draft</Badge>
    <Badge variant="destructive">Expired</Badge>
    <Badge variant="outline">Internal</Badge>
  </Div>
))
