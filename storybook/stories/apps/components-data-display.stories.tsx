import type { Meta, StoryObj } from "@storybook/react-native-web-vite"

import { ComponentPage } from "../../apps/component-page"

/** Apps › Components › Data display: components an application's own view may use (apps/components.ts). */
const meta = { title: "Apps/Components/Data display" } satisfies Meta
export default meta

export const Card: StoryObj = { name: "Card", render: () => <ComponentPage name="card" /> }
export const Item: StoryObj = { name: "Item", render: () => <ComponentPage name="item" /> }
export const Table: StoryObj = { name: "Table", render: () => <ComponentPage name="table" /> }
export const Badge: StoryObj = { name: "Badge", render: () => <ComponentPage name="badge" /> }
export const Avatar: StoryObj = { name: "Avatar", render: () => <ComponentPage name="avatar" /> }
export const Chart: StoryObj = { name: "Chart", render: () => <ComponentPage name="chart" /> }
export const Progress: StoryObj = { name: "Progress", render: () => <ComponentPage name="progress" /> }
export const Accordion: StoryObj = { name: "Accordion", render: () => <ComponentPage name="accordion" /> }
export const Collapsible: StoryObj = { name: "Collapsible", render: () => <ComponentPage name="collapsible" /> }
export const Tabs: StoryObj = { name: "Tabs", render: () => <ComponentPage name="tabs" /> }
export const Pagination: StoryObj = { name: "Pagination", render: () => <ComponentPage name="pagination" /> }
export const Carousel: StoryObj = { name: "Carousel", render: () => <ComponentPage name="carousel" /> }
export const Kbd: StoryObj = { name: "Kbd", render: () => <ComponentPage name="kbd" /> }
