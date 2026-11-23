import type { Meta, StoryObj } from "@storybook/react-native-web-vite"
import { type LucideIcon, ChevronsUpDownIcon, FileTextIcon, LayoutGridIcon, MailIcon, MessagesSquareIcon, PackageIcon, PlusIcon, SearchIcon, UsersIcon } from "lucide-react"

import { Avatar, AvatarFallback } from "@clegra/ui/components/avatar"
import { Badge } from "@clegra/ui/components/badge"
import { Button } from "@clegra/ui/components/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@clegra/ui/components/card"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@clegra/ui/components/input-group"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@clegra/ui/components/sidebar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@clegra/ui/components/table"

/**
 * The client's frame (client's shell, brand/theme.css): the
 * sidebar is the theme's near-white column (Notte superficie in dark), the
 * open item a neutral fill with its words and icon in Blu; the primary
 * buttons in Blu, the accent (Arancio) only for counts and the «sì». A company's
 * account and a personal one have the same colours; only what is in it differs.
 */
const meta = {
  title: "Web/Examples/App shell",
  parameters: { layout: "fullscreen" },
} satisfies Meta
export default meta

const chats = [
  { title: "Bruno Ferri", when: "5 nov, 18:10", unread: 5 },
  { title: "Pulizia preventivi in bozza", when: "5 nov, 18:02" },
  { title: "Ordini da evadere questa settimana", when: "4 nov, 18:02" },
  { title: "Carla Moretti", when: "4 nov, 12:02", unread: 1 },
]

function Shell({ personal }: { personal: boolean }) {
  const areas: { icon: LucideIcon; label: string; active?: boolean; count?: number }[] = personal
    ? [{ icon: MessagesSquareIcon, label: "Chat", active: true }, { icon: LayoutGridIcon, label: "Applicazioni" }]
    : [
        { icon: LayoutGridIcon, label: "Panoramica" },
        { icon: MessagesSquareIcon, label: "Chat", active: true, count: 2 },
        { icon: MailIcon, label: "Posta", count: 2 },
      ]
  return (
    // Out of the preview's padding: the frame is the whole window.
    <div className="fixed inset-0 overflow-hidden">
      <SidebarProvider open style={{ "--sidebar-width": "20rem" } as React.CSSProperties}>
        <Sidebar collapsible="none" className="h-svh shrink-0 border-r" style={{ width: "14rem" }}>
          <SidebarHeader className="gap-3">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton size="lg">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground">
                    {personal ? "P" : "A"}
                  </span>
                  <span className="grid min-w-0 flex-1 text-left leading-tight">
                    <span className="truncate text-sm font-semibold">{personal ? "Personale" : "Azienda Prova"}</span>
                    <span className="truncate text-xs text-muted-foreground">Collegato</span>
                  </span>
                  <ChevronsUpDownIcon className="ml-auto text-sidebar-foreground/70" />
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
            <InputGroup className="bg-background">
              <InputGroupAddon>
                <SearchIcon />
              </InputGroupAddon>
              <InputGroupInput readOnly placeholder="Cerca…" aria-label="Cerca ovunque" />
            </InputGroup>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              {!personal && <SidebarGroupLabel>Lavoro</SidebarGroupLabel>}
              <SidebarGroupContent>
                <SidebarMenu>
                  {areas.map((area) => (
                    <SidebarMenuItem key={area.label}>
                      <SidebarMenuButton isActive={area.active}>
                        <area.icon />
                        <span>{area.label}</span>
                        {area.count ? (
                          <span className="ml-auto inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
                            {area.count}
                          </span>
                        ) : null}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            {!personal && (
              <SidebarGroup>
                <SidebarGroupLabel>Gestionale</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {[
                      { icon: FileTextIcon, label: "Preventivi" },
                      { icon: PackageIcon, label: "Ordini" },
                      { icon: UsersIcon, label: "Clienti" },
                    ].map((area) => (
                      <SidebarMenuItem key={area.label}>
                        <SidebarMenuButton>
                          <area.icon />
                          <span>{area.label}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )}
          </SidebarContent>
          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton size="lg">
                  <Avatar className="size-8 rounded-lg">
                    <AvatarFallback className="rounded-lg">{personal ? "P" : "AR"}</AvatarFallback>
                  </Avatar>
                  <span className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{personal ? "Paola" : "Ada Rinaldi"}</span>
                    <span className="truncate text-xs text-muted-foreground">{personal ? "paola@demo.test" : "admin@prova.test"}</span>
                  </span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
            <p className="px-3 pb-1 text-xs text-muted-foreground">Clegra 0.1.10 · server 0.1.10</p>
          </SidebarFooter>
        </Sidebar>
        {/* The page's own list. */}
        <div className="flex h-svh w-(--sidebar-width) shrink-0 flex-col overflow-hidden border-r bg-sidebar">
          <div className="flex h-12 shrink-0 items-center gap-2 border-b px-3">
            <span className="text-sm font-medium">Chat</span>
            <Button size="icon-sm" variant="ghost" className="ml-auto" aria-label="Nuova chat">
              <PlusIcon />
            </Button>
          </div>
          {chats.map((chat) => (
            <div key={chat.title} className="flex items-center gap-2 border-b px-3 py-2.5">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{chat.title}</p>
                <p className="text-xs text-muted-foreground">{chat.when}</p>
              </div>
              {chat.unread ? <Badge>{chat.unread}</Badge> : null}
            </div>
          ))}
        </div>
        {/* The page. */}
        <div className="flex h-svh min-w-0 flex-1 flex-col bg-background">
          <header className="flex h-12 shrink-0 items-center gap-2 border-b px-6">
            <Button size="sm" variant="outline">
              Indietro
            </Button>
            <Button size="sm" className="btn-yes ml-auto">
              Sì, invia
            </Button>
          </header>
          <div className="flex flex-col gap-4 overflow-y-auto p-6">
            <Card>
              <CardHeader>
                <CardTitle>Preventivi 2026</CardTitle>
                <CardDescription>Letti dal gestionale, in diretta.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Numero</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead className="text-right">Totale</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      ["2026-001", "Birrificio Nuvola Srl", "567,44 €"],
                      ["2026-002", "Vivaio Germoglio Srl", "65,50 €"],
                    ].map(([n, c, t]) => (
                      <TableRow key={n}>
                        <TableCell>{n}</TableCell>
                        <TableCell>{c}</TableCell>
                        <TableCell className="text-right">{t}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarProvider>
    </div>
  )
}

/** A company's account. */
export const Business: StoryObj = {
  globals: { theme: "light" },
  render: () => <Shell personal={false} />,
}

/** A personal account: the same colours, its own sidebar. */
export const Personal: StoryObj = {
  globals: { theme: "light" },
  render: () => <Shell personal />,
}
