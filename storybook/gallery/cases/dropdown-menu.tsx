import * as dropdown_menu from "@clegra/ui/components/dropdown-menu"
import * as button from "@clegra/ui/components/button"
import * as dropdown_menuDrawn from "@clegra/ui/drawn/components/dropdown-menu"
import * as buttonDrawn from "@clegra/ui/drawn/components/button"

import { defineCase } from "../case"

export default defineCase("dropdown-menu", [dropdown_menu, button], [dropdown_menuDrawn, buttonDrawn], ({ DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel, DropdownMenuGroup, Button }) => (
  <DropdownMenu>
    <DropdownMenuTrigger render={<Button variant="outline" />}>Actions</DropdownMenuTrigger>
    <DropdownMenuContent className="w-48">
      <DropdownMenuGroup>
        <DropdownMenuLabel>Customer</DropdownMenuLabel>
        <DropdownMenuItem>Edit</DropdownMenuItem>
        <DropdownMenuItem>Duplicate</DropdownMenuItem>
      </DropdownMenuGroup>
      <DropdownMenuSeparator />
      <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
))
