/**
 * @clegra/ui/shell — the parts of an app's frame that every app shares: an app's own website (`SiteShell`), the inner
 * bar (`NavBar`, `NavSections`, `NavLink`, `SectionsPill`), the page's column and heading (`ShellPage`,
 * `PageHeading`), the apps' icon (`AppIconImage`), the counters, the shortcuts (`Keys`, `ShortcutsDialog`), the
 * header's pills and the surfaces, the link provider. docs/guide.md has the API.
 * Web only. Presentational only: no router (the app's link component comes in as `link`), no data, no i18n (every
 * word is a prop).
 *
 * ```tsx
 * <SiteShell
 *   link={Link}
 *   brand={…} label="Ordini" menuLabel=… closeLabel=…  // the app's tile and name, the words
 *   sections={[{ id, label?, items: NavItem[] }]} // the bar's entries
 *   footer={NavItem[]} footerExtra={…}            // at the bar's foot
 * >
 *   <ShellPage title="Ordini" description=…>{cards}</ShellPage>
 * </SiteShell>
 * ```
 *
 * - `SiteShell`: an app's own website (shown in a card inside Clegra and on its own in a tab): the inner bar as a left
 *   sidebar flush to the page's edges, the page beside it; under 768 a slim top bar whose ☰ opens it as a drawer.
 *   Test hooks `data-site-shell`, `data-site-sidebar`, `data-site-menu`, `data-site-drawer`. Needs only `styles.css`.
 * - `ShellPage` / `PageHeading`: the page's column (`contained` 960, or `full`) and its heading (26/700, a status, a
 *   line of context, the page's own controls), content that scrolls away: never a title band.
 * - `NavItem` = `{ id, label, href, icon, active?, badge?, description?, shortcut?, tooltip?, external?, testId?,
 *   data? }`, `NavSection` = `{ id, label?, items }`: an inner bar's entries (34 high, radius 10); with keys (or a
 *   tooltip) an entry has a tooltip showing them.
 * - Shortcuts are what the platform writes («⌥1», «⌘J») or a sequence (`["G", "H"]`): `ShortcutKeysValue`. The app
 *   listens for them; the shell shows them (tooltips, `ShortcutsDialog`).
 * - The header's parts (`HeaderGroup`, `HeaderPill`, `PillItem`, `PillDivider`, `Hint`, `ShortcutKeys`) and the
 *   surfaces (`FloatingPanel`, `ScrollEdge`, `Segmented`) are re-exported here from `@clegra/ui/clegra/pill` and
 *   `@clegra/ui/clegra/surface` (they need `@clegra/ui/glass.css` after `styles.css`).
 */
export { NavBar, NavLink, NavSections, SectionsPill } from "./nav"
export { PageHeading, ShellPage } from "./page"
export { SiteShell, type SiteBrand } from "./site"
export { APP_ICON_MASK, AppIconImage, type AppIconImageSource } from "./app-icon"
export { CountBadge } from "./badge"
export { Keys } from "./keys"
export { ShortcutsDialog, type ShortcutGroup } from "./shortcuts"
export { HeaderGroup, HeaderPill, Hint, PillDivider, PillItem, ShortcutKeys, type PillItemProps } from "../clegra/pill"
export { FloatingPanel, ScrollEdge, Segmented } from "../clegra/surface"
export { ShellLinkProvider, useShellLink, type ShellLinkComponent } from "./link"
export { countLabel, initials, isCurrentPath } from "./model"
export type { DataAttributes, NavItem, NavSection, ShellIcon, ShortcutKeysValue } from "./types"
