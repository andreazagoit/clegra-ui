import type { Meta, StoryObj } from "@storybook/react-native-web-vite"

import gallery from "../../gallery/cases/input-otp"

/** The web version (shadcn on Base UI): the gallery's case, src/gallery/cases/input-otp.tsx. */
const meta = { title: "Web/Components/Input OTP" } satisfies Meta
export default meta

export const Example: StoryObj = { render: () => <>{gallery.render(gallery.platform)}</> }
