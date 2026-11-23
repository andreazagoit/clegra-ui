"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../components/dialog"
import { Keys } from "./keys"
import type { ShortcutKeysValue } from "./types"

export type ShortcutGroup = { id: string; label?: string; rows: { id: string; label: string; keys: ShortcutKeysValue }[] }

/**
 * The list of shortcuts (the client's ⌘/, the account's ?): every command
 * with keys, by group, each row its name and its keys. Words come in as props.
 */
export function ShortcutsDialog({
  open,
  onOpenChange,
  title,
  description,
  groups,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  groups: ShortcutGroup[]
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-lg" data-testid="shortcuts-list">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <div className="flex flex-col gap-4">
          {groups
            .filter((group) => group.rows.length)
            .map((group) => (
              <section key={group.id} className="flex flex-col gap-1">
                {group.label && <p className="text-[0.6875rem] font-semibold tracking-[0.04em] text-(--faint) uppercase">{group.label}</p>}
                <ul className="flex flex-col">
                  {group.rows.map((row) => (
                    <li key={row.id} className="flex h-8 items-center justify-between gap-3 text-sm">
                      <span className="min-w-0 truncate">{row.label}</span>
                      <Keys keys={row.keys} />
                    </li>
                  ))}
                </ul>
              </section>
            ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
