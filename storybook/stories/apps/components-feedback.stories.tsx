import type { Meta, StoryObj } from "@storybook/react-native-web-vite"

import { ComponentPage } from "../../apps/component-page"

/** Apps › Components › Feedback: components an application's own view may use (apps/components.ts). */
const meta = { title: "Apps/Components/Feedback" } satisfies Meta
export default meta

export const Empty: StoryObj = { name: "Empty", render: () => <ComponentPage name="empty" /> }
export const Skeleton: StoryObj = { name: "Skeleton", render: () => <ComponentPage name="skeleton" /> }
export const Spinner: StoryObj = { name: "Spinner", render: () => <ComponentPage name="spinner" /> }
export const Alert: StoryObj = { name: "Alert", render: () => <ComponentPage name="alert" /> }
