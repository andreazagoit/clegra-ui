import type { Meta, StoryObj } from "@storybook/react-native-web-vite"

import gallery from "../../gallery/cases/aspect-ratio"

/** The web version (shadcn on Base UI): the gallery's case, src/gallery/cases/aspect-ratio.tsx. */
const meta = { title: "Web/Components/Aspect Ratio" } satisfies Meta
export default meta

export const Example: StoryObj = { render: () => <>{gallery.render(gallery.platform)}</> }
