/**
 * @clegra/ui/shell — THE ONE SHELL of Clegra's web apps (owner, 2026-11-16:
 * «one sidebar/shell component in the design system, the same structure
 * everywhere, configured by props, not rebuilt per app»; public since
 * 2026-11-17: «every app uses the same library»). Clegra's client, its account
 * site and any third-party web app draw their frame with it; the design system
 * §5 and the app shell design describe the look, docs/guide.md the API.
 * Web only. Presentational only: no router (the app's link component comes in
 * as `link`), no data, no i18n (every word is a prop), no persistence (an app
 * keeps its own choices: the client's folded bars and rail order live on the
 * person's server).
 *
 * ```tsx
 * <AppShell
 *   link={Link}                                   // next/link or the app's own
 *   embedded={embedded}                           // inside Clegra: only the page, no chrome
 *   rail={
 *     <ShellRail
 *       brand={({ rail }) => …}                   // whose it is: the mark (rail, a block of its own) or the lockup (drawer)
 *       drawerSearch={…}                          // optional: a search field atop the phone's drawer only
 *       groups={[{ id, label?, items: RailItem[], onOrder?, reorderHint?, join? }, …]}  // a glass block per group (join: in the one before, "flush" or after a "line")
 *       reorder={railReorder}                     // only with a group's onOrder: @clegra/ui/shell/reorder (@dnd-kit)
 *       controls={({ rail }) => …}                // optional: the app's own tiles atop the account block (bells)
 *       footer={[administration]}                 // the account block, detached at the bottom, above the face
 *       user={{ name, email, image?, label?, tooltip?, href? | onSelect?, active?, menu?: UserMenuEntry[] }}
 *     />
 *   }
 *   nav={<NavBar id name label band? footer?><NavSections label sections={NavSection[]} /></NavBar>}  // docked 240
 *   list={…}                                      // a sidebar page's docked list
 *   chrome={…}                                    // key listeners and other parts with no place
 *   header={<ShellHeader phone={phone}><HeaderGroup …>…</HeaderGroup></ShellHeader>}
 *   bottomBar={…}                                 // the phone's search / primary
 *   aside={…}                                     // the Clegra panel, the FAB, a browser column
 * >
 *   <ShellMain label="Profilo"><ShellPage title="Profilo" description=…>{cards}</ShellPage></ShellMain>
 * </AppShell>
 * ```
 *
 * - `ShellPage` / `PageHeading`: the page's column (`contained` 960, or `full`)
 *   and its heading (26/700, a status, a line of context, the page's own
 *   controls), content that scrolls away: never a title band.
 *
 * - `RailItem` = `{ id, label, href, icon, tile?, active?, badge?, description?,
 *   shortcut?, external?, kind?, state?, testId?, data? }`: a tile (the app's
 *   own drawing through `tile`, else a quiet `RailTile` of `icon`), its name in
 *   a tooltip with its keys, a badge on its corner, the open one marked by the
 *   bar at the rail's edge; in the phone's drawer the tile beside the name.
 * - `NavItem` = `{ id, label, href, icon, active?, badge?, description?,
 *   shortcut?, tooltip?, external?, testId?, data? }`, `NavSection` =
 *   `{ id, label?, items }`: an inner bar's entries (34 high, radius 10); with
 *   keys (or a tooltip) an entry has a tooltip showing them.
 * - Shortcuts are what the platform writes («⌥1», «⌘J») or a sequence
 *   (`["G", "H"]`): `ShortcutKeysValue`. The app listens for them; the shell
 *   shows them (tooltips, `ShortcutsDialog`).
 * - `user`: the face at the foot of the rail, a tile like the apps'. `href`/
 *   `onSelect` and no `menu`: one click goes there (the client's /account);
 *   with `menu` (`item` rows with `href`/`onSelect`, a `choice` such as the
 *   language, `separator`s) the same face opens it, headed by name and email.
 * - Phone (under 768): the panels go; the rail is the drawer (`DrawerPill`, ☰,
 *   opens it), the nav a sheet the app opens (`SectionsPill` is the header's
 *   way to the sections). `useShell()` says `phone` and opens the drawer.
 * - Test hooks kept from the client: `data-sidebar-panels`, `data-sidebar-panel`,
 *   `data-window-buttons`, `data-page-area`, `data-shell-main`, `data-header-bar`,
 *   `data-app` / `data-app-kind` / `data-app-state` on rail items,
 *   `data-app-bar` / `data-app-bar-entry` on the nav, `data-app-pill`,
 *   `account-button`, `header-apps`, `shortcuts-list`.
 *
 * - Embedded (`embedded`): inside Clegra the page is shown without any chrome
 *   (apps don't draw Clegra's chrome); `useShell()` says `embedded`. Decide it
 *   on the server (a layout of the app's embed route passes it).
 * - The header's parts (`HeaderGroup`, `HeaderPill`, `PillItem`, `PillDivider`,
 *   `Hint`, `ShortcutKeys`) and the surfaces (`FloatingPanel`, `ScrollEdge`,
 *   `Segmented`) are re-exported here from `@clegra/ui/clegra/pill` and
 *   `@clegra/ui/clegra/surface`.
 *
 * - `SiteShell`: an app's own website (shown in a card inside Clegra and on
 *   its own in a tab): the inner bar as a left sidebar flush to the page's
 *   edges (`NavBar` + `NavSections`: the app's tile and name, `sections`, the
 *   `footer` items and `footerExtra` at the bottom), the page beside it; under
 *   768 a slim top bar whose ☰ opens it as a drawer. Test hooks
 *   `data-site-shell`, `data-site-sidebar`, `data-site-menu`, `data-site-drawer`.
 *   Needs only `styles.css`.
 *
 * Needs `@clegra/ui/glass.css` after `@clegra/ui/styles.css` (the panels'
 * thick glass, the header's pills). No brand: an app draws its own mark in
 * `brand`.
 */
export { AppShell, DrawerPill, ShellHeader, ShellMain, useShell } from "./frame"
export { ShellRail, RailTile, RailActiveBar, RAIL_LINK } from "./rail"
export { NavBar, NavLink, NavSections, SectionsPill } from "./nav"
export { UserButton } from "./user"
export { Face } from "./face"
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
export type { DataAttributes, NavItem, NavSection, RailGroup, RailItem, RailReorder, RailSlot, ShellIcon, ShellUser, ShortcutKeysValue, UserMenuEntry } from "./types"
