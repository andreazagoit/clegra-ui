/**
 * <ClegraFace> for React Native (the iPhone and iPad app): the same face, the
 * same states and timings as the web's (face.tsx), from the same spec
 * (motion.ts) and the same shapes (geometry.ts). Drawn with react-native-svg,
 * in layers moved by React Native's Animated on the native driver
 * (transforms and opacity only, off the JS thread). Stops while the app is in
 * the background; with Reduce Motion on, only the blink plays.
 *
 * The eyes are painted (the native face has no cut-outs): in the ground's
 * colour on light, Panna on dark, Blu on the brand's colour.
 */
import { useEffect, useMemo, useRef, useState } from "react"
import { AccessibilityInfo, Animated, AppState, Easing, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native"
import Svg, { G, Path, Rect } from "react-native-svg"

import { colorsFor } from "@clegra/ui/tokens"
import { useColors, useResolvedTheme } from "@clegra/ui/native/theme"
import { centreOf, eyeBox, FACE_HEAD, FACE_PIVOT, FACE_VIEWBOX, faceShape, unionBox, type FaceExpression, type FaceEye } from "./geometry"
import { FACE_EASES, FACE_HOLD_EASE, FACE_HOLD_MS, FACE_MOTION, LAYER_PROPS, normalizeTrack, REST, trackProps, type FaceEase, type FaceLayer, type FacePose, type FaceProp, type FaceState, type FaceTrack } from "./motion"
import type { FaceColors, FaceTone } from "./shapes"

export type { FaceExpression } from "./geometry"
export type { FaceState } from "./motion"
export type { FaceColors, FaceTone } from "./shapes"
export { useClegraFaceState } from "./reaction"

const ease = (name: FaceEase) => {
  const [x1, y1, x2, y2] = FACE_EASES[name]
  return Easing.bezier(x1, y1, x2, y2)
}

type Values = Record<FaceProp, Animated.Value>
const makeValues = (): Values => ({
  rotate: new Animated.Value(REST.rotate),
  x: new Animated.Value(REST.x),
  y: new Animated.Value(REST.y),
  scale: new Animated.Value(REST.scale),
  scaleY: new Animated.Value(REST.scaleY),
  opacity: new Animated.Value(REST.opacity),
})

/** One track as Animated: the keys in order, each segment with its key's ease, looped if it repeats. */
function playTrack(values: Values, track: FaceTrack): Animated.CompositeAnimation {
  const keys = normalizeTrack(track)
  const props = trackProps(track)
  const first = keys[0]!
  for (const p of props) values[p].setValue(first[p] ?? REST[p])
  const steps: Animated.CompositeAnimation[] = []
  if (track.delay) steps.push(Animated.delay(track.delay))
  for (let i = 1; i < keys.length; i++) {
    const from = keys[i - 1]!
    const to = keys[i]!
    const duration = to.at - from.at
    steps.push(
      Animated.parallel(
        props.map((p) =>
          Animated.timing(values[p], { toValue: to[p] ?? REST[p], duration, easing: from.ease ? ease(from.ease) : Easing.linear, useNativeDriver: true }),
        ),
      ),
    )
  }
  const once = Animated.sequence(steps)
  return track.repeat ? Animated.loop(once, { iterations: -1, resetBeforeIteration: true }) : once
}

function holdTo(values: Values, pose: FacePose | undefined, props: FaceProp[], animate: boolean) {
  return props.map((p) => {
    const toValue = pose?.[p] ?? REST[p]
    if (!animate) {
      values[p].setValue(toValue)
      return null
    }
    return Animated.timing(values[p], { toValue, duration: FACE_HOLD_MS, easing: ease(FACE_HOLD_EASE), useNativeDriver: true })
  })
}

function useReduceMotion() {
  const [reduce, setReduce] = useState(false)
  useEffect(() => {
    let on = true
    void AccessibilityInfo.isReduceMotionEnabled().then((v) => on && setReduce(v))
    const sub = AccessibilityInfo.addEventListener("reduceMotionChanged", setReduce)
    return () => {
      on = false
      sub.remove()
    }
  }, [])
  return reduce
}

function useActive() {
  const [active, setActive] = useState(AppState.currentState !== "background")
  useEffect(() => {
    const sub = AppState.addEventListener("change", (s) => setActive(s === "active"))
    return () => sub.remove()
  }, [])
  return active
}

/** A tone's colours on native: the head and the painted eyes. */
function useToneColors(tone: FaceTone, colors?: FaceColors): { head: string; eyes: string } {
  const c = useColors()
  const scheme = useResolvedTheme()
  const cream = colorsFor("light").background
  if (colors) return { head: colors.head, eyes: colors.eyes ?? (scheme === "dark" ? cream : c.background) }
  if (tone === "brand") return { head: c.primaryForeground, eyes: c.primary }
  if (tone === "dark") return { head: colorsFor("dark").primary, eyes: cream }
  if (tone === "light") return { head: colorsFor("light").primary, eyes: cream }
  return { head: c.primary, eyes: cream }
}

function EyeShape({ eye, color }: { eye: FaceEye; color: string }) {
  if (eye.rect) return <Rect x={eye.rect[0]} y={eye.rect[1]} width={eye.rect[2]} height={eye.rect[3]} rx={eye.rect[4]} fill={color} />
  if (eye.stroke) return <Path d={eye.stroke} fill="none" stroke={color} strokeWidth={eye.width} strokeLinecap="round" strokeLinejoin="round" />
  return <Path d={eye.path} fill={color} />
}

const pct = (v: number) => `${v}%`
const origin = (p: { x: number; y: number }) => `${pct(p.x)} ${pct(p.y)}`

export type ClegraFaceProps = {
  state?: FaceState
  expression?: FaceExpression
  tone?: FaceTone
  colors?: FaceColors
  /** Width and height in points (default 40). */
  size?: number
  style?: StyleProp<ViewStyle>
  /** Read aloud; without it the face is decoration. */
  title?: string
}

/** Clegra's face, alive (React Native). */
export function ClegraFace({ state = "idle", expression = "idle", tone = "auto", colors, size = 40, style, title }: ClegraFaceProps) {
  const paint = useToneColors(tone, colors)
  const reduce = useReduceMotion()
  const active = useActive()
  const [settled, setSettled] = useState<FaceState | null>(null)
  const shown: FaceState = state === "happy" && settled === "happy" ? (FACE_MOTION.happy.then ?? "idle") : state
  useEffect(() => {
    if (state !== "happy") setSettled(null)
  }, [state])

  const { tilt, eyes } = faceShape(expression)
  const done = faceShape("done").eyes
  const k = size / 100
  const geometry = useMemo(
    () => ({
      look: centreOf(unionBox(eyes.map(eyeBox))),
      eyes: eyes.map((e) => centreOf(eyeBox(e))),
      happy: centreOf(unionBox(done.map(eyeBox))),
    }),
    [eyes, done],
  )

  const v = useRef<Record<FaceLayer | "holdHead" | "holdLook", Values>>(null)
  v.current ??= { head: makeValues(), look: makeValues(), eyes: makeValues(), pose: makeValues(), happy: makeValues(), holdHead: makeValues(), holdLook: makeValues() }
  const values = v.current
  const first = useRef(true)

  useEffect(() => {
    const motion = FACE_MOTION[shown]
    // The holds: eased to the state's pose (straight there the first time, and with Reduce Motion).
    const glide = !first.current && !reduce
    first.current = false
    const holds = [...holdTo(values.holdHead, motion.hold?.head, LAYER_PROPS.head, glide), ...holdTo(values.holdLook, motion.hold?.look, LAYER_PROPS.look, glide)].filter(
      (a): a is Animated.CompositeAnimation => a !== null,
    )
    // Every layer back at rest, then the state's tracks (only the reduced ones with Reduce Motion; none in the background).
    for (const layer of Object.keys(LAYER_PROPS) as FaceLayer[]) for (const p of LAYER_PROPS[layer]) values[layer][p].setValue(layer === "happy" && p === "opacity" ? 0 : REST[p])
    const playing: Animated.CompositeAnimation[] = []
    let ending: Animated.CompositeAnimation | null = null
    if (active)
      for (const [layer, track] of Object.entries(motion.tracks) as [FaceLayer, FaceTrack][]) {
        if (reduce && !motion.reduced.includes(layer)) continue
        const anim = playTrack(values[layer], track)
        if (!track.repeat && layer === "head") ending = anim
        else playing.push(anim)
      }
    const all = [...holds, ...playing]
    for (const a of all) a.start()
    ending?.start(({ finished }) => {
      if (finished && shown === "happy") setSettled("happy")
    })
    return () => {
      for (const a of all) a.stop()
      ending?.stop()
    }
  }, [shown, reduce, active, values])

  const layer = (vals: Values, at: { x: number; y: number }) => ({
    ...FILL,
    transformOrigin: origin(at),
    opacity: vals.opacity,
    transform: [
      { translateX: Animated.multiply(vals.x, k) },
      { translateY: Animated.multiply(vals.y, k) },
      { rotate: vals.rotate.interpolate({ inputRange: [-360, 360], outputRange: ["-360deg", "360deg"] }) },
      { scale: vals.scale },
      { scaleY: vals.scaleY },
    ],
  })
  const pivot = FACE_PIVOT
  const svg = (children: React.ReactNode) => (
    <Svg width={size} height={size} viewBox={FACE_VIEWBOX} style={StyleSheet.absoluteFill}>
      <G rotation={tilt} originX={pivot.x} originY={pivot.y}>
        {children}
      </G>
    </Svg>
  )
  return (
    <View
      style={[{ width: size, height: size }, style]}
      accessible={Boolean(title)}
      accessibilityRole={title ? "image" : undefined}
      accessibilityLabel={title}
      importantForAccessibility={title ? "yes" : "no-hide-descendants"}
      pointerEvents="none"
      testID="clegra-face"
    >
      <Animated.View style={layer(values.holdHead, pivot)}>
        <Animated.View style={layer(values.head, pivot)}>
          {svg(<Path d={FACE_HEAD} fill={paint.head} />)}
          <Animated.View style={layer(values.holdLook, geometry.look)}>
            <Animated.View style={layer(values.look, geometry.look)}>
              <Animated.View style={layer(values.pose, geometry.look)}>
                {eyes.map((eye, i) => (
                  <Animated.View key={i} style={layer(eye.stroke ? REST_VALUES : values.eyes, geometry.eyes[i]!)}>
                    {svg(<EyeShape eye={eye} color={paint.eyes} />)}
                  </Animated.View>
                ))}
              </Animated.View>
              {shown === "happy" && (
                <Animated.View style={layer(values.happy, geometry.happy)}>
                  {svg(done.map((eye, i) => <EyeShape key={i} eye={eye} color={paint.eyes} />))}
                </Animated.View>
              )}
            </Animated.View>
          </Animated.View>
        </Animated.View>
      </Animated.View>
    </View>
  )
}

const FILL = { position: "absolute", left: 0, top: 0, right: 0, bottom: 0 } as const

/** Still values, for the eyes that don't blink (the strokes of «done»). */
const REST_VALUES = makeValues()
