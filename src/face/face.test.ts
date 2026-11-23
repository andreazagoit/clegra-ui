import assert from "node:assert/strict"
import { test } from "node:test"

import face from "./face-data"
import { FACE_CSS, keyframesName, LAYER_CLASS } from "./css"
import { eyeBox, FACE_EXPRESSIONS, FACE_HEAD, faceShape, faceSvg } from "./geometry"
import { FACE_EASES, FACE_MOTION, FACE_STATES, LAYER_PROPS, normalizeTrack, trackProps, type FaceLayer, type FaceTrack } from "./motion"
import { HAPPY_MS } from "./reaction"

const tracks = () =>
  FACE_STATES.flatMap((state) => (Object.entries(FACE_MOTION[state].tracks) as [FaceLayer, FaceTrack][]).map(([layer, track]) => ({ state, layer, track })))

test("the geometry is face.json's, unchanged", () => {
  assert.equal(FACE_HEAD, face.head)
  assert.deepEqual(FACE_EXPRESSIONS.sort(), Object.keys(face.expressions).sort())
  for (const name of FACE_EXPRESSIONS) assert.deepEqual(faceShape(name), face.expressions[name as keyof typeof face.expressions])
})

test("an eye's box: a rect's own, a stroke's around its points", () => {
  assert.deepEqual(eyeBox({ rect: [33.5, 34.5, 11, 19, 5.5] }), { x: 33.5, y: 34.5, width: 11, height: 19 })
  const arc = eyeBox(faceShape("done").eyes[0]!)
  assert.ok(arc.x < 33 && arc.x + arc.width > 45, "the arc spans its end points and the stroke")
})

test("every track is well formed: keys from 0 to its duration, in order, props of its layer, known eases", () => {
  for (const { state, layer, track } of tracks()) {
    const where = `${state}.${layer}`
    assert.equal(track.keys[0]!.at, 0, `${where} starts at 0`)
    assert.equal(track.keys.at(-1)!.at, track.duration, `${where} ends at its duration`)
    for (let i = 1; i < track.keys.length; i++) assert.ok(track.keys[i]!.at > track.keys[i - 1]!.at, `${where} key ${i} after the one before`)
    for (const p of trackProps(track)) assert.ok(LAYER_PROPS[layer].includes(p), `${where} moves ${p}`)
    for (const k of track.keys) if (k.ease) assert.ok(k.ease in FACE_EASES, `${where} ease ${k.ease}`)
    // A loop starts where it ends: no jump between iterations.
    if (track.repeat) for (const p of trackProps(track)) assert.equal(normalizeTrack(track)[0]![p], normalizeTrack(track).at(-1)![p], `${where} ${p} loops seamlessly`)
  }
})

test("calm: nothing loops faster than 1.6 s, the head turns at most 8° and moves at most 4 units", () => {
  for (const { state, layer, track } of tracks()) {
    if (track.repeat) assert.ok(track.duration >= 1600, `${state}.${layer}`)
    for (const k of normalizeTrack(track)) {
      if (k.rotate !== undefined) assert.ok(Math.abs(k.rotate) <= 8)
      for (const p of ["x", "y"] as const) if (k[p] !== undefined) assert.ok(Math.abs(k[p]!) <= 4)
    }
  }
})

test("normalized keys name every prop of their track", () => {
  const n = normalizeTrack({ duration: 100, repeat: false, keys: [{ at: 0, x: 0, y: 2 }, { at: 50, x: 10 }, { at: 100, x: 0, y: 4 }] })
  assert.deepEqual(n.map((k) => [k.x, k.y]), [[0, 2], [10, 3], [0, 4]])
})

test("reduced motion keeps only layers the state plays, and only the blink loops", () => {
  for (const state of FACE_STATES) for (const layer of FACE_MOTION[state].reduced) {
    assert.ok(FACE_MOTION[state].tracks[layer], `${state} plays ${layer}`)
    assert.equal(layer, "eyes")
  }
  assert.deepEqual(FACE_MOTION.static.tracks, {})
})

test("the stylesheet has a keyframes and a rule per track, the holds, the pause and the reduced block", () => {
  for (const { state, layer } of tracks()) {
    assert.match(FACE_CSS, new RegExp(`@keyframes ${keyframesName(state, layer)} `))
    assert.ok(FACE_CSS.includes(`.cf[data-cf-state="${state}"] .${LAYER_CLASS[layer]} { animation: ${keyframesName(state, layer)} `))
  }
  assert.ok(FACE_CSS.includes(`.cf[data-cf-state="listening"] .cf-hold-head { transform: translate(0px, 0px) rotate(5deg) scale(1)`))
  assert.ok(FACE_CSS.includes("animation-play-state: paused"))
  const reduced = FACE_CSS.slice(FACE_CSS.indexOf("@media (prefers-reduced-motion: reduce)"))
  assert.ok(reduced.includes(`.cf[data-cf-state="idle"] .cf-head { animation: none; }`))
  assert.ok(!reduced.includes(`.cf[data-cf-state="idle"] .cf-eye { animation: none; }`), "the blink stays")
})

test("«happy» plays once, as long as its longest track, and settles into idle", () => {
  assert.equal(HAPPY_MS, 1300)
  assert.equal(FACE_MOTION.happy.then, "idle")
  for (const t of Object.values(FACE_MOTION.happy.tracks)) assert.equal(t!.repeat, false)
})

test("the static SVG string: the head, the eyes painted or cut out", () => {
  assert.ok(faceSvg({ head: "#2d4bee", eyes: "#fff" }).includes(`fill="#fff"`))
  assert.ok(faceSvg({ head: "#2d4bee" }).includes("<mask"))
  assert.ok(faceSvg({ head: "#2d4bee", expression: "waiting" }).includes("rotate(8 50 52)"))
})
