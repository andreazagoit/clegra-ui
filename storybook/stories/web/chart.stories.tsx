import type { Meta, StoryObj } from "@storybook/react-native-web-vite"

import gallery from "../../gallery/cases/chart"

/** The web version (shadcn on Base UI): the gallery's case, src/gallery/cases/chart.tsx. */
const meta = { title: "Web/Components/Chart" } satisfies Meta
export default meta

export const Example: StoryObj = { render: () => <>{gallery.render(gallery.platform)}</> }
