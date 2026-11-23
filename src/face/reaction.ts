import { useEffect, useRef, useState } from "react"

import { FACE_MOTION, type FaceState } from "./motion"

/** How long «happy» plays (its longest track): then it settles into its `then`. */
export const HAPPY_MS = Math.max(...Object.values(FACE_MOTION.happy.tracks).map((t) => (t?.delay ?? 0) + (t?.duration ?? 0)))

/**
 * The face's state from what Clegra is doing, for the places that show it at
 * work (the chat's avatar, the panel's header, the floating button, a call):
 * `listening` wins, then `busy` (thinking); when a busy turn ends, «happy»
 * once, then `idle`. Web and React Native alike.
 */
export function useClegraFaceState({ busy = false, listening = false }: { busy?: boolean; listening?: boolean }): FaceState {
  const [happy, setHappy] = useState(false)
  const was = useRef(busy)
  useEffect(() => {
    const ended = was.current && !busy
    was.current = busy
    if (!ended) {
      if (busy) setHappy(false)
      return
    }
    setHappy(true)
    const t = setTimeout(() => setHappy(false), HAPPY_MS)
    return () => clearTimeout(t)
  }, [busy])
  if (listening) return "listening"
  if (busy) return "thinking"
  return happy ? "happy" : "idle"
}
