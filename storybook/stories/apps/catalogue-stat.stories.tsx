import type { Meta, StoryObj } from "@storybook/react-native-web-vite"

import { StatPage } from "../../apps/catalogue-pages"

/** The catalogue's «stat» (contract v1: CATALOGUE_COMPONENTS): roles, surfaces, web and native. */
const meta = { title: "Apps/Catalogue/Stat" } satisfies Meta
export default meta

export const Reference: StoryObj = { render: () => <StatPage /> }
