import * as button from "@clegra/ui/components/button"
import * as buttonDrawn from "@clegra/ui/drawn/components/button"

import { defineCase } from "../case"

export default defineCase("sonner", [button], [buttonDrawn], ({ Button, toast }) => <Button variant="outline" onClick={() => toast.success("Saved", { description: "The customer is now in the ERP." })}>Show a toast</Button>)
