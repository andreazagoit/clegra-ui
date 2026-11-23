import type { Meta, StoryObj } from "@storybook/react-native-web-vite"

import gallery from "../../gallery/cases/field"

/** The web version (shadcn on Base UI): the gallery's case, src/gallery/cases/field.tsx. */
const meta = { title: "Web/Components/Field" } satisfies Meta
export default meta

export const Example: StoryObj = { render: () => <>{gallery.render(gallery.platform)}</> }
