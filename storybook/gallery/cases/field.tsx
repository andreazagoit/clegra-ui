import * as field from "@clegra/ui/components/field"
import * as input from "@clegra/ui/components/input"
import * as checkbox from "@clegra/ui/components/checkbox"
import * as fieldDrawn from "@clegra/ui/drawn/components/field"
import * as inputDrawn from "@clegra/ui/drawn/components/input"
import * as checkboxDrawn from "@clegra/ui/drawn/components/checkbox"

import { defineCase } from "../case"

export default defineCase("field", [field, input, checkbox], [fieldDrawn, inputDrawn, checkboxDrawn], ({ FieldSet, FieldLegend, FieldDescription, FieldGroup, Field, FieldLabel, FieldError, FieldSeparator, Input, Checkbox }) => (
  <FieldSet>
    <FieldLegend>Address</FieldLegend>
    <FieldDescription>Where we ship the goods.</FieldDescription>
    <FieldGroup>
      <Field>
        <FieldLabel htmlFor="street">Street</FieldLabel>
        <Input id="street" placeholder="1 Main Street" />
        <FieldDescription>As it appears on your ID.</FieldDescription>
      </Field>
      <Field data-invalid="true">
        <FieldLabel htmlFor="zip">ZIP code</FieldLabel>
        <Input id="zip" aria-invalid defaultValue="301" />
        <FieldError>The ZIP code must have 5 digits.</FieldError>
      </Field>
      <FieldSeparator>or</FieldSeparator>
      <Field orientation="horizontal">
        <Checkbox id="same" aria-label="Same" defaultChecked />
        <FieldLabel htmlFor="same">Same as billing address</FieldLabel>
      </Field>
    </FieldGroup>
  </FieldSet>
))
