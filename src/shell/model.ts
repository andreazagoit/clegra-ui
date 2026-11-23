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
