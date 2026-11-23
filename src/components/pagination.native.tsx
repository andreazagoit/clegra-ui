import * as L from "lucide-react-native"
import type { ComponentType, ReactNode } from "react"
import { Linking } from "react-native"

import { ChevronRightIcon, MoreHorizontalIcon, wrapIcon, type IconProps } from "../native/icons"
import { Div, Span, type BoxProps } from "../primitives.native"
import { Button, type ButtonSize } from "./button.native"

const ChevronLeftIcon = wrapIcon("ChevronLeftIcon", L.ChevronLeftIcon as unknown as ComponentType<IconProps>)

export function Pagination({ className = "", ...props }: BoxProps) {
  return <Div role="navigation" aria-label="pagination" {...props} className={`flex flex-row w-full justify-center ${className}`} />
}

export function PaginationContent({ className = "", ...props }: BoxProps) {
  return <Div {...props} className={`flex flex-row items-center gap-1 ${className}`} />
}

export function PaginationItem(props: BoxProps) {
  return <Div {...props} />
}

export type PaginationLinkProps = { isActive?: boolean; size?: ButtonSize; href?: string; className?: string; children?: ReactNode; "aria-label"?: string; onClick?: (event: { preventDefault: () => void }) => void }

/** A page's button: outline when it is the current page, ghost otherwise. `href` opens with Linking unless onClick prevents it. */
export function PaginationLink({ className = "", isActive, size = "icon", href, onClick, children, "aria-label": label }: PaginationLinkProps) {
  const press = () => {
    let prevented = false
    onClick?.({ preventDefault: () => void (prevented = true) })
    if (!prevented && href && !href.startsWith("#")) void Linking.openURL(href)
  }
  return (
    <Button variant={isActive ? "outline" : "ghost"} size={size} className={className} aria-label={label} aria-current={isActive ? "page" : undefined} onClick={press}>
      {children}
    </Button>
  )
}

export function PaginationPrevious({ className = "", text = "Previous", ...props }: PaginationLinkProps & { text?: string }) {
  return (
    <PaginationLink aria-label="Go to previous page" size="default" className={`pl-2 ${className}`} {...props}>
      <ChevronLeftIcon />
      <Span className="hidden sm:block font-medium">{text}</Span>
    </PaginationLink>
  )
}

export function PaginationNext({ className = "", text = "Next", ...props }: PaginationLinkProps & { text?: string }) {
  return (
    <PaginationLink aria-label="Go to next page" size="default" className={`pr-2 ${className}`} {...props}>
      <Span className="hidden sm:block font-medium">{text}</Span>
      <ChevronRightIcon />
    </PaginationLink>
  )
}

export function PaginationEllipsis({ className = "", ...props }: BoxProps) {
  return (
    <Div aria-hidden {...props} className={`flex flex-row size-9 items-center justify-center ${className}`}>
      <MoreHorizontalIcon size={16} />
    </Div>
  )
}
