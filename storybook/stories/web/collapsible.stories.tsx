import type { Meta, StoryObj } from "@storybook/react-native-web-vite"

import gallery from "../../gallery/cases/collapsible"

/** The web version (shadcn on Base UI): the gallery's case, src/gallery/cases/collapsible.tsx. */
const meta = { title: "Web/Components/Collapsible" } satisfies Meta
export default meta

export const Example: StoryObj = { render: () => <>{gallery.render(gallery.platform)}</> }
