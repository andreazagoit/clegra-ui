"use client"

import { Form as FormPrimitive } from "@base-ui/react/form"
import { cn } from "cn"

/**
 * shadcn's base styles ship no `form` (its registry item is empty: forms are
 * built from Field). This is Base UI's Form, in shadcn's way: a <form> with
 * `onFormSubmit`, `errors` and `validationMode`, marked data-slot="form".
 */
function Form({ className, ...props }: FormPrimitive.Props) {
  return <FormPrimitive data-slot="form" className={cn(className)} {...props} />
}

export { Form }
