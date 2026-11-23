import type { Meta, StoryObj } from "@storybook/react-native-web-vite"
import { BellIcon, FileTextIcon, LogOutIcon, ReceiptIcon, SettingsIcon, UsersIcon, WalletIcon } from "lucide-react"

import { Button } from "@clegra/ui/components/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@clegra/ui/components/card"
import { type NavSection, ShellPage, SiteShell } from "@clegra/ui/shell"

/**
 * AN APP'S OWN WEBSITE (`SiteShell`, @clegra/ui/shell): the inner bar of
 * Clegra's apps as the site's left sidebar, flush to the page's edges (no
 * panel, no glass), with the app's tile and name, its sections, its settings
 * at the bottom and the signed-in person under them. Under 768 a slim top bar
 * (☰ and the name) opens the same sidebar as a drawer. An invoicing app is the
 * example; the data is test data.
 */
const meta = {
  title: "Clegra/Shell/Site shell",
  parameters: { layout: "fullscreen" },
} satisfies Meta
export default meta

const sections: NavSection[] = [
  {
    id: "main",
    items: [
      { id: "invoices", label: "Invoices", href: "#invoices", icon: ReceiptIcon, active: true, badge: 3 },
      { id: "payments", label: "Payments", href: "#payments", icon: WalletIcon },
      { id: "reminders", label: "Reminders", href: "#reminders", icon: BellIcon, shortcut: "⌥3" },
    ],
  },
  {
    id: "records",
    label: "Records",
    items: [
      { id: "customers", label: "Customers", href: "#customers", icon: UsersIcon },
      { id: "templates", label: "Templates", href: "#templates", icon: FileTextIcon },
    ],
  },
]

function Site() {
  return (
    // Out of the preview's padding: the site is the whole window.
    <div className="fixed inset-0">
      <SiteShell
        accent="green"
        brand={{ name: "Invoices", icon: ReceiptIcon, href: "#home" }}
        label="Invoices sections"
        sections={sections}
        footer={[{ id: "settings", label: "Settings", href: "#settings", icon: SettingsIcon }]}
        footerExtra={
          <div className="flex items-center gap-2 px-2.5 pt-2 text-[0.8125rem]">
            <span className="min-w-0 flex-1 truncate text-muted-foreground">ada@example.test</span>
            <Button size="icon-sm" variant="ghost" aria-label="Sign out" title="Sign out">
              <LogOutIcon />
            </Button>
          </div>
        }
        menuLabel="Open menu"
        closeLabel="Close"
      >
        <div className="px-(--shell-gutter) py-8">
          <ShellPage title="Invoices" description="Every invoice issued this year, newest first." actions={<Button>New invoice</Button>}>
            <div className="grid gap-4 @[680px]:grid-cols-2">
              {["2026-041", "2026-040", "2026-039", "2026-038"].map((n) => (
                <Card key={n}>
                  <CardHeader>
                    <CardTitle>Invoice {n}</CardTitle>
                    <CardDescription>Example Shop Ltd · 120,00 €</CardDescription>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">Sent, not yet paid.</CardContent>
                </Card>
              ))}
            </div>
          </ShellPage>
        </div>
      </SiteShell>
    </div>
  )
}

/** Light: the sidebar on `bg-sidebar`, a hairline on its right, the open section in the app's accent. */
export const Light: StoryObj = {
  globals: { theme: "light" },
  render: () => <Site />,
}

/** Dark (the `.dark` class). */
export const Dark: StoryObj = {
  globals: { theme: "dark" },
  render: () => <Site />,
}

/** A phone's width: the slim top bar; ☰ opens the sidebar as a drawer (a pick, Esc or a click outside closes it). */
export const Phone: StoryObj = {
  globals: { theme: "light", viewport: { value: "mobile2", isRotated: false } },
  render: () => <Site />,
}

/** A phone's width, dark. */
export const PhoneDark: StoryObj = {
  globals: { theme: "dark", viewport: { value: "mobile2", isRotated: false } },
  render: () => <Site />,
}
