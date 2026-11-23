"use client"

import { useState, useTransition } from "react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/alert-dialog"
import { Switch } from "../components/switch"

import { needsConfirmation, type ConfirmWhen } from "./confirm-switch-rule"

export { needsConfirmation, type ConfirmWhen } from "./confirm-switch-rule"

/** `data-*` attributes for the switch or the dialog (the apps' test hooks). */
type Data = Record<`data-${string}`, string>

export type ConfirmSwitchDialog = {
  title: string
  description: React.ReactNode
  /** The confirming button's words («Attiva», «Apri le registrazioni»). */
  confirm: string
  cancel: string
  /** A destructive confirmation is red, never Blu (the design system §8, «Sheets and dialogs»). */
  tone?: "default" | "destructive"
}

/**
 * A SETTING'S SWITCH THAT ASKS FIRST (the design system §8): a switch
 * whose consequential direction opens a confirmation dialog, the other
 * applying at once. It shows the saved state only: it moves when the caller
 * passes the new `checked`, and is disabled while `onChange` runs (its
 * promise, or `pending`). Presentational: every word is a prop, the caller
 * saves, says how it went (a toast) and refreshes.
 *
 * ```tsx
 * <ConfirmSwitch checked={on} label="Sito in manutenzione" confirmWhen="on"
 *   dialog={{ title, description, confirm: "Attiva", cancel: "Annulla", tone: "destructive" }}
 *   pendingLabel="Un momento…" onChange={(next) => save(next)} />
 * ```
 */
export function ConfirmSwitch({
  checked,
  label,
  dialog,
  confirmWhen = "on",
  onChange,
  pending: pendingProp = false,
  pendingLabel,
  disabled = false,
  switchData,
  dialogData,
}: {
  checked: boolean
  /** The switch's accessible name (the setting's name). */
  label: string
  dialog: ConfirmSwitchDialog
  /** Which direction asks first: turning it on (default), off, or both. */
  confirmWhen?: ConfirmWhen
  /** Saves the new state; while its promise runs the switch is disabled. */
  onChange: (next: boolean) => void | Promise<void>
  /** Saving elsewhere (the caller's own transition). */
  pending?: boolean
  /** Shown beside the switch while saving. */
  pendingLabel?: string
  disabled?: boolean
  switchData?: Data
  dialogData?: Data
}) {
  const [asking, setAsking] = useState<boolean | null>(null)
  const [saving, startSaving] = useTransition()
  const pending = pendingProp || saving
  const save = (next: boolean) => startSaving(async () => void (await onChange(next)))

  return (
    <div className="flex shrink-0 items-center gap-2">
      {pending && pendingLabel && <span className="text-xs text-muted-foreground">{pendingLabel}</span>}
      <Switch
        checked={checked}
        disabled={disabled || pending}
        aria-label={label}
        onCheckedChange={(next) => (needsConfirmation(next, confirmWhen) ? setAsking(next) : save(next))}
        {...switchData}
      />
      <AlertDialog open={asking !== null} onOpenChange={(open) => !open && setAsking(null)}>
        <AlertDialogContent {...dialogData}>
          <AlertDialogHeader>
            <AlertDialogTitle>{dialog.title}</AlertDialogTitle>
            <AlertDialogDescription>{dialog.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{dialog.cancel}</AlertDialogCancel>
            <AlertDialogAction
              variant={dialog.tone === "destructive" ? "destructive" : "default"}
              onClick={() => {
                const next = asking
                setAsking(null)
                if (next !== null) save(next)
              }}
            >
              {dialog.confirm}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
