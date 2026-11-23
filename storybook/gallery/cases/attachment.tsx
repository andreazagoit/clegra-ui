import { useState } from "react"

import * as attachment from "@clegra/ui/components/attachment"
import * as spinner from "@clegra/ui/components/spinner"
import * as attachmentDrawn from "@clegra/ui/drawn/components/attachment"
import * as spinnerDrawn from "@clegra/ui/drawn/components/spinner"

import { defineCase, type Kit } from "../case"

function Files({ kit: { Attachment, AttachmentGroup, AttachmentMedia, AttachmentContent, AttachmentTitle, AttachmentDescription, AttachmentActions, AttachmentAction, AttachmentTrigger, Spinner, Div, icons } }: { kit: Kit }) {
  const [opened, setOpened] = useState(false)
  const [added, setAdded] = useState(false)
  return (
    <Div className="flex max-w-md flex-col gap-3">
      <AttachmentGroup>
        <Attachment>
          <AttachmentMedia>
            <icons.FileText />
          </AttachmentMedia>
          <AttachmentContent>
            <AttachmentTitle>quote-2026-114.pdf</AttachmentTitle>
            <AttachmentDescription>{opened ? "Opened" : "PDF, 182 KB"}</AttachmentDescription>
          </AttachmentContent>
          <AttachmentTrigger aria-label="Open quote" onClick={() => setOpened(true)} />
        </Attachment>
        <Attachment state="uploading">
          <AttachmentMedia>
            <Spinner />
          </AttachmentMedia>
          <AttachmentContent>
            <AttachmentTitle>order-acme.xlsx</AttachmentTitle>
            <AttachmentDescription>Uploading 40%</AttachmentDescription>
          </AttachmentContent>
        </Attachment>
      </AttachmentGroup>
      <Attachment state="error" size="sm">
        <AttachmentMedia>
          <icons.FileText />
        </AttachmentMedia>
        <AttachmentContent>
          <AttachmentTitle>site-photo.heic</AttachmentTitle>
          <AttachmentDescription>Unsupported format</AttachmentDescription>
        </AttachmentContent>
      </Attachment>
      <Attachment state={added ? "done" : "idle"}>
        <AttachmentContent>
          <AttachmentTitle>{added ? "1 file added" : "Add a file"}</AttachmentTitle>
        </AttachmentContent>
        <AttachmentActions>
          <AttachmentAction aria-label="Add" onClick={() => setAdded(true)}>
            <icons.Plus />
          </AttachmentAction>
        </AttachmentActions>
      </Attachment>
      <Attachment orientation="vertical">
        <AttachmentMedia>
          <icons.FileText />
        </AttachmentMedia>
        <AttachmentContent>
          <AttachmentTitle>price-list.csv</AttachmentTitle>
          <AttachmentDescription>12 KB</AttachmentDescription>
        </AttachmentContent>
      </Attachment>
    </Div>
  )
}

export default defineCase("attachment", [attachment, spinner], [attachmentDrawn, spinnerDrawn], (kit) => <Files kit={kit} />)
