/**
 * HOW THE FACE MOVES: the one spec the web face (face.tsx, CSS keyframes made
 * from it by css.ts) and the iPhone/iPad face (face.native.tsx, React Native's
 * Animated, on the native driver) both play, so the timings are the same
 * everywhere. Only this file says how long, how far and when.
 *
 * The face is layers, each moved on its own (lengths in face units: the face
 * is a 100-unit box; angles in degrees):
 *   head   the whole head: rotate (about its centre, 50 52), y, scale
 *   look   both eyes together, inside the head: x, y, scale (where Clegra looks)
 *   eyes   each eye about its own centre: scaleY (the blink)
 *   pose   the expression's eyes: opacity (they give way to «happy»'s)
 *   happy  the «done» eyes (brand expressions/done.svg): opacity, scale
 *
 * A state holds a pose (`hold`: where the head and the eyes rest, reached with
 * a short ease, never a jump) and plays tracks around it. `reduced`: the
 * tracks still played for whoever asks for less motion (only the blink: it
 * moves nothing across the screen). `then`: a state that plays once settles
 * into that one.
 *
 * Calm by design: the head moves at most a few degrees and a few units, the
 * eyes blink in about a quarter of a second, nothing loops faster than 1.6 s.
 */

export type FaceState = "idle" | "thinking" | "listening" | "happy" | "static"
export const FACE_STATES: FaceState[] = ["idle", "thinking", "listening", "happy", "static"]

export type FaceLayer = "head" | "look" | "eyes" | "pose" | "happy"
export const FACE_LAYERS: FaceLayer[] = ["head", "look", "eyes", "pose", "happy"]

export type FaceProp = "rotate" | "x" | "y" | "scale" | "scaleY" | "opacity"
export type FacePose = Partial<Record<FaceProp, number>>

/** Cubic Béziers (CSS cubic-bezier, React Native's Easing.bezier). */
export const FACE_EASES = {
  /** in and out, soft: the drifts and the sways */
  gentle: [0.45, 0, 0.55, 1],
  /** a quick start that lands softly: a glance, the reaction's jump */
  out: [0.22, 1, 0.36, 1],
  /** the lids closing */
  close: [0.4, 0, 1, 1],
  /** the lids opening */
  open: [0, 0, 0.2, 1],
  linear: [0, 0, 1, 1],
} as const satisfies Record<string, readonly [number, number, number, number]>
export type FaceEase = keyof typeof FACE_EASES

/** A key: the time in ms from the track's start, the values there, and the ease to the next key. */
export type FaceKey = FacePose & { at: number; ease?: FaceEase }
export type FaceTrack = { duration: number; delay?: number; repeat: boolean; keys: FaceKey[] }

export type FaceMotion = {
  hold?: { head?: FacePose; look?: FacePose }
  tracks: Partial<Record<FaceLayer, FaceTrack>>
  reduced: FaceLayer[]
  then?: FaceState
}

/** How long a hold takes to reach (and to leave) its pose. */
export const FACE_HOLD_MS = 420
export const FACE_HOLD_EASE: FaceEase = "out"

/** The props each layer may move (the rest stay at their rest value). */
export const LAYER_PROPS: Record<FaceLayer, FaceProp[]> = {
  head: ["rotate", "y", "scale"],
  look: ["x", "y", "scale"],
  eyes: ["scaleY"],
  pose: ["opacity"],
  happy: ["opacity", "scale"],
}

export const REST: Record<FaceProp, number> = { rotate: 0, x: 0, y: 0, scale: 1, scaleY: 1, opacity: 1 }

/** The lids: 90 ms down, 40 ms shut, 140 ms up. */
const SHUT = 0.08
function blinks(duration: number, at: number[]): FaceTrack {
  const keys: FaceKey[] = [{ at: 0, scaleY: 1 }]
  for (const t of at) keys.push({ at: t, scaleY: 1, ease: "close" }, { at: t + 90, scaleY: SHUT }, { at: t + 130, scaleY: SHUT, ease: "open" }, { at: t + 270, scaleY: 1 })
  keys.push({ at: duration, scaleY: 1 })
  return { duration, repeat: true, keys }
}

export const FACE_MOTION: Record<FaceState, FaceMotion> = {
  /** At rest: a blink every few seconds (now and then a double one), a glance aside, the head following a little. */
  idle: {
    tracks: {
      eyes: blinks(7200, [2600, 6000, 6380]),
      look: {
        duration: 14000,
        repeat: true,
        keys: [
          { at: 0, x: 0, y: 0 },
          { at: 4200, x: 0, y: 0, ease: "out" },
          { at: 4750, x: 1.8, y: -0.4 },
          { at: 6900, x: 1.8, y: -0.4, ease: "gentle" },
          { at: 7500, x: 0, y: 0 },
          { at: 10400, x: 0, y: 0, ease: "out" },
          { at: 10950, x: -1.6, y: -0.9 },
          { at: 12600, x: -1.6, y: -0.9, ease: "gentle" },
          { at: 13200, x: 0, y: 0 },
          { at: 14000, x: 0, y: 0 },
        ],
      },
      head: {
        duration: 14000,
        repeat: true,
        keys: [
          { at: 0, rotate: 0 },
          { at: 4200, rotate: 0, ease: "gentle" },
          { at: 5100, rotate: 1.2 },
          { at: 6900, rotate: 1.2, ease: "gentle" },
          { at: 7700, rotate: 0 },
          { at: 10400, rotate: 0, ease: "gentle" },
          { at: 11300, rotate: -1 },
          { at: 12600, rotate: -1, ease: "gentle" },
          { at: 13400, rotate: 0 },
          { at: 14000, rotate: 0 },
        ],
      },
    },
    reduced: ["eyes"],
  },
  /** At work (a turn streaming, a tool running): the eyes up and drifting side to side, the head swaying, still blinking. */
  thinking: {
    hold: { look: { y: -2.2 } },
    tracks: {
      look: {
        duration: 3200,
        repeat: true,
        keys: [
          { at: 0, x: -1.8, ease: "gentle" },
          { at: 1600, x: 1.8, ease: "gentle" },
          { at: 3200, x: -1.8 },
        ],
      },
      head: {
        duration: 6400,
        repeat: true,
        keys: [
          { at: 0, rotate: -1.5, y: 0, ease: "gentle" },
          { at: 1600, rotate: 0, y: -0.6, ease: "gentle" },
          { at: 3200, rotate: 1.5, y: 0, ease: "gentle" },
          { at: 4800, rotate: 0, y: -0.6, ease: "gentle" },
          { at: 6400, rotate: -1.5, y: 0 },
        ],
      },
      eyes: blinks(4300, [2050]),
    },
    reduced: ["eyes"],
  },
  /** Listening (a voice call, dictation): the head tilted toward you, a slow nod, the eyes a little wider and breathing. */
  listening: {
    hold: { head: { rotate: 5 }, look: { y: -0.6, scale: 1.06 } },
    tracks: {
      head: {
        duration: 2400,
        repeat: true,
        keys: [
          { at: 0, rotate: 0, y: 0, ease: "gentle" },
          { at: 1200, rotate: 1.5, y: -0.8, ease: "gentle" },
          { at: 2400, rotate: 0, y: 0 },
        ],
      },
      look: {
        duration: 2400,
        repeat: true,
        keys: [
          { at: 0, scale: 1, ease: "gentle" },
          { at: 1200, scale: 1.04, ease: "gentle" },
          { at: 2400, scale: 1 },
        ],
      },
      eyes: blinks(5200, [3100]),
    },
    reduced: ["eyes"],
  },
  /** Done: once, a small hop and the «done» eyes (^ ^), then back to rest. */
  happy: {
    tracks: {
      head: {
        duration: 1300,
        repeat: false,
        keys: [
          { at: 0, rotate: 0, y: 0, scale: 1, ease: "out" },
          { at: 220, rotate: -2, y: -3.2, scale: 1.05, ease: "gentle" },
          { at: 520, rotate: 1.5, y: 0.4, scale: 0.99, ease: "gentle" },
          { at: 760, rotate: 0, y: 0, scale: 1 },
          { at: 1300, rotate: 0, y: 0, scale: 1 },
        ],
      },
      pose: {
        duration: 1300,
        repeat: false,
        keys: [
          { at: 0, opacity: 1, ease: "close" },
          { at: 120, opacity: 0 },
          { at: 1050, opacity: 0, ease: "open" },
          { at: 1250, opacity: 1 },
          { at: 1300, opacity: 1 },
        ],
      },
      happy: {
        duration: 1300,
        repeat: false,
        keys: [
          { at: 0, opacity: 0, scale: 0.6, ease: "out" },
          { at: 120, opacity: 1, scale: 0.85, ease: "out" },
          { at: 320, opacity: 1, scale: 1.08, ease: "gentle" },
          { at: 520, opacity: 1, scale: 1 },
          { at: 1050, opacity: 1, scale: 1, ease: "close" },
          { at: 1250, opacity: 0, scale: 0.9 },
          { at: 1300, opacity: 0, scale: 0.9 },
        ],
      },
    },
    reduced: [],
    then: "idle",
  },
  /** Still: print, icons, places where nothing should move. */
  static: { tracks: {}, reduced: [] },
}

/** The props a track moves (any key that names them). */
export function trackProps(track: FaceTrack): FaceProp[] {
  const seen = new Set<FaceProp>()
  for (const key of track.keys) for (const p of Object.keys(key) as (FaceProp | "at" | "ease")[]) if (p !== "at" && p !== "ease") seen.add(p)
  return [...seen]
}

/**
 * Every key with every prop of its track: a prop a key leaves out is the
 * straight line between its neighbours that name it (the first or last value
 * before or after them). The web and the native face both play this form.
 */
export function normalizeTrack(track: FaceTrack): FaceKey[] {
  const props = trackProps(track)
  return track.keys.map((key) => {
    const full: FaceKey = { at: key.at, ...(key.ease ? { ease: key.ease } : {}) }
    for (const p of props) {
      if (key[p] !== undefined) {
        full[p] = key[p]
        continue
      }
      const before = [...track.keys].reverse().find((k) => k.at <= key.at && k[p] !== undefined)
      const after = track.keys.find((k) => k.at >= key.at && k[p] !== undefined)
      if (before && after && after.at > before.at) full[p] = before[p]! + ((after[p]! - before[p]!) * (key.at - before.at)) / (after.at - before.at)
      else full[p] = (before ?? after)?.[p] ?? REST[p]
    }
    return full
  })
}
