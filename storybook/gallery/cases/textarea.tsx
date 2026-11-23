import * as textarea from "@clegra/ui/components/textarea"
import * as textareaDrawn from "@clegra/ui/drawn/components/textarea"

import { defineCase } from "../case"

export default defineCase("textarea", [textarea], [textareaDrawn], ({ Textarea, Div }) => (
  <Div className="max-w-sm">
    <Textarea placeholder="Notes" aria-label="Notes" />
  </Div>
))
