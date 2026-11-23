import * as menubar from "@clegra/ui/components/menubar"
import * as menubarDrawn from "@clegra/ui/drawn/components/menubar"

import { defineCase } from "../case"

export default defineCase("menubar", [menubar], [menubarDrawn], ({ Menubar, MenubarMenu, MenubarTrigger, MenubarContent, MenubarGroup, MenubarItem, MenubarShortcut, MenubarSeparator, MenubarCheckboxItem, MenubarRadioGroup, MenubarRadioItem }) => (
  <Menubar>
    <MenubarMenu>
      <MenubarTrigger>File</MenubarTrigger>
      <MenubarContent>
        <MenubarGroup>
          <MenubarItem>
            New quote <MenubarShortcut>⌘N</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>Open</MenubarItem>
        </MenubarGroup>
        <MenubarSeparator />
        <MenubarGroup>
          <MenubarItem variant="destructive">Delete</MenubarItem>
        </MenubarGroup>
      </MenubarContent>
    </MenubarMenu>
    <MenubarMenu>
      <MenubarTrigger>View</MenubarTrigger>
      <MenubarContent>
        <MenubarGroup>
          <MenubarCheckboxItem defaultChecked>Show grid</MenubarCheckboxItem>
        </MenubarGroup>
        <MenubarSeparator />
        <MenubarRadioGroup defaultValue="comfortable">
          <MenubarRadioItem value="comfortable">Comfortable</MenubarRadioItem>
          <MenubarRadioItem value="compact">Compact</MenubarRadioItem>
        </MenubarRadioGroup>
      </MenubarContent>
    </MenubarMenu>
  </Menubar>
))
