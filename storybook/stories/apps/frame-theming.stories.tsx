import type { Meta, StoryObj } from "@storybook/react-native-web-vite"

import { FrameThemingPage, type FrameThemingArgs } from "../../apps/guide-pages"

/** <ClegraProvider> (@clegra/ui/frame): the host's look inside an application's own view. */
const meta = {
  title: "Apps/Frame theming",
  args: { mode: "light", textScale: 1 },
  argTypes: {
    mode: { control: "inline-radio", options: ["light", "dark"] },
    textScale: { control: { type: "range", min: 0.8, max: 2, step: 0.05 } },
  },
} satisfies Meta<FrameThemingArgs>
export default meta

export const Provider: StoryObj<FrameThemingArgs> = { name: "ClegraProvider", render: (args) => <FrameThemingPage {...args} /> }
