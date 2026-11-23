import * as sheet from "@clegra/ui/components/sheet"
import * as button from "@clegra/ui/components/button"
import * as sheetDrawn from "@clegra/ui/drawn/components/sheet"
import * as buttonDrawn from "@clegra/ui/drawn/components/button"

import { defineCase } from "../case"

export default defineCase("sheet", [sheet, button], [sheetDrawn, buttonDrawn], ({ Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription, Button }) => (
  <Sheet>
    <SheetTrigger render={<Button variant="outline" />}>Open panel</SheetTrigger>
    <SheetContent side="right">
      <SheetHeader>
        <SheetTitle>Filters</SheetTitle>
        <SheetDescription>Narrow down the list.</SheetDescription>
      </SheetHeader>
    </SheetContent>
  </Sheet>
))
