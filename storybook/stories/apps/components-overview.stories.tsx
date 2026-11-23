import type { Meta, StoryObj } from "@storybook/react-native-web-vite"

import { ComponentsOverviewPage } from "../../apps/component-page"

/** Apps › Components: what a view may use, and what is reserved for Clegra. */
const meta = { title: "Apps/Components/Overview" } satisfies Meta
export default meta

export const Overview: StoryObj = { render: () => <ComponentsOverviewPage /> }
