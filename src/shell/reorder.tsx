"use client"

import { closestCenter, DndContext, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core"
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { cn } from "cn"

import { SidebarMenuItem } from "../components/sidebar"
import type { RailReorder } from "./types"

/**
 * `@clegra/ui/shell/reorder`: dragging a rail group's items into the person's
 * order (`ShellRail reorder={railReorder}`, the group's `onOrder`). Its own
 * entry because it is the shell's only use of @dnd-kit (optional peers of
 * `clegra`): an app that never reorders installs and bundles none of it.
 */
function Group({ ids, onOrder, hint, children }: { ids: string[]; onOrder: (ids: string[]) => void; hint?: string; children: React.ReactNode }) {
  // The pointer must move first, so a click still opens the item.
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))
  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return
    onOrder(arrayMove(ids, ids.indexOf(String(active.id)), ids.indexOf(String(over.id))))
  }
  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd} accessibility={hint ? { screenReaderInstructions: { draggable: hint } } : undefined}>
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        {children}
      </SortableContext>
    </DndContext>
  )
}

function Item({ id, className, children }: { id: string; className?: string; children: React.ReactNode }) {
  const { setNodeRef, listeners, transform, transition, isDragging } = useSortable({ id })
  return (
    <SidebarMenuItem ref={setNodeRef} style={{ transform: CSS.Translate.toString(transform), transition }} className={cn(isDragging && "z-10 opacity-80", className)} {...listeners}>
      {children}
    </SidebarMenuItem>
  )
}

/** Pass to `ShellRail`'s `reorder`. */
export const railReorder: RailReorder = { Group, Item }
