import * as dialog from "@clegra/ui/components/dialog"
import * as button from "@clegra/ui/components/button"
import * as dialogDrawn from "@clegra/ui/drawn/components/dialog"
import * as buttonDrawn from "@clegra/ui/drawn/components/button"

import { defineCase } from "../case"

export default defineCase("dialog", [dialog, button], [dialogDrawn, buttonDrawn], ({ Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose, Button }) => (
  <Dialog>
    <DialogTrigger render={<Button variant="outline" />}>Open dialog</DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>New customer</DialogTitle>
        <DialogDescription>The details are saved to the ERP.</DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
      </DialogFooter>
    </DialogContent>
  </Dialog>
))
