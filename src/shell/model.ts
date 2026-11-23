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
 * Every group starts a block of its own, except one with `join` that goes on
 * in the block of the group shown before it, whichever that is (an empty
 * group in between does not part them): «flush» right under it, «line» after
 * a thin line inside the pill. A group that is the first of its block has no
 * line. The groups' labels are said to screen readers instead, and shown only
 * in the phone's drawer.
 */
export function railBlocks<G extends { items: readonly unknown[]; join?: "flush" | "line" }>(groups: readonly G[]): { group: G; line: boolean }[][] {
  const blocks: { group: G; line: boolean }[][] = []
  for (const group of groups) {
    if (group.items.length === 0) continue
    const last = blocks[blocks.length - 1]
    if (group.join && last) last.push({ group, line: group.join === "line" })
    else blocks.push([{ group, line: false }])
  }
  return blocks
}
