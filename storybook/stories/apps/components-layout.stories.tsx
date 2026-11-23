import type { Meta, StoryObj } from "@storybook/react-native-web-vite"

import { ComponentPage } from "../../apps/component-page"

/** Apps › Components › Layout: components an application's own view may use (apps/components.ts). */
const meta = { title: "Apps/Components/Layout" } satisfies Meta
export default meta

export const Separator: StoryObj = { name: "Separator", render: () => <ComponentPage name="separator" /> }
export const Scrollarea: StoryObj = { name: "Scroll area", render: () => <ComponentPage name="scroll-area" /> }
export const Aspectratio: StoryObj = { name: "Aspect ratio", render: () => <ComponentPage name="aspect-ratio" /> }
export const Breadcrumb: StoryObj = { name: "Breadcrumb", render: () => <ComponentPage name="breadcrumb" /> }
