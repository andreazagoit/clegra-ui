import type { Meta, StoryObj } from "@storybook/react-native-web-vite"

import gallery from "../../gallery/cases/accordion"

/** The web version (shadcn on Base UI): the gallery's case, src/gallery/cases/accordion.tsx. */
const meta = { title: "Web/Components/Accordion" } satisfies Meta
export default meta

export const Example: StoryObj = { render: () => <>{gallery.render(gallery.platform)}</> }
