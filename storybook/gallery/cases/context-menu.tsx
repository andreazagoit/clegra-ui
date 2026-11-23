import * as contextMenu from "@clegra/ui/components/context-menu"
import * as contextMenuDrawn from "@clegra/ui/drawn/components/context-menu"

import { defineCase } from "../case"

export default defineCase("context-menu", [contextMenu], [contextMenuDrawn], ({ ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuShortcut }) => (
  <ContextMenu>
    <ContextMenuTrigger className="flex h-24 w-full items-center justify-center rounded-3xl border border-dashed text-sm">Right-click (or press and hold) here</ContextMenuTrigger>
    <ContextMenuContent>
      <ContextMenuItem>
        Copy row<ContextMenuShortcut>⌘C</ContextMenuShortcut>
      </ContextMenuItem>
      <ContextMenuItem>Open record</ContextMenuItem>
      <ContextMenuSeparator />
      <ContextMenuItem variant="destructive">Delete row</ContextMenuItem>
    </ContextMenuContent>
  </ContextMenu>
))
