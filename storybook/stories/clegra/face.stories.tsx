import type { Meta, StoryObj } from "@storybook/react-native-web-vite"
import { useEffect, useState, type ReactNode } from "react"

import { ClegraFace, ClegraLockup, useClegraFaceState, type FaceState, type FaceTone } from "@clegra/ui/face"
import { FACE_STATES } from "@clegra/ui/face/motion"

/**
 * Clegra's face («Faccina»), alive (src/face/): the one component the web
 * apps draw it with (`@clegra/ui/face`). Every state, every tone; the
 * motion is CSS from src/face/motion.ts, the same spec the native face plays.
 */
const meta = {
  title: "Web/Clegra/Face",
  component: ClegraFace,
  args: { state: "idle", tone: "auto", size: 96 },
  argTypes: {
    state: { control: "inline-radio", options: FACE_STATES },
    tone: { control: "inline-radio", options: ["auto", "light", "dark", "brand"] },
    expression: { control: "select", options: ["idle", "reading", "proposing", "waiting", "done", "done-tick", "blink"] },
    size: { control: { type: "range", min: 16, max: 256, step: 4 } },
  },
} satisfies Meta<typeof ClegraFace>
export default meta
type Story = StoryObj<typeof meta>

const grounds: Record<Exclude<FaceTone, "auto">, string> = { light: "var(--palette-cream)", dark: "var(--palette-night)", brand: "var(--palette-blue)" }
const ink: Record<Exclude<FaceTone, "auto">, string> = { light: "var(--palette-ink)", dark: "#fff", brand: "#fff" }

function Cell({ label, color, children }: { label: string; color?: string; children: ReactNode }) {
  return (
    <figure style={{ margin: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 10, color }}>
      {children}
      <figcaption style={{ font: "500 12px/1 Inter, sans-serif", opacity: 0.8 }}>{label}</figcaption>
    </figure>
  )
}

function Row({ tone, children }: { tone: Exclude<FaceTone, "auto">; children: ReactNode }) {
  return <div style={{ display: "flex", gap: 40, flexWrap: "wrap", padding: 28, borderRadius: 16, background: grounds[tone] }}>{children}</div>
}

/** «happy» plays once (1.3 s) and settles into idle: replayed every 3 s in the stories. */
function ReplayingHappy(props: { tone?: FaceTone; size?: number }) {
  const [n, setN] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setN((v) => v + 1), 3000)
    return () => clearInterval(t)
  }, [])
  return <ClegraFace key={n} {...props} state="happy" />
}

/** Play with the controls. */
export const Playground: Story = {}

/** Each state on its ground, side by side: idle, thinking, listening, happy (once, then idle; «Replay» below), static. */
export const States: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 16 }}>
      {(["light", "dark", "brand"] as const).map((tone) => (
        <Row key={tone} tone={tone}>
          {FACE_STATES.map((state) => (
            <Cell key={state} label={`${state} · ${tone}`} color={ink[tone]}>
              {state === "happy" ? <ReplayingHappy tone={tone} size={88} /> : <ClegraFace state={state} tone={tone} size={88} />}
            </Cell>
          ))}
        </Row>
      ))}
    </div>
  ),
}

export const Idle: Story = { args: { state: "idle" } }
export const Thinking: Story = { args: { state: "thinking" } }
export const Listening: Story = { args: { state: "listening" } }
export const Static: Story = { args: { state: "static" } }

/** «happy» plays once (1.3 s) and settles into idle (replayed every 3 s here). */
export const Happy: Story = { render: (args) => <ReplayingHappy tone={args.tone} size={args.size} /> }

/** The brand's expressions, held while the face is idle (the motion plays on top of them). */
export const Expressions: Story = {
  render: () => (
    <Row tone="light">
      {(["idle", "reading", "proposing", "waiting", "done", "done-tick"] as const).map((expression) => (
        <Cell key={expression} label={expression} color={ink.light}>
          <ClegraFace expression={expression} tone="light" size={72} />
        </Cell>
      ))}
    </Row>
  ),
}

/** Small sizes: the avatar (24), the floating button (28 on Blu), the rail (32). */
export const Sizes: Story = {
  render: () => (
    <Row tone="light">
      {[16, 24, 32, 48, 64].map((s) => (
        <Cell key={s} label={`${s} px`} color={ink.light}>
          <ClegraFace size={s} tone="light" />
        </Cell>
      ))}
      <Cell label="on a Blu button" color={ink.light}>
        <span style={{ display: "flex", width: 56, height: 56, borderRadius: 999, alignItems: "center", justifyContent: "center", background: "var(--palette-blue)" }}>
          <ClegraFace size={28} tone="brand" />
        </span>
      </Cell>
    </Row>
  ),
}

/** A turn: thinking while it streams, happy when it ends (useClegraFaceState), as the chat's avatar and the floating button do. */
export const Turn: Story = {
  render: () => {
    const [busy, setBusy] = useState(false)
    const state: FaceState = useClegraFaceState({ busy })
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <ClegraFace state={state} size={72} />
        <button type="button" onClick={() => setBusy((b) => !b)} style={{ padding: "8px 14px", borderRadius: 999, border: "1px solid var(--border)" }}>
          {busy ? "End the turn" : "Start a turn"}
        </button>
        <code>{state}</code>
      </div>
    )
  },
}

/** The lockup: the same face beside the wordmark. */
export const Lockup: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 16 }}>
      <Row tone="light">
        <ClegraLockup state="idle" tone="light" style={{ height: 40, color: "var(--palette-ink)" }} />
      </Row>
      <Row tone="dark">
        <ClegraLockup state="idle" tone="dark" style={{ height: 40, color: "#fff" }} />
      </Row>
    </div>
  ),
}
