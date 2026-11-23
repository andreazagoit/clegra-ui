import * as item from "@clegra/ui/components/item"
import * as button from "@clegra/ui/components/button"
import * as itemDrawn from "@clegra/ui/drawn/components/item"
import * as buttonDrawn from "@clegra/ui/drawn/components/button"

import { defineCase } from "../case"

export default defineCase("item", [item, button], [itemDrawn, buttonDrawn], ({ ItemGroup, Item, ItemMedia, ItemContent, ItemTitle, ItemDescription, ItemActions, Button, icons }) => (
  <ItemGroup>
    <Item variant="outline">
      <ItemMedia variant="icon">
        <icons.Inbox />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>Job request</ItemTitle>
        <ItemDescription>Came in by email.</ItemDescription>
      </ItemContent>
      <ItemActions>
        <Button size="sm" variant="outline">
          Open
        </Button>
      </ItemActions>
    </Item>
    <Item variant="muted" size="sm">
      <ItemMedia variant="icon">
        <icons.FileText />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>Quote 2026-114</ItemTitle>
      </ItemContent>
    </Item>
  </ItemGroup>
))
