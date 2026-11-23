import type { Meta, StoryObj } from "@storybook/react-native-web-vite"

import { ComponentPage } from "../../apps/component-page"

/** Apps › Components › Actions: components an application's own view may use (apps/components.ts). */
const meta = { title: "Apps/Components/Actions" } satisfies Meta
export default meta

export const Button: StoryObj = { name: "Button", render: () => <ComponentPage name="button" /> }
export const Buttongroup: StoryObj = { name: "Button group", render: () => <ComponentPage name="button-group" /> }
export const Toggle: StoryObj = { name: "Toggle", render: () => <ComponentPage name="toggle" /> }
export const Togglegroup: StoryObj = { name: "Toggle group", render: () => <ComponentPage name="toggle-group" /> }
export const Dropdownmenu: StoryObj = { name: "Dropdown menu", render: () => <ComponentPage name="dropdown-menu" /> }
export const Contextmenu: StoryObj = { name: "Context menu", render: () => <ComponentPage name="context-menu" /> }
