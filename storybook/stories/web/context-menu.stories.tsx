import type { Meta, StoryObj } from "@storybook/react-native-web-vite"

import gallery from "../../gallery/cases/context-menu"

/** The web version (shadcn on Base UI): the gallery's case, src/gallery/cases/context-menu.tsx. */
const meta = { title: "Web/Components/Context Menu" } satisfies Meta
export default meta

export const Example: StoryObj = { render: () => <>{gallery.render(gallery.platform)}</> }
