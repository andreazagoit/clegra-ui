import * as drawer from "@clegra/ui/components/drawer"
import * as button from "@clegra/ui/components/button"
import * as drawerDrawn from "@clegra/ui/drawn/components/drawer"
import * as buttonDrawn from "@clegra/ui/drawn/components/button"

import { defineCase } from "../case"

export default defineCase("drawer", [drawer, button], [drawerDrawn, buttonDrawn], ({ Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter, DrawerClose, Button }) => (
  <Drawer showSwipeHandle>
    <DrawerTrigger render={<Button variant="outline" />}>Open drawer</DrawerTrigger>
    <DrawerContent>
      <DrawerHeader>
        <DrawerTitle>Filters</DrawerTitle>
        <DrawerDescription>Choose which orders to show.</DrawerDescription>
      </DrawerHeader>
      <DrawerFooter>
        <Button>Apply</Button>
        <DrawerClose render={<Button variant="outline" />}>Close drawer</DrawerClose>
      </DrawerFooter>
    </DrawerContent>
  </Drawer>
))
