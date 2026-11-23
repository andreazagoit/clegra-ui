import type { Meta, StoryObj } from "@storybook/react-native-web-vite"

import gallery from "../../gallery/cases/slider"

/** The web version (shadcn on Base UI): the gallery's case, src/gallery/cases/slider.tsx. */
const meta = { title: "Web/Components/Slider" } satisfies Meta
export default meta

export const Example: StoryObj = { render: () => <>{gallery.render(gallery.platform)}</> }
