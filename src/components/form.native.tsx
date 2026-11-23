import { startTransition, type ReactNode } from "react"

import { FormContext, SubmitContext, useFormFields } from "../native/form-context"
import { Div } from "../primitives.native"

export type FormSubmitEvent = { preventDefault: () => void; currentTarget: { reset: () => void }; formData: FormData }

export type FormProps = {
  /** As on the web: called with the event; here it also carries `formData`, the fields read as a browser reads them. */
  onSubmit?: (event: FormSubmitEvent) => void
  /** Base UI's: the fields' values by name. */
  onFormSubmit?: (values: Record<string, string | string[]>, eventDetails: { reason: "none" }) => void
  action?: (data: FormData) => unknown
  /** Base UI's server errors by field name; shown by FieldError with `errors`, not read here. */
  errors?: Record<string, string | string[]>
  validationMode?: "onSubmit" | "onBlur" | "onChange"
  className?: string
  role?: string
  children?: ReactNode
}

/**
 * Base UI's Form, drawn: the fields inside (Input, Textarea, Select,
 * NativeSelect, Checkbox, Switch, RadioGroup, ToggleGroup, InputOTP with a
 * `name`) are read at submit, and a <Button type="submit"> inside submits it.
 */
export function Form({ onSubmit, onFormSubmit, action, className = "", role, children }: FormProps) {
  const fields = useFormFields(children)
  const submit = (submitter?: [string, string]) => {
    const data = new FormData()
    const values: Record<string, string | string[]> = {}
    for (const [name, value] of fields.values()) {
      data.append(name, value)
      const had = values[name]
      values[name] = had === undefined ? value : [had].flat().concat(value)
    }
    if (submitter) data.append(...submitter)
    onSubmit?.({ preventDefault: () => {}, currentTarget: { reset: () => {} }, formData: data })
    onFormSubmit?.(values, { reason: "none" })
    if (action) startTransition(() => void action(data))
  }
  return (
    <FormContext.Provider value={fields}>
      <SubmitContext.Provider value={submit}>
        <Div role={role ?? "form"} className={className}>
          {children}
        </Div>
      </SubmitContext.Provider>
    </FormContext.Provider>
  )
}
