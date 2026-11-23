import * as alert from "@clegra/ui/components/alert"
import * as alertDrawn from "@clegra/ui/drawn/components/alert"

import { defineCase } from "../case"

export default defineCase("alert", [alert], [alertDrawn], ({ Alert, AlertTitle, AlertDescription, Div, icons }) => (
  <Div className="flex flex-col gap-3 max-w-md">
    <Alert>
      <icons.Inbox />
      <AlertTitle>New requests</AlertTitle>
      <AlertDescription>Three emails became jobs.</AlertDescription>
    </Alert>
    <Alert variant="destructive">
      <AlertTitle>ERP unreachable</AlertTitle>
      <AlertDescription>Try again in a few minutes.</AlertDescription>
    </Alert>
  </Div>
))
