import * as alertDialog from "@clegra/ui/components/alert-dialog"
import * as button from "@clegra/ui/components/button"
import * as alertDialogDrawn from "@clegra/ui/drawn/components/alert-dialog"
import * as buttonDrawn from "@clegra/ui/drawn/components/button"

import { defineCase } from "../case"

export default defineCase("alert-dialog", [alertDialog, button], [alertDialogDrawn, buttonDrawn], ({ AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction, Button }) => (
  <AlertDialog>
    <AlertDialogTrigger render={<Button variant="outline" />}>Delete customer</AlertDialogTrigger>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Delete this customer?</AlertDialogTitle>
        <AlertDialogDescription>This can't be undone.</AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancel</AlertDialogCancel>
        <AlertDialogAction variant="destructive">Delete</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
))
