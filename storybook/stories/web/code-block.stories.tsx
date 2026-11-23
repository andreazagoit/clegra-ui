import type { Meta, StoryObj } from "@storybook/react-native-web-vite"

import gallery from "../../gallery/cases/code-block"

/** The web version (shadcn on Base UI): the gallery's case, src/gallery/cases/code-block.tsx. */
const meta = { title: "Web/Components/Code Block" } satisfies Meta
export default meta

export const Example: StoryObj = { render: () => <>{gallery.render(gallery.platform)}</> }
