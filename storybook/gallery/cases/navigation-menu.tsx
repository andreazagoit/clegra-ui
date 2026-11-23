import * as navigation_menu from "@clegra/ui/components/navigation-menu"
import * as navigation_menuDrawn from "@clegra/ui/drawn/components/navigation-menu"

import { defineCase } from "../case"

export default defineCase("navigation-menu", [navigation_menu], [navigation_menuDrawn], ({ NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuTrigger, NavigationMenuContent, NavigationMenuLink, navigationMenuTriggerStyle, Div, Span }) => (
  <NavigationMenu>
    <NavigationMenuList>
      <NavigationMenuItem value="customers">
        <NavigationMenuTrigger>Customers</NavigationMenuTrigger>
        <NavigationMenuContent className="w-64">
          <NavigationMenuLink href="#customer-list">
            <Div className="flex flex-col gap-1">
              <Span className="font-medium">Customer list</Span>
              <Span className="text-muted-foreground">All customer records.</Span>
            </Div>
          </NavigationMenuLink>
          <NavigationMenuLink href="#new-customer">
            <Div className="flex flex-col gap-1">
              <Span className="font-medium">New customer</Span>
              <Span className="text-muted-foreground">From a VAT number.</Span>
            </Div>
          </NavigationMenuLink>
        </NavigationMenuContent>
      </NavigationMenuItem>
      <NavigationMenuItem value="documents">
        <NavigationMenuLink href="#documents" className={navigationMenuTriggerStyle()}>
          Documents
        </NavigationMenuLink>
      </NavigationMenuItem>
    </NavigationMenuList>
  </NavigationMenu>
))
