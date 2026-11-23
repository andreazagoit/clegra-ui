import { ShortcutKeys } from "../clegra/pill"
import type { ShortcutKeysValue } from "./types"

/** A shortcut in a tooltip or a list: one chord as one key («⌥1»), a sequence as its keys side by side («G» «H»). */
export function Keys({ keys, className }: { keys: ShortcutKeysValue; className?: string }) {
  if (typeof keys === "string") return <ShortcutKeys keys={keys} className={className} />
  return (
    <span data-keys-sequence="" className="inline-flex items-center gap-1">
      {keys.map((key, i) => (
        <ShortcutKeys key={`${key}-${i}`} keys={key} className={className} />
      ))}
    </span>
  )
}
