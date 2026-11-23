import * as empty from "@clegra/ui/components/empty"
import * as emptyDrawn from "@clegra/ui/drawn/components/empty"

import { defineCase } from "../case"

export default defineCase("empty", [empty], [emptyDrawn], ({ Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, icons }) => (
  <Empty className="border">
    <EmptyHeader>
      <EmptyMedia variant="icon">
        <icons.Inbox />
      </EmptyMedia>
      <EmptyTitle>No jobs</EmptyTitle>
      <EmptyDescription>Requests come in from your mail.</EmptyDescription>
    </EmptyHeader>
  </Empty>
))
