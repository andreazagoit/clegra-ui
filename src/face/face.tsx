"use client"

/**
 * <ClegraFace>: Clegra's face («Faccina»), the one drawing of it in the web
 * apps: the logo, the assistant's avatar, the panel, the floating button, the
 * call. Drawn from brand/face.json (geometry.ts), moved by the one
 * motion spec (motion.ts) as pure CSS (css.ts): transforms and opacity only,
 * paused off screen and while the tab is hidden, and only the blink for
 * whoever asks for less motion. face.native.tsx is the same for React Native.
 */
import { useEffect, useId, useRef, useState, type CSSProperties } from "react"

import { FACE_CSS } from "./css"
import { FACE_VIEWBOX, LOCKUP, type FaceExpression } from "./geometry"
import type { FaceState } from "./motion"
import { ClegraFaceShapes, ClegraWordmarkShapes, type FaceColors, type FaceTone } from "./shapes"

export type { FaceExpression } from "./geometry"
export type { FaceState } from "./motion"
export type { FaceColors, FaceTone } from "./shapes"
export { ClegraFaceShapes, ClegraWordmarkShapes, toneColors } from "./shapes"
export { useClegraFaceState } from "./reaction"

/** The face's stylesheet, once per page (React hoists and dedupes it by href); the face and the lockup render it. */
export function ClegraFaceStyle() {
  return (
    <style href="clegra-face" precedence="default">
      {FACE_CSS}
    </style>
  )
}

// One observer and one visibility listener for every face on the page.
const watched = new Map<Element, (on: boolean) => void>()
let observer: IntersectionObserver | null = null
function watch(el: Element, set: (paused: boolean) => void) {
  if (typeof IntersectionObserver === "undefined") return () => {}
  observer ??= new IntersectionObserver((entries) => {
    for (const e of entries) watched.get(e.target)?.(!e.isIntersecting)
  })
  watched.set(el, set)
  observer.observe(el)
  return () => {
    watched.delete(el)
    observer?.unobserve(el)
  }
}
function useHidden() {
  const [hidden, setHidden] = useState(false)
  useEffect(() => {
    const sync = () => setHidden(document.hidden)
    sync()
    document.addEventListener("visibilitychange", sync)
    return () => document.removeEventListener("visibilitychange", sync)
  }, [])
  return hidden
}

/** Paused while the element is off screen or the tab is hidden (a still face costs nothing). */
function usePaused(moving: boolean) {
  const ref = useRef<SVGSVGElement>(null)
  const [away, setAway] = useState(false)
  const hidden = useHidden()
  useEffect(() => {
    const el = ref.current
    if (!el || !moving) return
    return watch(el, setAway)
  }, [moving])
  return { ref, paused: moving && (away || hidden) }
}

/** «happy» plays once and settles into its `then` (idle): the end of its head's animation says when. */
function useSettled(state: FaceState) {
  const [settledFrom, setSettledFrom] = useState<FaceState | null>(null)
  const shown = settledFrom === state && state === "happy" ? "idle" : state
  const onAnimationEnd = (e: React.AnimationEvent) => {
    if (state === "happy" && e.animationName === "cf-happy-head") setSettledFrom("happy")
  }
  useEffect(() => {
    if (state !== "happy") setSettledFrom(null)
  }, [state])
  return { shown, onAnimationEnd }
}

export type ClegraFaceProps = {
  /** idle (default), thinking, listening, happy (once, then idle) or static. */
  state?: FaceState
  /** The brand's expression the eyes hold (idle, reading, proposing, waiting, done…). */
  expression?: FaceExpression
  /** Where it sits: auto (the theme's), light, dark, brand (on Blu). */
  tone?: FaceTone
  /** Explicit colours instead of the tone's (prints, images). */
  colors?: FaceColors
  /** Width and height in px; without it the class sizes it (e.g. size-6). */
  size?: number
  className?: string
  style?: CSSProperties
  /** Read aloud; without it the face is decoration. */
  title?: string
}

/** Clegra's face, alive. */
export function ClegraFace({ state = "idle", expression = "idle", tone = "auto", colors, size, className, style, title }: ClegraFaceProps) {
  const maskId = `cf${useId().replace(/[^\w-]/g, "")}`
  const { shown, onAnimationEnd } = useSettled(state)
  const { ref, paused } = usePaused(shown !== "static")
  return (
    <>
      {shown !== "static" && <ClegraFaceStyle />}
      <svg
        ref={ref}
        viewBox={FACE_VIEWBOX}
        width={size}
        height={size}
        role={title ? "img" : undefined}
        aria-label={title}
        aria-hidden={title ? undefined : true}
        data-slot="clegra-face"
        data-state={shown}
        data-cf-paused={paused ? "" : undefined}
        onAnimationEnd={onAnimationEnd}
        className={className}
        style={{ overflow: "visible", flexShrink: 0, ...style }}
      >
        <ClegraFaceShapes state={shown} expression={expression} tone={tone} colors={colors} maskId={maskId} />
      </svg>
    </>
  )
}

/**
 * «Faccina» and «clegra», the horizontal lockup (brand/lockup.json):
 * the same face (its state, still by default) beside the wordmark in
 * `currentColor`. `space`: the viewBox with the clear space; otherwise the drawing's own bounds.
 */
export function ClegraLockup({
  state = "static",
  tone = "auto",
  colors,
  word = "currentColor",
  space = false,
  className,
  style,
  title = "Clegra",
  look = false,
}: {
  state?: FaceState
  tone?: FaceTone
  colors?: FaceColors
  word?: string
  space?: boolean
  className?: string
  style?: CSSProperties
  title?: string
  /** Marks it for the site's pointer-following eyes (sections/kit/logo-look.tsx). */
  look?: boolean
}) {
  const maskId = `cf${useId().replace(/[^\w-]/g, "")}`
  const { ref, paused } = usePaused(state !== "static")
  return (
    <>
      {state !== "static" && <ClegraFaceStyle />}
      <svg
        ref={ref}
        viewBox={space ? LOCKUP.viewBox : LOCKUP.box}
        role="img"
        aria-label={title}
        data-slot="clegra-lockup"
        data-look={look ? "" : undefined}
        data-cf-paused={paused ? "" : undefined}
        className={className}
        style={{ overflow: "visible", ...style }}
      >
        <g transform={LOCKUP.faceTransform}>
          <ClegraFaceShapes state={state} tone={tone} colors={colors} maskId={maskId} />
        </g>
        <ClegraWordmarkShapes color={word} />
      </svg>
    </>
  )
}
