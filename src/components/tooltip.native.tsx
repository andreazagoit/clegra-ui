import type { ReactElement, ReactNode } from "react"

import { rendered } from "../native/slot"

/** No hover on touch: the tooltip isn't shown. */
export const TooltipProvider = ({ children }: { children?: ReactNode; delay?: number }) => <>{children}</>
export const Tooltip = ({ children }: { children?: ReactNode }) => <>{children}</>
export const TooltipTrigger = ({ render, children }: { render?: ReactElement; children?: ReactNode }) => rendered(render, {}, () => <>{children}</>, children)
export const TooltipContent = (_: { children?: ReactNode; side?: string; align?: string; hidden?: boolean }) => null
