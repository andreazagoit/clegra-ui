import type { Meta, StoryObj } from "@storybook/react-native-web-vite"

import gallery from "../../gallery/cases/message-scroller"

/** The web version (shadcn on Base UI): the gallery's case, src/gallery/cases/message-scroller.tsx. */
const meta = { title: "Web/Components/Message Scroller" } satisfies Meta
export default meta

export const Example: StoryObj = { render: () => <>{gallery.render(gallery.platform)}</> }
