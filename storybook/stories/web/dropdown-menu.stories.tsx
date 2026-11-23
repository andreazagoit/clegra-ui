import type { Meta, StoryObj } from "@storybook/react-native-web-vite"

import gallery from "../../gallery/cases/dropdown-menu"

/** The web version (shadcn on Base UI): the gallery's case, src/gallery/cases/dropdown-menu.tsx. */
const meta = { title: "Web/Components/Dropdown Menu" } satisfies Meta
export default meta

export const Example: StoryObj = { render: () => <>{gallery.render(gallery.platform)}</> }
