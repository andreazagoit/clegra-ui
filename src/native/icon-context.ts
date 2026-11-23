import { createContext } from "react"

/** What surrounds an icon: a button's text colour and icon size, as CSS gives them on the web. */
export const IconContext = createContext<{ size?: number; color?: string }>({})
