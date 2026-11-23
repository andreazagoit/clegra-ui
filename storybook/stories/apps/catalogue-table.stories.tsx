import type { Meta, StoryObj } from "@storybook/react-native-web-vite"

import { TablePage } from "../../apps/catalogue-pages"

/** The catalogue's «table» (contract v1: CATALOGUE_COMPONENTS): roles, surfaces, web and native. */
const meta = { title: "Apps/Catalogue/Table" } satisfies Meta
export default meta

export const Reference: StoryObj = { render: () => <TablePage /> }
