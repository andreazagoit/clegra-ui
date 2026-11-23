import * as radioGroup from "@clegra/ui/components/radio-group"
import * as field from "@clegra/ui/components/field"
import * as radioGroupDrawn from "@clegra/ui/drawn/components/radio-group"
import * as fieldDrawn from "@clegra/ui/drawn/components/field"

import { defineCase } from "../case"

export default defineCase("radio-group", [radioGroup, field], [radioGroupDrawn, fieldDrawn], ({ RadioGroup, RadioGroupItem, Field, FieldLabel }) => (
  <RadioGroup defaultValue="monthly" aria-label="Billing">
    {[
      ["monthly", "Monthly"],
      ["quarterly", "Quarterly"],
      ["yearly", "Yearly"],
    ].map(([value, label]) => (
      <Field key={value} orientation="horizontal">
        <RadioGroupItem value={value} id={`billing-${value}`} aria-label={label} />
        <FieldLabel htmlFor={`billing-${value}`}>{label}</FieldLabel>
      </Field>
    ))}
  </RadioGroup>
))
