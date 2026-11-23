import type { Meta, StoryObj } from "@storybook/react-native-web-vite"
import { InboxIcon } from "lucide-react"

import { Avatar, AvatarFallback } from "@clegra/ui/components/avatar"
import { Button } from "@clegra/ui/components/button"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@clegra/ui/components/empty"
import { Skeleton } from "@clegra/ui/components/skeleton"
import { Spinner } from "@clegra/ui/components/spinner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@clegra/ui/components/tabs"

const meta = { title: "Web/Examples/States" } satisfies Meta
export default meta

export const Empty_: StoryObj = {
  render: () => (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <InboxIcon />
        </EmptyMedia>
        <EmptyTitle>No mailboxes</EmptyTitle>
        <EmptyDescription>Connect a mailbox to see your mail here.</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button>Connect a mailbox</Button>
      </EmptyContent>
    </Empty>
  ),
}

export const Loading: StoryObj = {
  render: () => (
    <div className="flex max-w-md flex-col gap-3">
      <Spinner />
      <Skeleton className="h-6 w-1/2" />
      <Skeleton className="h-24 w-full" />
    </div>
  ),
}

export const Tabs_: StoryObj = {
  render: () => (
    <Tabs defaultValue="board">
      <TabsList>
        <TabsTrigger value="board">Board</TabsTrigger>
        <TabsTrigger value="table">Table</TabsTrigger>
      </TabsList>
      <TabsContent value="board" className="pt-3 text-sm">Jobs by column.</TabsContent>
      <TabsContent value="table" className="pt-3 text-sm">Jobs in a table.</TabsContent>
    </Tabs>
  ),
}

export const Avatar_: StoryObj = {
  name: "Avatar",
  render: () => (
    <Avatar>
      <AvatarFallback>AZ</AvatarFallback>
    </Avatar>
  ),
}
