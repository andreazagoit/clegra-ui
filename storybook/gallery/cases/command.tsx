import * as command from "@clegra/ui/components/command"
import * as commandDrawn from "@clegra/ui/drawn/components/command"

import { defineCase } from "../case"

export default defineCase("command", [command], [commandDrawn], ({ Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem, CommandSeparator, CommandShortcut, Span, icons }) => (
  <Command className="max-w-sm rounded-3xl border">
    <CommandInput placeholder="Search for a command…" />
    <CommandList>
      <CommandEmpty>No results.</CommandEmpty>
      <CommandGroup heading="Suggestions">
        <CommandItem>
          <icons.FileText />
          <Span>New quote</Span>
        </CommandItem>
        <CommandItem>
          <icons.Building />
          <Span>Customers</Span>
        </CommandItem>
      </CommandGroup>
      <CommandSeparator />
      <CommandGroup heading="Settings">
        <CommandItem>
          <Span>Profile</Span>
          <CommandShortcut>⌘P</CommandShortcut>
        </CommandItem>
      </CommandGroup>
    </CommandList>
  </Command>
))
