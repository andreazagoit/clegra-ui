/** Which direction of a `ConfirmSwitch` asks first. */
export type ConfirmWhen = "on" | "off" | "both"

/** Whether moving the switch to `next` asks for confirmation first (the other direction applies at once). */
export function needsConfirmation(next: boolean, when: ConfirmWhen): boolean {
  return when === "both" || (when === "on") === next
}
