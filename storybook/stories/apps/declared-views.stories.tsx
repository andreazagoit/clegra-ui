import type { Meta, StoryObj } from "@storybook/react-native-web-vite"

import { CardsViewPage, ChartViewPage, DetailViewPage, FormViewPage, FrameViewPage, NumberViewPage, TableViewPage, ViewsOverviewPage, ViewStatesPage } from "../../apps/view-pages"

/** The page views an application declares (contract v1's `View` union) and how Clegra draws each on web, Mac, iPad and iPhone. */
const meta = { title: "Apps/Declared views" } satisfies Meta
export default meta

export const Overview: StoryObj = { render: () => <ViewsOverviewPage /> }
export const Table: StoryObj = { render: () => <TableViewPage /> }
export const Cards: StoryObj = { render: () => <CardsViewPage /> }
export const Detail: StoryObj = { render: () => <DetailViewPage /> }
export const Form: StoryObj = { render: () => <FormViewPage /> }
export const Chart: StoryObj = { render: () => <ChartViewPage /> }
export const Number: StoryObj = { name: "Number", render: () => <NumberViewPage /> }
export const Frame: StoryObj = { render: () => <FrameViewPage /> }
export const States: StoryObj = { render: () => <ViewStatesPage /> }
