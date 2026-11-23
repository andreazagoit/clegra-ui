import type { Meta, StoryObj } from "@storybook/react-native-web-vite"
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon, ClockIcon, InboxIcon, ListFilterIcon, MessageCircleDashedIcon, PlusIcon, SendIcon, Trash2Icon } from "lucide-react"
import { useState } from "react"

import "@clegra/ui/glass.css"

import { AppAccent } from "@clegra/ui/clegra/app-accent"
import { HeaderGroup, HeaderPill, PillDivider, PillItem } from "@clegra/ui/clegra/pill"
import { Segmented } from "@clegra/ui/clegra/surface"
import { Avatar, AvatarFallback, AvatarGroup, AvatarGroupCount } from "@clegra/ui/components/avatar"
import { Badge } from "@clegra/ui/components/badge"
import { Bubble, BubbleContent } from "@clegra/ui/components/bubble"
import { Button } from "@clegra/ui/components/button"
import { Tabs, TabsList, TabsTrigger } from "@clegra/ui/components/tabs"
import type { AppAccentName } from "@clegra/ui/accents"

/**
 * THE GLASS FILL AND THE SELECTED STATE (brand/theme.css): the primary button, the header's tinted pill, a solid
 * badge, the person's own bubble and every selected control (a set filter, a segment, a tab, a pressed toggle) are one
 * recipe, in the colour of the app they are in; the other people's bubbles are its neutral form. A list's open row is
 * the neutral selected row instead. The toolbar's theme switches light and dark. The data is invented.
 */
const meta = { title: "Clegra/Selected states" } satisfies Meta
export default meta

const VIEWS = ["Giorno", "Settimana", "Mese"] as const

/** A calendar's header: the date pill and the view pill, the chosen view selected. */
function CalendarHeader({ accent }: { accent: AppAccentName }) {
  const [view, setView] = useState<(typeof VIEWS)[number]>("Settimana")
  return (
    <AppAccent accent={accent} className="flex flex-wrap items-center gap-2" data-story-calendar="">
      <HeaderGroup label="Periodo">
        <HeaderPill>
          <PillItem icon={<ChevronLeftIcon />} aria-label="Settimana precedente" />
          <PillItem label="23 – 29 nov" />
          <PillItem icon={<ChevronRightIcon />} aria-label="Settimana successiva" />
        </HeaderPill>
        <HeaderPill role="radiogroup" aria-label="Vista">
          {VIEWS.map((v) => (
            <PillItem key={v} role="radio" aria-checked={view === v} label={v} set={view === v} onClick={() => setView(v)} />
          ))}
        </HeaderPill>
      </HeaderGroup>
      <HeaderPill tone="tinted">
        <PillItem icon={<PlusIcon />} label="Nuovo evento" />
      </HeaderPill>
    </AppAccent>
  )
}

/** A knowledge toolbar: the status filters, one set, and the page's primary action. */
function MemoryToolbar({ accent }: { accent: AppAccentName }) {
  const [status, setStatus] = useState("Da revisionare")
  return (
    <AppAccent accent={accent} className="flex flex-wrap items-center gap-2" data-story-memory="">
      <HeaderPill>
        <PillItem icon={<ListFilterIcon />} label="Filtri" chevron count={1} />
        <PillDivider />
        {["Tutte", "Da revisionare", "Confermate"].map((s) => (
          <PillItem key={s} label={s} set={status === s} onClick={() => setStatus(s)} />
        ))}
      </HeaderPill>
      <HeaderPill tone="tinted">
        <PillItem icon={<PlusIcon />} label="Nuova voce" />
      </HeaderPill>
    </AppAccent>
  )
}

/** A list with its open row, a segmented control, tabs, a button and a badge. */
function Controls({ accent }: { accent: AppAccentName }) {
  const [filter, setFilter] = useState("all")
  return (
    <AppAccent accent={accent} className="grid gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <Segmented label="Mostra" value={filter} onValueChange={setFilter} items={[{ value: "all", label: "Tutti" }, { value: "unread", label: "Non letti" }, { value: "files", label: "Con allegati" }]} />
        <Tabs defaultValue="open">
          <TabsList>
            <TabsTrigger value="open">Aperti</TabsTrigger>
            <TabsTrigger value="done">Chiusi</TabsTrigger>
          </TabsList>
        </Tabs>
        <Button>Salva</Button>
        <Badge>3 nuovi</Badge>
      </div>
      <div className="grid w-72 gap-0.5 rounded-2xl bg-card p-1.5">
        {[
          { icon: InboxIcon, title: "Ordine 1042", line: "Consegna confermata per venerdì", open: false },
          { icon: CalendarIcon, title: "Riunione di reparto", line: "Sala grande, ore 10", open: true },
          { icon: ClockIcon, title: "Promemoria", line: "Inviare il listino aggiornato", open: false },
        ].map((row) => (
          <div key={row.title} className={`flex items-start gap-2.5 rounded-(--radius-cell) px-3 py-2.5 hover:bg-(--fill) ${row.open ? "selected-row" : ""}`}>
            <row.icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            <span className="grid min-w-0">
              <span className="truncate text-sm font-medium text-foreground">{row.title}</span>
              <span className="truncate text-xs text-muted-foreground">{row.line}</span>
            </span>
          </div>
        ))}
      </div>
    </AppAccent>
  )
}

/** Faces as a stack: each keeps its own initials, ground and ring, in a selected row and in a selected control. */
const Faces = ({ names, more }: { names: string[]; more?: number }) => (
  <AvatarGroup className="shrink-0">
    {names.map((name) => (
      <Avatar key={name} size="sm">
        <AvatarFallback className="text-[10px]">{name.split(" ").map((p) => p[0]).join("")}</AvatarFallback>
      </Avatar>
    ))}
    {more ? <AvatarGroupCount className="size-6 text-[10px]">+{more}</AvatarGroupCount> : null}
  </AvatarGroup>
)

/** Messaggi's list: the open conversation is the neutral selected row; the filter with faces is a selected control. */
function PeopleList({ accent }: { accent: AppAccentName }) {
  const [filter, setFilter] = useState("Tutte")
  return (
    <AppAccent accent={accent} className="grid w-80 gap-2" data-story-people="">
      <HeaderPill className="w-fit">
        {["Tutte", "Non lette"].map((f) => (
          <PillItem key={f} label={f} set={filter === f} onClick={() => setFilter(f)} />
        ))}
        <PillItem set label={<span className="flex items-center gap-1.5"><Faces names={["Sam Lee", "Alex Morgan"]} />Team</span>} />
      </HeaderPill>
      <div className="grid gap-0.5 rounded-2xl bg-sidebar p-1.5">
        {[
          { names: ["Sam Lee"], title: "Sam Lee", line: "See you at ten", time: "10:42", unread: 2, open: false },
          { names: ["Alex Morgan", "Jamie Fox", "Robin Hale"], more: 2, title: "Sales team", line: "The price list is updated", time: "09:15", unread: 0, open: true },
          { names: ["Kim Park"], title: "Kim Park", line: "Thanks!", time: "Mon", unread: 0, open: false },
        ].map((row) => (
          <div key={row.title} className={`flex items-center gap-2 rounded-(--radius-cell) px-3 py-2.5 hover:bg-(--fill) ${row.open ? "selected-row" : ""}`}>
            <Faces names={row.names} more={row.more} />
            <span className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="flex min-w-0 items-baseline gap-2">
                <span className="min-w-0 flex-1 truncate text-sm">{row.title}</span>
                <span className={`shrink-0 text-xs ${row.unread ? "text-primary" : "text-muted-foreground"}`}>{row.time}</span>
              </span>
              <span className="flex min-w-0 items-center gap-2">
                <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">{row.line}</span>
                {row.unread ? <span className="glass-fill shrink-0 rounded-full px-2 text-xs">{row.unread}</span> : null}
              </span>
            </span>
          </div>
        ))}
      </div>
    </AppAccent>
  )
}

/** The assistant chat's header: two icon buttons in one pill, the gap between them the pill's side padding. */
function ChatHeaderPill({ accent }: { accent: AppAccentName }) {
  const [temporary, setTemporary] = useState(false)
  return (
    <AppAccent accent={accent} className="flex items-center gap-2" data-story-icon-pill="">
      <HeaderPill>
        <PillItem icon={<MessageCircleDashedIcon />} aria-label="Chat temporanea" set={temporary} onClick={() => setTemporary(!temporary)} />
        <PillItem icon={<Trash2Icon />} aria-label="Elimina" />
      </HeaderPill>
      <HeaderPill>
        <PillItem icon={<MessageCircleDashedIcon />} aria-label="Chat temporanea" set />
        <PillItem icon={<Trash2Icon />} aria-label="Elimina" />
        <PillDivider />
        <PillItem icon={<PlusIcon />} label="Nuova" />
      </HeaderPill>
    </AppAccent>
  )
}

/** A chat with people: the person's own bubbles in the app's glass fill, the others' in the neutral one. */
function Chat({ accent }: { accent: AppAccentName }) {
  return (
    <AppAccent accent={accent} className="flex w-96 flex-col gap-2 rounded-2xl bg-background p-3">
      <Bubble variant="muted">
        <BubbleContent>Ci vediamo alle 10?</BubbleContent>
      </Bubble>
      <Bubble align="end">
        <BubbleContent>Sì, porto io il listino.</BubbleContent>
      </Bubble>
      <Bubble align="end">
        <BubbleContent>Ho anche aggiornato i prezzi dei ricambi e aggiunto le note sui tempi di consegna per i clienti del nord.</BubbleContent>
      </Bubble>
      <Bubble variant="muted">
        <BubbleContent>Perfetto, grazie. <SendIcon className="inline size-3.5" /></BubbleContent>
      </Bubble>
    </AppAccent>
  )
}

const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <section className="grid gap-2">
    <h3 className="text-xs font-semibold text-muted-foreground">{label}</h3>
    {children}
  </section>
)

export const Overview: StoryObj = {
  render: () => (
    <div className="grid gap-6 bg-background p-4 text-foreground">
      <Row label="Calendar (red)">
        <CalendarHeader accent="red" />
      </Row>
      <Row label="Memoria (teal)">
        <MemoryToolbar accent="teal" />
      </Row>
      <Row label="Clegra (blue)">
        <Controls accent="blue" />
      </Row>
      <Row label="Icon buttons in one pill (gap = the pill's padding)">
        <ChatHeaderPill accent="blue" />
      </Row>
      <Row label="Messaggi (green): a selected row and a selected control with faces">
        <PeopleList accent="green" />
      </Row>
      <Row label="Messaggi (green) and the assistant (blue)">
        <div className="flex flex-wrap gap-4">
          <Chat accent="green" />
          <Chat accent="blue" />
        </div>
      </Row>
    </div>
  ),
}
