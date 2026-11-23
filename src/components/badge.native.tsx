import type { ReactNode } from "react"

import { Span } from "../primitives.native"

const looks = {
  default: "bg-primary text-primary-foreground",
  secondary: "bg-secondary text-secondary-foreground",
  destructive: "bg-destructive/10 text-destructive",
  outline: "border border-border text-foreground",
  ghost: "text-foreground",
  link: "text-primary",
}

/** The badge's classes, as the web's badgeVariants gives them (for a Link or another element that looks like a badge). */
export function badgeVariants({ variant = "default", className = "" }: { variant?: keyof typeof looks | null; className?: string } = {}) {
  return `inline-flex h-5 items-center justify-center gap-1 rounded-4xl border border-transparent px-2 py-0.5 text-xs font-medium ${looks[variant ?? "default"]} ${className}`
}

export function Badge({ variant = "default", className = "", children, ...props }: { variant?: keyof typeof looks; className?: string; children?: ReactNode; [key: `data-${string}`]: unknown }) {
  return (
    <Span {...props} className={`inline-flex h-5 items-center justify-center gap-1 rounded-4xl border border-transparent px-2 py-0.5 text-xs font-medium ${looks[variant]} ${className}`}>
      {children}
    </Span>
  )
}
