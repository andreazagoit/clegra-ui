import type { Meta, StoryObj } from "@storybook/react-native-web-vite"

import gallery from "../../gallery/cases/radio-group"

/** The web version (shadcn on Base UI): the gallery's case, src/gallery/cases/radio-group.tsx. */
const meta = { title: "Web/Components/Radio Group" } satisfies Meta
export default meta

export const Example: StoryObj = { render: () => <>{gallery.render(gallery.platform)}</> }
