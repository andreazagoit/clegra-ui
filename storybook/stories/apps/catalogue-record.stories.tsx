import type { Meta, StoryObj } from "@storybook/react-native-web-vite"

import { RecordPage } from "../../apps/catalogue-pages"

/** The catalogue's «record» (contract v1: CATALOGUE_COMPONENTS): roles, surfaces, web and native. */
const meta = { title: "Apps/Catalogue/Record" } satisfies Meta
export default meta

export const Reference: StoryObj = { render: () => <RecordPage /> }
