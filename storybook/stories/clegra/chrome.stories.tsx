import type { Meta, StoryObj } from "@storybook/react-native-web-vite"
import {
  ArrowLeftIcon,
  BellIcon,
  CalendarIcon,
  CircleDashedIcon,
  DownloadIcon,
  LayersIcon,
  LayoutGridIcon,
  ListIcon,
  ListFilterIcon,
  MoreHorizontalIcon,
  PlusIcon,
  PrinterIcon,
  ReceiptTextIcon,
  SearchIcon,
  WalletIcon,
} from "lucide-react"
import { useState } from "react"

// The glass classes are the apps' (the client imports them after styles.css); the site never does.
import "@clegra/ui/glass.css"

import { HeaderGroup, HeaderPill, Hint, PillDivider, PillItem, ShortcutKeys } from "@clegra/ui/clegra/pill"
import { SegmentedControl } from "@clegra/ui/clegra/segmented"
import { FloatingPanel, ScrollEdge } from "@clegra/ui/clegra/surface"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@clegra/ui/components/table"

/**
 * THE CLEGRA LAYER OF THE APPS:
 * the floating header's pills (`clegra/pill`), the surfaces (`clegra/surface`)
 * and the frosted blur (`glass.css`), over shadcn's components, never inside
 * them. An invoicing app's «Fatture» page is the example; the data here is test data.
 */
const meta = { title: "Clegra/Chrome" } satisfies Meta
export default meta

/** Something behind the glass, so the blur and the tint show. */
function Ground({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-background ${className}`}>
      <div aria-hidden className="absolute inset-0 grid grid-cols-6 gap-3 p-4 opacity-70">
        {Array.from({ length: 24 }, (_, i) => (
          <div key={i} className="h-16 rounded-xl" style={{ background: ["#2D4BEE", "#FF8A3D", "#1C9C6B", "#8B5CF6"][i % 4] }} />
        ))}
      </div>
      <div className="relative">{children}</div>
    </div>
  )
}

/**
 * The floating header, as Fatture has it: back (a circle), search (⌘F) on the
 * left; the filters pill (a set one on the strong fill), the page's icon
 * actions, the one tinted primary, «…» and the bell on the right. Every
 * icon-only control has its tooltip with its keys (Hint).
 */
export const Header: StoryObj = {
  render: () => (
    <Ground className="h-48">
      <div className="flex items-center gap-2 p-3">
        <HeaderGroup label="Navigazione">
          <HeaderPill round>
            <Hint label="Indietro" keys="⌘[">
              <PillItem icon={<ArrowLeftIcon />} aria-label="Indietro" />
            </Hint>
          </HeaderPill>
          <HeaderPill className="w-64 gap-2 pr-3.5 pl-3 text-muted-foreground">
            <SearchIcon className="size-4" aria-hidden />
            <span className="flex-1 text-[0.84375rem]">Cerca fatture</span>
            <ShortcutKeys keys="⌘F" />
          </HeaderPill>
        </HeaderGroup>
        <HeaderGroup label="Strumenti della pagina" className="ml-auto">
          <HeaderPill>
            <PillItem icon={<LayersIcon />} label="Emesse" chevron set />
            <PillItem icon={<CircleDashedIcon />} label="Stato SDI" chevron />
            <PillItem icon={<CalendarIcon />} label="Periodo" chevron />
            <PillDivider />
            <PillItem icon={<ListFilterIcon />} label="Colonne" />
          </HeaderPill>
          <HeaderPill>
            <Hint label="Stampa" keys="⌥P">
              <PillItem icon={<PrinterIcon />} aria-label="Stampa" />
            </Hint>
            <Hint label="Esporta">
              <PillItem icon={<DownloadIcon />} aria-label="Esporta" />
            </Hint>
          </HeaderPill>
          <HeaderPill tone="tinted">
            <Hint label="Nuova fattura" keys="⌥N">
              <PillItem icon={<PlusIcon />} label="Nuova fattura" />
            </Hint>
          </HeaderPill>
          <HeaderPill round>
            <Hint label="Altro e menu">
              <PillItem icon={<MoreHorizontalIcon />} aria-label="Altro e menu" />
            </Hint>
          </HeaderPill>
          <HeaderPill round>
            <Hint label="Notifiche">
              <PillItem icon={<BellIcon />} aria-label="Notifiche" />
            </Hint>
          </HeaderPill>
        </HeaderGroup>
      </div>
    </Ground>
  ),
}

/** Folded, as at 1024: search a circle, the filters «Filtri (n)» with a set period kept beside it, the primary an icon. */
export const HeaderFolded: StoryObj = {
  render: () => (
    <Ground className="h-40">
      <div className="flex max-w-xl items-center gap-2 p-3">
        <HeaderPill round>
          <PillItem icon={<ArrowLeftIcon />} aria-label="Indietro" />
        </HeaderPill>
        <HeaderPill>
          <PillItem icon={<ReceiptTextIcon />} label="Contabilità" chevron className="pl-1.5 font-semibold" />
        </HeaderPill>
        <HeaderPill round>
          <PillItem icon={<SearchIcon />} aria-label="Cerca fatture" />
        </HeaderPill>
        <div className="ml-auto flex items-center gap-2">
          <HeaderPill>
            <PillItem icon={<CalendarIcon />} label="Ultimi 30 giorni" chevron set />
          </HeaderPill>
          <HeaderPill>
            <PillItem icon={<ListFilterIcon />} label="Filtri" count={2} />
          </HeaderPill>
          <HeaderPill tone="tinted">
            <PillItem icon={<PlusIcon />} aria-label="Nuova fattura" />
          </HeaderPill>
          <HeaderPill round>
            <PillItem icon={<MoreHorizontalIcon />} aria-label="Altro e menu" />
          </HeaderPill>
        </div>
      </div>
    </Ground>
  ),
}

/** The surfaces: the floating panel (thick glass, radius 22) with an app's bar, the scroll edge over content, the segmented control. */
export const Surfaces: StoryObj = {
  render: function Render() {
    const [view, setView] = useState<"all" | "unread" | "files">("all")
    return (
      <div className="flex flex-col gap-6">
        <Ground className="h-80">
          <div className="flex h-80 gap-4 p-2">
            <FloatingPanel className="w-60 flex-col p-2">
              <p className="px-2.5 pt-3 pb-2 text-[0.9375rem] font-semibold">Contabilità</p>
              {[
                { label: "Fatture", icon: ReceiptTextIcon, active: true },
                { label: "Scadenze", icon: CalendarIcon },
                { label: "Partitari", icon: WalletIcon },
              ].map((entry) => (
                <span
                  key={entry.label}
                  className={`flex h-8.5 items-center gap-2.5 rounded-nav px-2.5 text-[0.84375rem] ${entry.active ? "bg-(--fill-strong) font-semibold text-sidebar-active" : ""}`}
                >
                  <entry.icon className="size-4" />
                  {entry.label}
                </span>
              ))}
            </FloatingPanel>
            <div className="relative flex-1 overflow-hidden rounded-xl bg-background">
              <ScrollEdge />
              <div className="h-full overflow-y-auto p-4 pt-16">
                {Array.from({ length: 12 }, (_, i) => (
                  <p key={i} className="py-2 text-sm">
                    Riga {i + 1}: il contenuto scorre sotto il bordo sfumato.
                  </p>
                ))}
              </div>
            </div>
          </div>
        </Ground>
        <SegmentedControl
          surface="fill"
          label="Messaggi"
          value={view}
          onValueChange={setView}
          items={[
            { value: "all", label: "Tutti" },
            { value: "unread", label: "Non letti" },
            { value: "files", label: "Con allegati" },
          ]}
        />
      </div>
    )
  },
}

/** The two frosted levels and the tinted primary on the same ground; content stays solid (a glass card, a glass table with its sticky head). */
export const Glass: StoryObj = {
  render: () => (
    <div className="flex flex-col gap-6">
      <Ground className="h-44">
        <div className="flex gap-4 p-6">
          <div className="glass flex h-24 w-48 items-center justify-center rounded-pill text-sm font-semibold">.glass</div>
          <div className="glass-thick flex h-24 w-48 items-center justify-center rounded-panel text-sm font-semibold">.glass-thick</div>
          <div className="glass-fill flex h-24 w-48 items-center justify-center rounded-pill text-sm font-semibold">.glass-fill</div>
        </div>
      </Ground>
      <div className="grid max-w-3xl gap-3 sm:grid-cols-3">
        {["Imponibile", "IVA", "Totale documenti"].map((label, i) => (
          <div key={label} className="glass-card flex flex-col px-4.5 py-4">
            <span className="text-[0.78125rem] text-muted-foreground">{label}</span>
            <span className="mt-1 text-2xl font-[650] tracking-[-0.02em] tabular-nums">{["12.480,00 €", "2.745,60 €", "15.225,60 €"][i]}</span>
          </div>
        ))}
      </div>
      <div className="glass-table max-w-3xl">
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
              ["138/2026", "Teatro Sipario Aps (prova)", "231,80 €"],
              ["137/2026", "Palestra Zefiro Asd (prova)", "1.202,02 €"],
              ["136/2026", "Ortofrutta Stellare Srl (prova)", "913,51 €"],
            ].map(([number, name, total]) => (
              <TableRow key={number}>
                <TableCell className="font-semibold text-link">{number}</TableCell>
                <TableCell>{name}</TableCell>
                <TableCell className="text-right font-semibold tabular-nums">{total}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  ),
}

/**
 * The segmented control in the header: a pill like the others (40, the glass, items of 32), the chosen segment the
 * selected state. Icon-only (Finder's list · icons, each with its tooltip) or with words; ← → choose.
 */
export const Segmented: StoryObj = {
  render: function Render() {
    const [shape, setShape] = useState<"list" | "icons">("list")
    const [span, setSpan] = useState<"day" | "week" | "month">("week")
    return (
      <Ground className="h-28">
        <div className="flex justify-end p-3">
          <HeaderGroup label="Strumenti della pagina">
            <SegmentedControl
              label="Vista"
              iconOnly
              value={shape}
              onValueChange={setShape}
              items={[
                { value: "list", label: "Elenco", icon: <ListIcon />, keys: "V" },
                { value: "icons", label: "Icone", icon: <LayoutGridIcon />, keys: "V" },
              ]}
            />
            <SegmentedControl
              label="Periodo"
              value={span}
              onValueChange={setSpan}
              items={[
                { value: "day", label: "Giorno", hint: "Mostra il giorno", keys: "D" },
                { value: "week", label: "Settimana", hint: "Mostra la settimana", keys: "W" },
                { value: "month", label: "Mese", hint: "Mostra il mese", keys: "M" },
              ]}
            />
            <HeaderPill tone="tinted">
              <PillItem icon={<PlusIcon />} label="Nuovo" />
            </HeaderPill>
          </HeaderGroup>
        </div>
      </Ground>
    )
  },
}
