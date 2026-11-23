import type { ReactElement, ReactNode } from "react"

import { IconContext } from "../native/icon-context"
import { ChevronRightIcon, MoreHorizontalIcon } from "../native/icons"
import { rendered } from "../native/slot"
import { useColors } from "../native/theme"
import { Div, Span, type BoxProps } from "../primitives.native"

/** The trail of pages, drawn with the web's classes (breadcrumb.tsx). */
export const Breadcrumb = ({ className = "", ...props }: BoxProps) => <Div aria-label="breadcrumb" {...props} className={className} />

export const BreadcrumbList = ({ className = "", ...props }: BoxProps) => <Div {...props} className={`flex flex-row flex-wrap items-center gap-1.5 text-sm text-muted-foreground sm:gap-2.5 ${className}`} />

export const BreadcrumbItem = ({ className = "", ...props }: BoxProps) => <Div {...props} className={`flex flex-row items-center gap-1.5 ${className}`} />

export function BreadcrumbLink({ className = "", render, children, onClick }: { className?: string; render?: ReactElement; children?: ReactNode; onClick?: () => void }) {
  return rendered(render, { className, onClick }, () => <Span onClick={onClick} role="link" className={className}>{children}</Span>, children)
}

export const BreadcrumbPage = ({ className = "", ...props }: BoxProps) => <Span role="link" aria-disabled aria-current="page" {...props} className={`font-normal text-foreground ${className}`} />

export function BreadcrumbSeparator({ children }: { children?: ReactNode; className?: string }) {
  const colors = useColors()
  return (
    // Inside the Div: a Div hands its own icon context down, which would undo a 14 px given around it.
    <Div role="presentation" aria-hidden className="flex flex-row items-center">
      <IconContext.Provider value={{ size: 14, color: colors.mutedForeground }}>{children ?? <ChevronRightIcon />}</IconContext.Provider>
    </Div>
  )
}

export function BreadcrumbEllipsis({ className = "" }: { className?: string }) {
  return (
    <Div role="presentation" aria-hidden className={`flex size-5 items-center justify-center ${className}`}>
      <MoreHorizontalIcon size={16} />
    </Div>
  )
}
