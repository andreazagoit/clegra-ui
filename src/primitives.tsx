import type { ComponentProps, FormEvent } from "react"

/**
 * HTML's elements, the same names on every platform: here the real elements, so
 * Tailwind's classes apply; in a React Native app (primitives.native.tsx) views
 * that read the same classes. A page written with them runs on both.
 */
export type BoxProps = ComponentProps<"div">

export const Div = (props: ComponentProps<"div">) => <div {...props} />
export const Span = (props: ComponentProps<"span">) => <span {...props} />
export const P = (props: ComponentProps<"p">) => <p {...props} />
export const Label = (props: ComponentProps<"label">) => <label {...props} />
export const Strong = (props: ComponentProps<"strong">) => <strong {...props} />
export const Code = (props: ComponentProps<"code">) => <code {...props} />
export const Kbd = (props: ComponentProps<"kbd">) => <kbd {...props} />
export const H1 = (props: ComponentProps<"h1">) => <h1 {...props} />
export const H2 = (props: ComponentProps<"h2">) => <h2 {...props} />
export const H3 = (props: ComponentProps<"h3">) => <h3 {...props} />
export const Section = (props: ComponentProps<"section">) => <section {...props} />
export const Aside = (props: ComponentProps<"aside">) => <aside {...props} />
export const Nav = (props: ComponentProps<"nav">) => <nav {...props} />
export const Header = (props: ComponentProps<"header">) => <header {...props} />
export const Main = (props: ComponentProps<"main">) => <main {...props} />
export const Ul = (props: ComponentProps<"ul">) => <ul {...props} />
export const Li = (props: ComponentProps<"li">) => <li {...props} />
export const Dl = (props: ComponentProps<"dl">) => <dl {...props} />
export const Dt = (props: ComponentProps<"dt">) => <dt {...props} />
export const Dd = (props: ComponentProps<"dd">) => <dd {...props} />
export const SpanBox = Span
export const RawInput = (props: ComponentProps<"input">) => <input {...props} />
export const HiddenField = ({ name, value }: { name: string; value: string }) => <input type="hidden" name={name} value={value} />
export const Datalist = (props: ComponentProps<"datalist">) => <datalist {...props} />
export const Option = (props: ComponentProps<"option">) => <option {...props} />
export const SelectEl = (props: ComponentProps<"select">) => <select {...props} />
export const TableEl = (props: ComponentProps<"table">) => <table {...props} />
export const Thead = (props: ComponentProps<"thead">) => <thead {...props} />
export const Tbody = (props: ComponentProps<"tbody">) => <tbody {...props} />
export const Tr = (props: ComponentProps<"tr">) => <tr {...props} />
export const Th = (props: ComponentProps<"th">) => <th {...props} />
export const Td = (props: ComponentProps<"td">) => <td {...props} />
export const Btn = (props: ComponentProps<"button">) => <button {...props} />

/** `<input type="checkbox">`. */
export const Checkbox = ({ className = "size-4 accent-primary", ...props }: ComponentProps<"input">) => <input type="checkbox" className={className} {...props} />

/** The real <form>; `formData` added to the submit event, as the native one gives it. */
export function Form({ onSubmit, ...props }: Omit<ComponentProps<"form">, "onSubmit"> & { onSubmit?: (event: FormEvent<HTMLFormElement> & { formData: FormData }) => void }) {
  return <form {...props} onSubmit={onSubmit && ((event) => onSubmit(Object.assign(event, { formData: new FormData(event.currentTarget) })))} />
}

/** Only React Native needs it: a browser submits a form by itself. */
export const useFormSubmit = () => null
