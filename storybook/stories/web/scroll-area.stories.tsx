import type { Meta, StoryObj } from "@storybook/react-native-web-vite"

import gallery from "../../gallery/cases/scroll-area"

/** The web version (shadcn on Base UI): the gallery's case, src/gallery/cases/scroll-area.tsx. */
const meta = { title: "Web/Components/Scroll Area" } satisfies Meta
export default meta

export const Example: StoryObj = { render: () => <>{gallery.render(gallery.platform)}</> }
