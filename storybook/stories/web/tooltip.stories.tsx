import type { Meta, StoryObj } from "@storybook/react-native-web-vite"

import gallery from "../../gallery/cases/tooltip"

/** The web version (shadcn on Base UI): the gallery's case, src/gallery/cases/tooltip.tsx. */
const meta = { title: "Web/Components/Tooltip" } satisfies Meta
export default meta

export const Example: StoryObj = { render: () => <>{gallery.render(gallery.platform)}</> }
