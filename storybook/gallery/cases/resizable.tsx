import * as resizable from "@clegra/ui/components/resizable"
import * as resizableDrawn from "@clegra/ui/drawn/components/resizable"

import { defineCase } from "../case"

export default defineCase("resizable", [resizable], [resizableDrawn], ({ ResizablePanelGroup, ResizablePanel, ResizableHandle, Div, Span }) => (
  <ResizablePanelGroup orientation="horizontal" className="max-w-md rounded-2xl border">
    <ResizablePanel defaultSize="40">
      <Div className="flex h-[120px] items-center justify-center p-6">
        <Span className="text-sm font-medium">List</Span>
      </Div>
    </ResizablePanel>
    <ResizableHandle withHandle />
    <ResizablePanel defaultSize="60">
      <Div className="flex h-[120px] items-center justify-center p-6">
        <Span className="text-sm font-medium">Details</Span>
      </Div>
    </ResizablePanel>
  </ResizablePanelGroup>
))
