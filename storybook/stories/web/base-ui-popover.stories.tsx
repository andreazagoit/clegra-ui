import type { Meta, StoryObj } from "@storybook/react-native-web-vite"

import gallery from "../../gallery/cases/base-ui-popover"

/** The web version (shadcn on Base UI): the gallery's case, src/gallery/cases/base-ui-popover.tsx. */
const meta = { title: "Web/Components/Popover (Base UI)" } satisfies Meta
export default meta

export const Example: StoryObj = { render: () => <>{gallery.render(gallery.platform)}</> }
