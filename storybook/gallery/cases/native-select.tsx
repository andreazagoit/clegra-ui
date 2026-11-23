import * as nativeSelect from "@clegra/ui/components/native-select"
import * as nativeSelectDrawn from "@clegra/ui/drawn/components/native-select"

import { defineCase } from "../case"

export default defineCase("native-select", [nativeSelect], [nativeSelectDrawn], ({ NativeSelect, NativeSelectOption }) => (
  <NativeSelect aria-label="Priority" defaultValue="medium">
    <NativeSelectOption value="high">High</NativeSelectOption>
    <NativeSelectOption value="medium">Medium</NativeSelectOption>
    <NativeSelectOption value="low">Low</NativeSelectOption>
  </NativeSelect>
))
