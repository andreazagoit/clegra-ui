import type { Meta, StoryObj } from "@storybook/react-native-web-vite"

import { ComponentPage } from "../../apps/component-page"

/** Apps › Components › Overlays: components an application's own view may use (apps/components.ts). */
const meta = { title: "Apps/Components/Overlays" } satisfies Meta
export default meta

export const Dialog: StoryObj = { name: "Dialog", render: () => <ComponentPage name="dialog" /> }
export const Alertdialog: StoryObj = { name: "Alert dialog", render: () => <ComponentPage name="alert-dialog" /> }
export const Sheet: StoryObj = { name: "Sheet", render: () => <ComponentPage name="sheet" /> }
export const Drawer: StoryObj = { name: "Drawer", render: () => <ComponentPage name="drawer" /> }
export const Popover: StoryObj = { name: "Popover", render: () => <ComponentPage name="popover" /> }
export const Hovercard: StoryObj = { name: "Hover card", render: () => <ComponentPage name="hover-card" /> }
export const Tooltip: StoryObj = { name: "Tooltip", render: () => <ComponentPage name="tooltip" /> }
export const Command: StoryObj = { name: "Command", render: () => <ComponentPage name="command" /> }
