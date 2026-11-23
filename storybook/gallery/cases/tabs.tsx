import * as tabs from "@clegra/ui/components/tabs"
import * as tabsDrawn from "@clegra/ui/drawn/components/tabs"

import { defineCase } from "../case"

export default defineCase("tabs", [tabs], [tabsDrawn], ({ Tabs, TabsList, TabsTrigger, TabsContent, Span }) => (
  <Tabs defaultValue="light">
    <TabsList aria-label="Theme">
      <TabsTrigger value="light">Light</TabsTrigger>
      <TabsTrigger value="dark">Dark</TabsTrigger>
      <TabsTrigger value="system">System</TabsTrigger>
    </TabsList>
    <TabsContent value="light">
      <Span className="text-sm text-muted-foreground">The light theme.</Span>
    </TabsContent>
    <TabsContent value="dark">
      <Span className="text-sm text-muted-foreground">The dark theme.</Span>
    </TabsContent>
    <TabsContent value="system">
      <Span className="text-sm text-muted-foreground">Same as the system.</Span>
    </TabsContent>
  </Tabs>
))
