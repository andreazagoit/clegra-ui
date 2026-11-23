import type { Meta, StoryObj } from "@storybook/react-native-web-vite"

import { ListPage } from "../../apps/catalogue-pages"

/** The catalogue's «list» (contract v1: CATALOGUE_COMPONENTS): roles, surfaces, web and native. */
const meta = { title: "Apps/Catalogue/List" } satisfies Meta
export default meta

export const Reference: StoryObj = { render: () => <ListPage /> }
