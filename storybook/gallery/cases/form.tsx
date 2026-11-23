import { useState } from "react"

import * as form from "@clegra/ui/components/form"
import * as field from "@clegra/ui/components/field"
import * as input from "@clegra/ui/components/input"
import * as button from "@clegra/ui/components/button"
import * as formDrawn from "@clegra/ui/drawn/components/form"
import * as fieldDrawn from "@clegra/ui/drawn/components/field"
import * as inputDrawn from "@clegra/ui/drawn/components/input"
import * as buttonDrawn from "@clegra/ui/drawn/components/button"

import { defineCase, type Kit } from "../case"

/** Submits, then shows what the form sent: the web reads its <form>, the drawn side gets `formData`. */
function Demo({ kit: { Form, Field, FieldLabel, Input, Button, Div } }: { kit: Kit }) {
  const [sent, setSent] = useState("nothing")
  return (
    <Form
      className="flex flex-col gap-3"
      onSubmit={(event: { preventDefault: () => void; currentTarget: HTMLFormElement; formData?: FormData }) => {
        event.preventDefault()
        const data = event.formData ?? new FormData(event.currentTarget)
        setSent([...data].map(([k, v]) => `${k}=${String(v)}`).join(" "))
      }}
    >
      <Field>
        <FieldLabel htmlFor="company">Company name</FieldLabel>
        <Input id="company" name="company" placeholder="Acme Ltd" />
      </Field>
      <Div className="flex flex-row items-center gap-3">
        <Button type="submit">Send</Button>
        <Div className="text-sm text-muted-foreground">{`Sent: ${sent}`}</Div>
      </Div>
    </Form>
  )
}

export default defineCase("form", [form, field, input, button], [formDrawn, fieldDrawn, inputDrawn, buttonDrawn], (kit) => <Demo kit={kit} />)
