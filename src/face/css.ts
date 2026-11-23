/**
 * The web face's stylesheet, made from the motion spec (motion.ts): one
 * @keyframes per state and layer, the holds as transitions, the reduced-motion
 * fallback and the pause (off screen, tab hidden). face.tsx puts it in the
 * page once (a React 19 hoisted <style>), whatever the number of faces.
 */
import { FACE_EASES, FACE_HOLD_EASE, FACE_HOLD_MS, FACE_LAYERS, FACE_MOTION, FACE_STATES, normalizeTrack, REST, trackProps, type FaceKey, type FaceLayer, type FacePose, type FaceProp, type FaceTrack } from "./motion"

/** The class each layer's element carries (face shapes, shapes.tsx). */
export const LAYER_CLASS: Record<FaceLayer, string> = { head: "cf-head", look: "cf-look", eyes: "cf-eye", pose: "cf-pose", happy: "cf-happy" }

const n = (v: number) => String(Math.round(v * 1000) / 1000)
const bezier = (ease: keyof typeof FACE_EASES) => `cubic-bezier(${FACE_EASES[ease].join(", ")})`

/** A layer's pose as CSS (transform and opacity), the props it doesn't name at rest. */
export function poseCss(layer: FaceLayer, pose: FacePose, props: FaceProp[]): string {
  const v = (p: FaceProp) => pose[p] ?? REST[p]
  const out: string[] = []
  const transform =
    layer === "head"
      ? `translate(0px, ${n(v("y"))}px) rotate(${n(v("rotate"))}deg) scale(${n(v("scale"))})`
      : layer === "look"
        ? `translate(${n(v("x"))}px, ${n(v("y"))}px) scale(${n(v("scale"))})`
        : layer === "eyes"
          ? `scaleY(${n(v("scaleY"))})`
          : layer === "happy" && props.includes("scale")
            ? `scale(${n(v("scale"))})`
            : null
  if (transform && props.some((p) => p !== "opacity")) out.push(`transform: ${transform}`)
  if (props.includes("opacity")) out.push(`opacity: ${n(v("opacity"))}`)
  return out.join("; ")
}

export const keyframesName = (state: string, layer: FaceLayer) => `cf-${state}-${layer}`

function keyframes(name: string, layer: FaceLayer, track: FaceTrack) {
  const props = trackProps(track)
  const frames = normalizeTrack(track).map((key: FaceKey) => {
    const ease = key.ease ? `; animation-timing-function: ${bezier(key.ease)}` : ""
    return `${n((key.at / track.duration) * 100)}% { ${poseCss(layer, key, props)}${ease} }`
  })
  return `@keyframes ${name} { ${frames.join(" ")} }`
}

const at = (state: string) => `.cf[data-cf-state="${state}"]`

/** The whole stylesheet. */
export function faceCss(): string {
  const rules: string[] = [
    // Every moving part turns and grows about its own centre (the head's is 50 52, FACE_HEAD_BOX).
    `.cf-hold-head, .cf-head, .cf-hold-look, .cf-look, .cf-eye, .cf-happy { transform-box: fill-box; transform-origin: center; }`,
    `.cf-hold-head, .cf-hold-look { transition: transform ${FACE_HOLD_MS}ms ${bezier(FACE_HOLD_EASE)}; }`,
    `.cf-happy { opacity: 0; }`,
    `[data-cf-paused] .cf, [data-cf-paused] .cf * { animation-play-state: paused !important; }`,
  ]
  const reduced: string[] = [`.cf-hold-head, .cf-hold-look { transition: none; }`]
  for (const state of FACE_STATES) {
    const motion = FACE_MOTION[state]
    for (const [part, pose] of Object.entries(motion.hold ?? {}) as ["head" | "look", FacePose][])
      rules.push(`${at(state)} .cf-hold-${part} { ${poseCss(part, pose, Object.keys(pose) as FaceProp[])}; }`)
    for (const layer of FACE_LAYERS) {
      const track = motion.tracks[layer]
      if (!track) continue
      const name = keyframesName(state, layer)
      rules.push(keyframes(name, layer, track))
      const timing = `${track.duration}ms linear ${track.delay ?? 0}ms ${track.repeat ? "infinite" : "1 both"}`
      rules.push(`${at(state)} .${LAYER_CLASS[layer]} { animation: ${name} ${timing}; }`)
      if (!motion.reduced.includes(layer)) reduced.push(`${at(state)} .${LAYER_CLASS[layer]} { animation: none; }`)
    }
  }
  return `${rules.join("\n")}\n@media (prefers-reduced-motion: reduce) {\n${reduced.join("\n")}\n}\n`
}

export const FACE_CSS = faceCss()
