import type { ComponentType, ReactNode } from "react"

/** An icon: a lucide icon or any component that takes a class. */
export type ShellIcon = ComponentType<{ className?: string }>

/** Extra `data-*` attributes an app puts on an item (its test hooks, its own marks). */
export type DataAttributes = { [key: `data-${string}`]: string | undefined }

/** A slot that may differ between the rail (narrow, icons) and the phone's drawer (rows with words). */
export type RailSlot = ReactNode | ((look: { rail: boolean }) => ReactNode)

/**
 * A shortcut as the platform writes it: one chord («⌥1», «⌘J»), or a sequence
 * of keys pressed one after the other (`["G", "H"]`), each drawn as its own key.
 */
export type ShortcutKeysValue = string | readonly string[]

/** One entry of the rail: an app, a surface (Home, the store, Amministrazione), an area of an account. */
export type RailItem = {
  id: string
  label: string
  href: string
  /** Drawn as a quiet tile (`RailTile`) unless `tile` draws the app's own icon. */
  icon: ShellIcon
  /** The app's own icon (an image, a coloured tile), at the rail's size or a row's (the drawer). */
  tile?: (look: { active: boolean; size: "rail" | "row" }) => ReactNode
  active?: boolean
  /** One counter, a badge on the tile's corner. */
  badge?: number
  /** Said after the name (`aria-description`): «3 nuovi», «Non raggiungibile». */
  description?: string
  /** The keys that open it, shown in its tooltip. */
  shortcut?: ShortcutKeysValue | null
  /** Opens elsewhere (another site, the web app): a new tab, an ↗ in the drawer. */
  external?: boolean
  /** `data-app-kind`, `data-app-state`. */
  kind?: string
  state?: string
  testId?: string
  data?: DataAttributes
}

/** How a rail group's items are dragged into a new order: `railReorder` from `@clegra/ui/shell/reorder` (on @dnd-kit). */
export type RailReorder = {
  Group: ComponentType<{ ids: string[]; onOrder: (ids: string[]) => void; hint?: string; children: ReactNode }>
  Item: ComponentType<{ id: string; className?: string; children: ReactNode }>
}

/** A group of the rail: a thin line before it (none before the first), its label said (shown in the drawer only). */
export type RailGroup = {
  id: string
  label?: string
  items: RailItem[]
  /** Set: its items can be dragged into the person's order (the rail only, never the phone's drawer); needs `ShellRail`'s `reorder`. */
  onOrder?: (ids: string[]) => void
  /** Said to screen readers when an item is picked up. */
  reorderHint?: string
  data?: DataAttributes
}

/** One entry of a nav (an app's inner bar, an account's sections). */
export type NavItem = {
  id: string
  label: string
  href: string
  icon: ShellIcon
  active?: boolean
  /** A count after the label. */
  badge?: number
  /** Said after the name: «3 nuovi». */
  description?: string
  /** The keys that go there, in the item's tooltip (an item with keys or a `tooltip` has one). */
  shortcut?: ShortcutKeysValue | null
  tooltip?: string
  /** Opens elsewhere: a new tab, with ↗. */
  external?: boolean
  testId?: string
  data?: DataAttributes
}

/** A group of a nav: the first usually untitled, the others under their label. */
export type NavSection = { id: string; label?: string; items: NavItem[] }

/** One row of the account's menu (when the face opens a menu instead of a page). */
export type UserMenuEntry =
  | {
      kind: "item"
      id: string
      label: string
      icon?: ShellIcon
      /** A page (through the app's link) or, with `external`, another site. */
      href?: string
      external?: boolean
      onSelect?: () => void
      destructive?: boolean
      testId?: string
    }
  | {
      /** One choice among a few (the language): a label, then the options as radio rows. */
      kind: "choice"
      id: string
      label: string
      value: string
      options: { value: string; label: string; lang?: string }[]
      onChange: (value: string) => void
      disabled?: boolean
    }
  | { kind: "separator"; id: string }

/**
 * The signed-in person, drawn by the shell at the foot of the rail (a tile
 * like the apps') and in the phone's drawer (face, name and email). With
 * `href` or `onSelect` and no `menu`, one click goes there (the client's
 * /account); with `menu`, the same face opens the menu.
 */
export type ShellUser = {
  name: string
  email: string
  image?: string | null
  /** The face's accessible name («Anna Rossi, anna@prova.test, account aziendale»). Default: name and email. */
  label?: string
  /** The rail's tooltip. Default: the name, else the email. */
  tooltip?: string
  href?: string
  onSelect?: () => void
  /** The person's own page is open: the bar at the rail's edge, the strong fill. */
  active?: boolean
  menu?: UserMenuEntry[]
  /** Default «account-button». */
  testId?: string
}
