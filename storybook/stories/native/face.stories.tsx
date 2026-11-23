import type { Meta, StoryObj } from "@storybook/react-native-web-vite"
import { useEffect, useState } from "react"
import { Text, View } from "react-native"

import { ClegraFace } from "@clegra/ui/react-native/face"
import { FACE_STATES } from "@clegra/ui/face/motion"
import { NativeFrame } from "../native-frame"

/** The React Native face (src/face/face.native.tsx, through react-native-web): the same states and timings as the web's. */
const meta = { title: "Native/Clegra/Face" } satisfies Meta
export default meta

const grounds = { light: "#F7F3EA", dark: "#06070F", brand: "#2D4BEE" } as const

function Replaying({ tone }: { tone: keyof typeof grounds }) {
  const [n, setN] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setN((v) => v + 1), 3000)
    return () => clearInterval(t)
  }, [])
  return <ClegraFace key={n} state="happy" tone={tone} size={72} />
}

/** Each state on each ground («happy» replayed every 3 s). */
export const States: StoryObj = {
  render: () => (
    <NativeFrame>
      <View style={{ gap: 12 }}>
        {(Object.keys(grounds) as (keyof typeof grounds)[]).map((tone) => (
          <View key={tone} style={{ flexDirection: "row", flexWrap: "wrap", gap: 24, padding: 20, borderRadius: 16, backgroundColor: grounds[tone] }}>
            {FACE_STATES.map((state) => (
              <View key={state} style={{ alignItems: "center", gap: 8 }}>
                {state === "happy" ? <Replaying tone={tone} /> : <ClegraFace state={state} tone={tone} size={72} />}
                <Text style={{ fontSize: 12, color: tone === "light" ? "#0B1450" : "#fff" }}>{state}</Text>
              </View>
            ))}
          </View>
        ))}
      </View>
    </NativeFrame>
  ),
}
