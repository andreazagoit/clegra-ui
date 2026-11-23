import * as spinner from "@clegra/ui/components/spinner"
import * as spinnerDrawn from "@clegra/ui/drawn/components/spinner"

import { defineCase } from "../case"

export default defineCase("spinner", [spinner], [spinnerDrawn], ({ Spinner }) => <Spinner />)
