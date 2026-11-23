import type { Meta, StoryObj } from "@storybook/react-native-web-vite"

import { ComponentGallery } from "../../gallery/gallery"

/** Every component in both versions, side by side: left the web's, right React Native's (drawn, through react-native-web). */
const meta = { title: "Web vs Native", parameters: { layout: "fullscreen" } } satisfies Meta
export default meta

export const SideBySide: StoryObj = { name: "Side by side", render: () => <ComponentGallery /> }
