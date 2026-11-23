import type { Meta, StoryObj } from "@storybook/react-native-web-vite"

import gallery from "../../gallery/cases/input-group"

/** The web version (shadcn on Base UI): the gallery's case, src/gallery/cases/input-group.tsx. */
const meta = { title: "Web/Components/Input Group" } satisfies Meta
export default meta

export const Example: StoryObj = { render: () => <>{gallery.render(gallery.platform)}</> }
