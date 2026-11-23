import type { Meta, StoryObj } from "@storybook/react-native-web-vite"

import { IntroductionPage } from "../../apps/guide-pages"

/** Apps: design for applications built on Clegra. Start here. */
const meta = { title: "Apps/Introduction" } satisfies Meta
export default meta

export const Introduction: StoryObj = { render: () => <IntroductionPage /> }
