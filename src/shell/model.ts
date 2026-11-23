/**
 * The shell's pure rules (no React): what the rail, the nav and the face show,
 * the same for every app that uses `@clegra/ui/shell`. `model.test.ts` checks them.
 */

/** A count as the badges write it: «3», or «99+» past that. */
export const countLabel = (n: number) => (n > 99 ? "99+" : String(n))

/** «Anna Rossi» → «AR»; «anna@prova.test» → «A»; nothing → «?». */
export const initials = (name: string, email = "") =>
  (name.trim() || email.trim())
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => [...part][0]?.toUpperCase() ?? "")
    .join("") || "?"

/**
 * Is `href` the place at `pathname`? Its sub-pages too, except a root (`/`)
 * that is only itself. Query and hash are ignored.
 */
export function isCurrentPath(pathname: string, href: string) {
  const path = href.split(/[?#]/)[0] || "/"
  if (path === "/") return pathname === "/"
  return pathname === path || pathname.startsWith(`${path}/`)
}

/**
 * The rail's groups as drawn: the empty ones dropped, then gathered into
 * BLOCKS, each its own glass pill (the design system §5; owner, 2026-11-23).
 * Every group starts a block of its own, except one with `joinPrevious` that
 * goes on in the block of the group just before it, when that one is shown
 * (the client's store after the installed apps; with no installed apps it
 * stands alone). The groups' labels are said to screen readers instead, and
 * shown only in the phone's drawer.
 */
export function railBlocks<G extends { items: readonly unknown[]; joinPrevious?: boolean }>(groups: readonly G[]): G[][] {
  const blocks: G[][] = []
  groups.forEach((group, i) => {
    if (group.items.length === 0) return
    const previousShown = i > 0 && groups[i - 1]!.items.length > 0
    if (group.joinPrevious && previousShown && blocks.length > 0) blocks[blocks.length - 1]!.push(group)
    else blocks.push([group])
  })
  return blocks
}
