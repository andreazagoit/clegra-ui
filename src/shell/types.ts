import type { ComponentType } from "react"

/** An icon: a lucide icon or any component that takes a class. */
export type ShellIcon = ComponentType<{ className?: string }>

/** Extra `data-*` attributes an app puts on an item (its test hooks, its own marks). */
export type DataAttributes = { [key: `data-${string}`]: string | undefined }

/**
 * A shortcut as the platform writes it: one chord («⌥1», «⌘J»), or a sequence
 * of keys pressed one after the other (`["G", "H"]`), each drawn as its own key.
 */
export type ShortcutKeysValue = string | readonly string[]

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
