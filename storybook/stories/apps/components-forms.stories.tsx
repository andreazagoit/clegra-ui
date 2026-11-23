import type { Meta, StoryObj } from "@storybook/react-native-web-vite"

import { ComponentPage } from "../../apps/component-page"

/** Apps › Components › Forms: components an application's own view may use (apps/components.ts). */
const meta = { title: "Apps/Components/Forms" } satisfies Meta
export default meta

export const Field: StoryObj = { name: "Field", render: () => <ComponentPage name="field" /> }
export const Input: StoryObj = { name: "Input", render: () => <ComponentPage name="input" /> }
export const Textarea: StoryObj = { name: "Textarea", render: () => <ComponentPage name="textarea" /> }
export const Inputgroup: StoryObj = { name: "Input group", render: () => <ComponentPage name="input-group" /> }
export const InputOTP: StoryObj = { name: "Input OTP", render: () => <ComponentPage name="input-otp" /> }
export const Select: StoryObj = { name: "Select", render: () => <ComponentPage name="select" /> }
export const Nativeselect: StoryObj = { name: "Native select", render: () => <ComponentPage name="native-select" /> }
export const Combobox: StoryObj = { name: "Combobox", render: () => <ComponentPage name="combobox" /> }
export const Checkbox: StoryObj = { name: "Checkbox", render: () => <ComponentPage name="checkbox" /> }
export const Radiogroup: StoryObj = { name: "Radio group", render: () => <ComponentPage name="radio-group" /> }
export const Switch: StoryObj = { name: "Switch", render: () => <ComponentPage name="switch" /> }
export const Slider: StoryObj = { name: "Slider", render: () => <ComponentPage name="slider" /> }
export const Calendar: StoryObj = { name: "Calendar", render: () => <ComponentPage name="calendar" /> }
export const Label: StoryObj = { name: "Label", render: () => <ComponentPage name="label" /> }
