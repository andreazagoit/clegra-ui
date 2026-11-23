import type { Meta, StoryObj } from "@storybook/react-native-web-vite"

import { TimelinePage } from "../../apps/catalogue-pages"

/** The catalogue's «timeline» (contract v1: CATALOGUE_COMPONENTS): roles, surfaces, web and native. */
const meta = { title: "Apps/Catalogue/Timeline" } satisfies Meta
export default meta

export const Reference: StoryObj = { render: () => <TimelinePage /> }
