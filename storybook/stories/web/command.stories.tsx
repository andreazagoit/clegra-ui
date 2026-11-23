import type { Meta, StoryObj } from "@storybook/react-native-web-vite"

import gallery from "../../gallery/cases/command"

/** The web version (shadcn on Base UI): the gallery's case, src/gallery/cases/command.tsx. */
const meta = { title: "Web/Components/Command" } satisfies Meta
export default meta

export const Example: StoryObj = { render: () => <>{gallery.render(gallery.platform)}</> }
