import * as kbd from "@clegra/ui/components/kbd"
import * as kbdDrawn from "@clegra/ui/drawn/components/kbd"

import { defineCase } from "../case"

export default defineCase("kbd", [kbd], [kbdDrawn], ({ Kbd, KbdGroup }) => (
  <KbdGroup>
    <Kbd>⌘</Kbd>
    <Kbd>K</Kbd>
  </KbdGroup>
))
