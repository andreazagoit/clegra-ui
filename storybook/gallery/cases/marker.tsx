import * as marker from "@clegra/ui/components/marker"
import * as markerDrawn from "@clegra/ui/drawn/components/marker"

import { defineCase } from "../case"

export default defineCase("marker", [marker], [markerDrawn], ({ Marker, MarkerIcon, MarkerContent, Div, icons }) => (
  <Div className="flex max-w-md flex-col gap-4">
    <Marker>
      <MarkerIcon>
        <icons.Inbox />
      </MarkerIcon>
      <MarkerContent>Request received by email</MarkerContent>
    </Marker>
    <Marker variant="separator">
      <MarkerContent>Today</MarkerContent>
    </Marker>
    <Marker variant="border">
      <MarkerContent>Conversation archived</MarkerContent>
    </Marker>
  </Div>
))
