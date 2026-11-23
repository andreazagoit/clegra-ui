/**
 * The face's SVG parts, for drawing it inside another SVG (the lockup, a
 * card, an Open Graph image): no hooks, no state, intrinsic elements only, so
 * it can also be called as a plain function by renderers that take only SVG.
 * The motion is the stylesheet's (css.ts, FACE_CSS): these parts carry the
 * classes it moves. <ClegraFace> (face.tsx) is the face on its own.
 */
import { palette } from "../tokens"
import { FACE_HEAD, FACE_HEAD_BOX, LOCKUP, faceShape, type FaceExpression, type FaceEye } from "./geometry"
import type { FaceState } from "./motion"

/**
 * Where the face sits, which picks its colours:
 *   auto   the theme's (--face, --face-eyes): the Blu head, the eyes cut out on light, Panna on dark
 *   light  on a light ground: the Blu head, the eyes cut out
 *   dark   on a dark ground: the Blu head, Panna eyes
 *   brand  on the brand's colour (a Blu button, a Blu panel): a white head, the eyes cut out
 * A personal account's pages re-point the palette (Viola), and the face follows.
 */
export type FaceTone = "auto" | "light" | "dark" | "brand"

/** Explicit colours (prints, images): `eyes` paints them; without it they are cut out. */
export type FaceColors = { head: string; eyes?: string }

const BLUE = `var(--palette-blue, ${palette.blue})`
const CREAM = `var(--palette-cream, ${palette.cream})`
const WHITE = `var(--palette-white, ${palette.white})`

/** A tone's colours: the head, the eyes painted on top (`over`, the dark theme's), or none (cut out). */
export function toneColors(tone: FaceTone): { head: string; eyes?: string; over?: string } {
  if (tone === "light") return { head: BLUE }
  if (tone === "dark") return { head: BLUE, eyes: CREAM }
  if (tone === "brand") return { head: WHITE }
  return { head: "var(--face)", over: "var(--face-eyes)" }
}

const blinks = (eye: FaceEye) => !eye.stroke

/* Eye and Eyes are called as functions, never as elements: the Open Graph renderer takes only intrinsic SVG elements. */
function Eye({ eye, color, blink, k }: { eye: FaceEye; color: string; blink: boolean; k: number }) {
  const className = blink ? "cf-eye" : undefined
  if (eye.rect) return <rect key={k} className={className} x={eye.rect[0]} y={eye.rect[1]} width={eye.rect[2]} height={eye.rect[3]} rx={eye.rect[4]} fill={color} />
  if (eye.stroke) return <path key={k} d={eye.stroke} fill="none" stroke={color} strokeWidth={eye.width} strokeLinecap="round" strokeLinejoin="round" />
  return <path key={k} className={className} d={eye.path} fill={color} />
}

/** Both eyes, in the groups the motion moves: the pointer's gaze (--lx, --ly), the state's hold and look, the pose, «happy»'s eyes. */
function Eyes({ eyes, color, happy }: { eyes: FaceEye[]; color: string; happy: boolean }) {
  return (
    <g className="cf-gaze face-look">
      <g className="cf-hold-look">
        <g className="cf-look">
          <g className="cf-pose face-blink">
            {eyes.map((eye, i) => Eye({ eye, color, blink: blinks(eye), k: i }))}
          </g>
          {happy && (
            <g className="cf-happy">
              {faceShape("done").eyes.map((eye, i) => Eye({ eye, color, blink: false, k: i }))}
            </g>
          )}
        </g>
      </g>
    </g>
  )
}

export type ClegraFaceShapesProps = {
  /** The motion (motion.ts); `static` draws it still. */
  state?: FaceState
  /** The brand's expression the eyes hold (brand/expressions); the motion plays on top of it. */
  expression?: FaceExpression
  tone?: FaceTone
  /** Colours instead of the tone's. */
  colors?: FaceColors
  /** The mask's id (unique in the page): needed when the eyes are cut out. */
  maskId?: string
}

/** The face in its 100-unit box (viewBox 0 0 100 100), as SVG elements. */
export function ClegraFaceShapes({ state = "static", expression = "idle", tone = "auto", colors, maskId }: ClegraFaceShapesProps) {
  const { tilt, eyes } = faceShape(expression)
  const paint = colors ?? toneColors(tone)
  const over = colors ? undefined : toneColors(tone).over
  const happy = state === "happy"
  const turn = tilt ? `rotate(${tilt} 50 52)` : undefined
  const cut = !paint.eyes
  if (cut && !maskId) throw new Error("ClegraFaceShapes: cut-out eyes need a maskId (unique in the page)")
  return (
    <g className="cf" data-cf-state={state} data-expression={expression}>
      {cut && (
        <defs>
          <mask id={maskId} maskUnits="userSpaceOnUse" x="-10" y="-10" width="120" height="120">
            <path d={FACE_HEAD} fill="#fff" />
            {Eyes({ eyes, color: "#000", happy })}
          </mask>
        </defs>
      )}
      <g className="cf-hold-head">
        <g className="cf-head">
          <g transform={turn}>
            {cut ? (
              <rect x={FACE_HEAD_BOX.x} y={FACE_HEAD_BOX.y} width={FACE_HEAD_BOX.width} height={FACE_HEAD_BOX.height} fill={paint.head} mask={`url(#${maskId})`} />
            ) : (
              <path d={FACE_HEAD} fill={paint.head} />
            )}
            {(paint.eyes ?? over) && Eyes({ eyes, color: (paint.eyes ?? over)!, happy })}
          </g>
        </g>
      </g>
    </g>
  )
}

/** «clegra», the wordmark's strokes (lockup.json), in the lockup's coordinates. */
export function ClegraWordmarkShapes({ color = "currentColor" }: { color?: string }) {
  return (
    <g fill="none" stroke={color} strokeWidth={LOCKUP.strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      {LOCKUP.paths.map((d) => (
        <path key={d} d={d} />
      ))}
    </g>
  )
}
