import type { Meta, StoryObj } from "@storybook/react-native-web-vite"

import { FormPage } from "../../apps/catalogue-pages"

/** The catalogue's «form» (contract v1: CATALOGUE_COMPONENTS): roles, surfaces, web and native. */
const meta = { title: "Apps/Catalogue/Form" } satisfies Meta
export default meta

export const Reference: StoryObj = { render: () => <FormPage /> }
