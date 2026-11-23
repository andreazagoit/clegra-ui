import { createContext, useContext, useMemo, useRef, type ReactNode } from "react"

type Fields = { register: (name: string, read: () => string | string[]) => () => void; values: () => [string, string][] }

/** The fields inside a <Form>, read at submit as the browser reads a form. */
export const FormContext = createContext<Fields | null>(null)

export function useFormFields(children: ReactNode) {
  const fields = useRef(new Map<string, () => string | string[]>()).current
  const value = useMemo<Fields>(
    () => ({
      register: (name, read) => {
        fields.set(name, read)
        return () => void fields.delete(name)
      },
      values: () => [...fields].flatMap(([name, read]) => [read()].flat().map((v) => [name, v] as [string, string])),
    }),
    [fields],
  )
  void children
  return value
}

/** What a <Button type="submit"> inside a <Form> calls; its own name and value join the fields, as a browser does. */
export const SubmitContext = createContext<((submitter?: [string, string]) => void) | null>(null)
export const useFormSubmit = () => useContext(SubmitContext)
