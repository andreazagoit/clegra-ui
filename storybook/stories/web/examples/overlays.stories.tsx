import type { Meta, StoryObj } from "@storybook/react-native-web-vite"

import { Button } from "@clegra/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@clegra/ui/components/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@clegra/ui/components/dropdown-menu"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@clegra/ui/components/sheet"
import { Tooltip, TooltipContent, TooltipTrigger } from "@clegra/ui/components/tooltip"

const meta = { title: "Web/Examples/Overlays" } satisfies Meta
export default meta

export const Dialog_: StoryObj = {
  render: () => (
    <Dialog>
      <DialogTrigger render={<Button />}>New customer</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New customer</DialogTitle>
          <DialogDescription>It's created in the ERP.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
}

export const Menu: StoryObj = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="outline" />}>Actions</DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>Duplicate</DropdownMenuItem>
        <DropdownMenuItem>Download PDF</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
}

export const Panel: StoryObj = {
  render: () => (
    <Sheet>
      <SheetTrigger render={<Button variant="outline" />}>Open panel</SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Assistant</SheetTitle>
          <SheetDescription>The side panel, like on phones.</SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  ),
}

export const Tooltip_: StoryObj = {
  render: () => (
    <Tooltip>
      <TooltipTrigger render={<Button variant="ghost" />}>Hover over here</TooltipTrigger>
      <TooltipContent>Assistant (⌘J)</TooltipContent>
    </Tooltip>
  ),
}
