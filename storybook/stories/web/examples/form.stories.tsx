import type { Meta, StoryObj } from "@storybook/react-native-web-vite"
import { SearchIcon } from "lucide-react"

import { Input } from "@clegra/ui/components/input"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@clegra/ui/components/input-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@clegra/ui/components/select"
import { Textarea } from "@clegra/ui/components/textarea"

const meta = { title: "Web/Examples/Fields" } satisfies Meta
export default meta

export const Text: StoryObj = {
  render: () => (
    <div className="flex max-w-sm flex-col gap-3">
      <Input placeholder="Company name" />
      <Input placeholder="Disabled" disabled />
      <InputGroup>
        <InputGroupAddon>
          <SearchIcon />
        </InputGroupAddon>
        <InputGroupInput placeholder="Search by company name…" />
      </InputGroup>
      <Textarea placeholder="Notes for the job" />
    </div>
  ),
}

export const Choice: StoryObj = {
  render: () => (
    <div className="max-w-sm">
      <Select defaultValue="draft">
        <SelectTrigger className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="draft">Draft</SelectItem>
          <SelectItem value="sent">Sent</SelectItem>
          <SelectItem value="accepted">Accepted</SelectItem>
        </SelectContent>
      </Select>
    </div>
  ),
}
