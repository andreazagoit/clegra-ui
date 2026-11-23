import * as label from "@clegra/ui/components/label"
import * as labelDrawn from "@clegra/ui/drawn/components/label"

import { defineCase } from "../case"

export default defineCase("label", [label], [labelDrawn], ({ Label }) => <Label>Company name</Label>)
