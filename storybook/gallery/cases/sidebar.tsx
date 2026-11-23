import * as sidebar from "@clegra/ui/components/sidebar"
import * as sidebarDrawn from "@clegra/ui/drawn/components/sidebar"

import { defineCase } from "../case"

export default defineCase("sidebar", [sidebar], [sidebarDrawn], ({ SidebarProvider, Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuItem, SidebarMenuButton, Div, Span, icons }) => (
  <Div className="h-56 overflow-hidden rounded-lg border">
    <SidebarProvider className="min-h-0 h-full">
      <Sidebar collapsible="none">
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Sales</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton isActive>
                  <icons.Building />
                  <Span>Customers</Span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <icons.FileText />
                  <Span>Quotes</Span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </SidebarProvider>
  </Div>
))
