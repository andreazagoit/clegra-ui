import type { Meta, StoryObj } from "@storybook/react-native-web-vite"

import gallery from "../../gallery/cases/checkbox-primitive"

/** The web version (shadcn on Base UI): the gallery's case, src/gallery/cases/checkbox-primitive.tsx. */
const meta = { title: "Web/Components/Checkbox (primitive)" } satisfies Meta
export default meta

export const Example: StoryObj = { render: () => <>{gallery.render(gallery.platform)}</> }
