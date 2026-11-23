import type { Meta, StoryObj } from "@storybook/react-native-web-vite"

import gallery from "../../gallery/cases/scroll-area"
import { NativeFrame } from "../native-frame"

/** The React Native version (x.native.tsx, through react-native-web): the same case, the same props. */
const meta = { title: "Native/Components/Scroll Area" } satisfies Meta
export default meta

export const Example: StoryObj = { render: () => <NativeFrame>{gallery.render(gallery.drawn)}</NativeFrame> }
