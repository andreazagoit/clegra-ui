import type { Meta, StoryObj } from "@storybook/react-native-web-vite"

import gallery from "../../gallery/cases/hover-card"

/** The web version (shadcn on Base UI): the gallery's case, src/gallery/cases/hover-card.tsx. */
const meta = { title: "Web/Components/Hover Card" } satisfies Meta
export default meta

export const Example: StoryObj = { render: () => <>{gallery.render(gallery.platform)}</> }
