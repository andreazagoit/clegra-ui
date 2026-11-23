import type { Meta, StoryObj } from "@storybook/react-native-web-vite"

import gallery from "../../gallery/cases/native-select"

/** The web version (shadcn on Base UI): the gallery's case, src/gallery/cases/native-select.tsx. */
const meta = { title: "Web/Components/Native Select" } satisfies Meta
export default meta

export const Example: StoryObj = { render: () => <>{gallery.render(gallery.platform)}</> }
