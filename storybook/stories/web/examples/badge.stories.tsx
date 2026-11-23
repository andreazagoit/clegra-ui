import type { Meta, StoryObj } from "@storybook/react-native-web-vite"

import { Badge } from "@clegra/ui/components/badge"

const meta = { title: "Web/Examples/Badge", component: Badge, args: { children: "Draft" } } satisfies Meta<typeof Badge>
export default meta

export const Default: StoryObj<typeof meta> = {}

export const Variants: StoryObj<typeof meta> = {
  render: () => (
    <div className="flex gap-2">
      <Badge>In progress</Badge>
      <Badge variant="secondary">Queued</Badge>
      <Badge variant="outline">Completed</Badge>
      <Badge variant="destructive">Failed</Badge>
    </div>
  ),
}
