/**
 * THE FACE'S SHAPE («Faccina»), read from face-data.ts (the brand's face.json, written by
 * storybook-brand's generator from its expressions). This file is the only
 * reader of face-data.ts and lockup-data.ts in the library and the apps: the web
 * face (face.tsx), the React Native one (face.native.tsx), the lockup, the
 * brand pages and the static SVG string (faceSvg) all take the shapes from
 * here. Nothing here changes the shape: the head and each expression's eyes
 * are the brand's, as drawn.
 */
import face from "./face-data"
import lockupJson from "./lockup-data"

export type FaceEye = { rect?: number[]; stroke?: string; width?: number; path?: string }

/** The expressions the brand draws (the eyes, and the one tilt of «waiting»). */
export type FaceExpression = "idle" | "reading" | "proposing" | "waiting" | "done" | "done-tick" | "blink"

export type FaceShape = { tilt: number; eyes: FaceEye[] }

/** The face's box (0 0 100 100) and the head, the same in every expression. */
export const FACE_VIEWBOX = face.viewBox
export const FACE_HEAD = face.head
/** The head turns, nods and grows about this point (its own centre, as the brand's tilt does). */
export const FACE_PIVOT = { x: 50, y: 52 } as const
/** The head's bounds (the masked tile of a cut-out face is exactly this, so its centre is the pivot). */
export const FACE_HEAD_BOX = { x: 6, y: 13, width: 88, height: 78 } as const

const shapes = face.expressions as Record<FaceExpression, FaceShape>
export const FACE_EXPRESSIONS = Object.keys(shapes) as FaceExpression[]

export function faceShape(expression: FaceExpression = "idle"): FaceShape {
  return shapes[expression] ?? shapes.idle
}

export type Box = { x: number; y: number; width: number; height: number }

/** The end points of a path's commands (M L H V Q C S T A, absolute): enough for a shape's centre. */
function pathPoints(d: string): [number, number][] {
  const points: [number, number][] = []
  let x = 0
  let y = 0
  for (const [, command, args] of d.matchAll(/([MLHVQCSTAZ])([^MLHVQCSTAZ]*)/gi)) {
    const n = (args.match(/-?\d*\.?\d+/g) ?? []).map(Number)
    const c = command.toUpperCase()
    if (c === "H") x = n.at(-1) ?? x
    else if (c === "V") y = n.at(-1) ?? y
    else if (c !== "Z" && n.length >= 2) {
      x = n.at(-2)!
      y = n.at(-1)!
    }
    if (c !== "Z") points.push([x, y])
  }
  return points
}

/** An eye's bounds (a rect's own; a path's from its points, the stroke's half width around it). */
export function eyeBox(eye: FaceEye): Box {
  if (eye.rect) return { x: eye.rect[0], y: eye.rect[1], width: eye.rect[2], height: eye.rect[3] }
  const pts = pathPoints(eye.path ?? eye.stroke ?? "")
  const pad = eye.stroke ? (eye.width ?? 0) / 2 : 0
  const xs = pts.map((p) => p[0])
  const ys = pts.map((p) => p[1])
  const x = Math.min(...xs) - pad
  const y = Math.min(...ys) - pad
  return { x, y, width: Math.max(...xs) + pad - x, height: Math.max(...ys) + pad - y }
}

export function unionBox(boxes: Box[]): Box {
  const x = Math.min(...boxes.map((b) => b.x))
  const y = Math.min(...boxes.map((b) => b.y))
  return { x, y, width: Math.max(...boxes.map((b) => b.x + b.width)) - x, height: Math.max(...boxes.map((b) => b.y + b.height)) - y }
}

export const centreOf = (b: Box) => ({ x: b.x + b.width / 2, y: b.y + b.height / 2 })

/** The horizontal lockup «Faccina» + «clegra» (brand/lockup.json). */
export const LOCKUP = {
  viewBox: lockupJson.viewBox,
  /** The drawing's own bounds, without the clear space. */
  box: lockupJson.box,
  faceTransform: lockupJson.faceTransform,
  strokeWidth: lockupJson.strokeWidth,
  paths: lockupJson.paths as string[],
}

/** The eyes as SVG markup in `color` (a cut-out's are black in its mask). */
export function eyesMarkup(eyes: FaceEye[], color: string) {
  return eyes
    .map((e) =>
      e.rect
        ? `<rect x="${e.rect[0]}" y="${e.rect[1]}" width="${e.rect[2]}" height="${e.rect[3]}" rx="${e.rect[4]}" fill="${color}"/>`
        : e.stroke
          ? `<path d="${e.stroke}" fill="none" stroke="${color}" stroke-width="${e.width}" stroke-linecap="round" stroke-linejoin="round"/>`
          : `<path d="${e.path}" fill="${color}"/>`,
    )
    .join("")
}

/**
 * The face as a standalone SVG string, still: for what can't run React or
 * motion (an email's image, a print, a native window's HTML). `eyes` paints
 * the eyes in that colour; without it they are cut out (transparent).
 */
export function faceSvg({ head, eyes, expression = "idle", size, padding = 0 }: { head: string; eyes?: string; expression?: FaceExpression; size?: number; padding?: number }) {
  const { tilt, eyes: shapes } = faceShape(expression)
  const turn = tilt ? ` transform="rotate(${tilt} ${FACE_PIVOT.x} ${FACE_PIVOT.y})"` : ""
  const box = `${-padding} ${-padding} ${100 + padding * 2} ${100 + padding * 2}`
  const dims = size ? ` width="${size}" height="${size}"` : ""
  const body = eyes
    ? `<g${turn}><path d="${FACE_HEAD}" fill="${head}"/>${eyesMarkup(shapes, eyes)}</g>`
    : `<defs><mask id="cf" maskUnits="userSpaceOnUse" x="-10" y="-10" width="120" height="120"><path d="${FACE_HEAD}" fill="#fff"/>${eyesMarkup(shapes, "#000")}</mask></defs>` +
      `<g${turn}><rect x="-10" y="-10" width="120" height="120" fill="${head}" mask="url(#cf)"/></g>`
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${box}"${dims}>${body}</svg>`
}
