"use client"

import { createContext, useContext, type ReactNode } from "react"

import { Avatar, AvatarFallback } from "@clegra/ui/react/components/avatar"
import { Badge } from "@clegra/ui/react/components/badge"
import { Button } from "@clegra/ui/react/components/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@clegra/ui/react/components/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@clegra/ui/react/components/dropdown-menu"
import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "@clegra/ui/react/components/item"
import { Progress } from "@clegra/ui/react/components/progress"
import { Skeleton } from "@clegra/ui/react/components/skeleton"

import { ITALIAN_STATE_WORDS, stateMessage, type Derived, type State, type StateWords, type Tone } from "./derive"

/**
 * THE HOST'S RECORD RENDERER, on the web (docs/tech/APP-DESIGN.md §1 and §4): one
 * record of an application at each surface the host draws (`card`, `row`,
 * `chip`, `detail`) and the states that take its place when it can't be
 * shown. An application never draws these: it declares roles, the host calls
 * `derive` (./derive.ts) and hands the result here. The layout is the Apps
 * catalogue's reference (../apps/catalogue.tsx), written against the web's
 * components only, so a client bundles nothing of React Native.
 *
 * Nothing here fetches or knows an application: what is clicked comes back
 * through callbacks, by the action's id.
 */

/**
 * The renderer's own few words (what no application declares): Italian unless the client gives them in the
 * person's language (`RecordWordsProvider`).
 */
export type RecordWords = { moreActions: string; amount: string; quantity: string; date: string; person: string; place: string; progress: string; loading: string; states: StateWords }
const ITALIAN: RecordWords = { moreActions: "Altre azioni", amount: "Importo", quantity: "Quantità", date: "Data", person: "Persona", place: "Luogo", progress: "Avanzamento", loading: "Caricamento", states: ITALIAN_STATE_WORDS }
const WordsContext = createContext<RecordWords>(ITALIAN)
export const RecordWordsProvider = WordsContext.Provider
const useWords = () => useContext(WordsContext)

/** Where a record comes from: the first line of every card, «App · Tipo». The host's, never the application's to restyle. */
export type RecordSource = { app: string; type?: string; icon?: ReactNode }

/** The host's own entries under «⋯» («Condividi in una chat», «Chiedi a Clegra»), after the application's actions that did not fit. */
/** An entry of a record's «⋯»; `group`: listed after the others under this heading (an application's name, in «Azioni»). */
export type RecordMenuEntry = { id: string; label: string; group?: string }

type Acting = {
  /** One of the record's actions was chosen (`Derived.actions` or `.more`), by its id. */
  onAction?: (id: string) => void
  /** The action running now: its button waits. */
  busy?: string | null
  menu?: readonly RecordMenuEntry[]
  onMenu?: (id: string) => void
}

const tones: Record<Tone, string> = { neutral: "var(--muted-foreground)", info: "var(--link)", success: "var(--success)", warning: "var(--warning)", danger: "var(--destructive)" }

const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((w) => w[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase()

function ToneDot({ tone }: { tone: Tone }) {
  return <span aria-hidden className="inline-block size-2 shrink-0 rounded-full" style={{ background: tones[tone] }} />
}

function Status({ d }: { d: Derived }) {
  if (!d.status) return null
  return (
    <Badge variant="outline" data-record-status>
      <ToneDot tone={d.status.tone} />
      <span>{d.status.text}</span>
    </Badge>
  )
}

function Source({ source }: { source: RecordSource }) {
  return (
    <span className="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground [&_svg]:size-3.5 [&_svg]:shrink-0" data-record-source>
      {source.icon}
      <span className="truncate">{source.type ? `${source.app} · ${source.type}` : source.app}</span>
    </span>
  )
}

function Pairs({ fields }: { fields: Derived["fields"] }) {
  return (
    <dl className="flex flex-col gap-1">
      {fields.map((f) => (
        <div key={f.label} className="flex flex-row items-baseline justify-between gap-4">
          <dt className="text-sm text-muted-foreground">{f.label}</dt>
          <dd className="text-right text-sm wrap-anywhere">{f.text}</dd>
        </div>
      ))}
    </dl>
  )
}

/** «⋯»: the application's actions that did not fit, then the host's own entries. Nothing when both are empty. */
function More({ d, onAction, menu = [], onMenu, busy }: { d: Pick<Derived, "more"> } & Acting) {
  const words = useWords()
  if (!d.more.length && !menu.length) return null
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button size="sm" variant="ghost" aria-label={words.moreActions} data-record-more />}>⋯</DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-52">
        {d.more.length ? (
          <DropdownMenuGroup>
            {d.more.map((a) => (
              <DropdownMenuItem key={a.id} disabled={Boolean(busy)} onClick={() => onAction?.(a.id)} data-record-action={a.id}>
                {a.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        ) : null}
        {d.more.length && menu.length ? <DropdownMenuSeparator /> : null}
        <RecordMenuGroups menu={menu} onMenu={onMenu} />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/**
 * A record's «⋯» entries: the host's first, then each application's under its
 * name (the «Azioni» of the record), with a line between them.
 */
export function RecordMenuGroups({ menu, onMenu }: { menu: readonly RecordMenuEntry[]; onMenu?: (id: string) => void }) {
  const own = menu.filter((entry) => !entry.group)
  const groups: { name: string; entries: RecordMenuEntry[] }[] = []
  for (const entry of menu)
    if (entry.group) {
      const group = groups.find((g) => g.name === entry.group)
      if (group) group.entries.push(entry)
      else groups.push({ name: entry.group, entries: [entry] })
    }
  return (
    <>
      {own.length ? (
        <DropdownMenuGroup>
          {own.map((entry) => (
            <DropdownMenuItem key={entry.id} onClick={() => onMenu?.(entry.id)} data-record-menu={entry.id}>
              {entry.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      ) : null}
      {groups.map((group, i) => (
        <DropdownMenuGroup key={group.name} data-record-menu-app={group.name}>
          {own.length || i > 0 ? <DropdownMenuSeparator /> : null}
          <DropdownMenuLabel className="text-[0.6875rem] font-semibold tracking-[0.04em] uppercase">{group.name}</DropdownMenuLabel>
          {group.entries.map((entry) => (
            <DropdownMenuItem key={entry.id} onClick={() => onMenu?.(entry.id)} data-record-menu={entry.id}>
              {entry.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      ))}
    </>
  )
}

/** A record's actions in a row: the first is the primary button (none with `quiet`), then the others, then «⋯». On a card and a detail; also alone, on the record's own page. */
export function RecordActions({ d, onAction, busy, menu, onMenu, quiet = false }: { d: Pick<Derived, "actions" | "more">; quiet?: boolean } & Acting) {
  if (!d.actions.length && !d.more.length && !menu?.length) return null
  return (
    <div className="flex flex-row flex-wrap items-center gap-2" data-record-actions>
      {d.actions.map((a, i) => (
        // `quiet`: on the record's own page, where the header holds the page's one primary action, every button is secondary.
        <Button key={a.id} size="sm" variant={i === 0 && !quiet ? "default" : "outline"} disabled={Boolean(busy)} aria-busy={busy === a.id || undefined} onClick={() => onAction?.(a.id)} data-record-action={a.id}>
          {a.label}
        </Button>
      ))}
      <More d={d} onAction={onAction} busy={busy} menu={menu} onMenu={onMenu} />
    </div>
  )
}

/** `chip`: the type's icon and the title, inline in text; the status only as a tone. A button when it opens something. */
export function RecordChip({ source, d, onOpen }: { source: RecordSource; d: Derived; onOpen?: () => void }) {
  const inside = (
    <>
      <span className="flex shrink-0 items-center text-muted-foreground [&_svg]:size-3.5">{source.icon}</span>
      <span className="truncate text-sm font-medium">{d.title}</span>
      {d.status ? <ToneDot tone={d.status.tone} /> : null}
    </>
  )
  const className = "inline-flex max-w-full items-center gap-1.5 rounded-md border border-border bg-card px-2 py-0.5 align-middle"
  return onOpen ? (
    <button type="button" onClick={onOpen} title={source.type ? `${source.app} · ${source.type}` : source.app} className={`${className} outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring`} data-record="chip">
      {inside}
    </button>
  ) : (
    <span title={source.type ? `${source.app} · ${source.type}` : source.app} className={className} data-record="chip">
      {inside}
    </span>
  )
}

/** `row`: one line of a list, a search result, a notification: title, subtitle, status and one value. */
export function RecordRow({ source, d, onOpen }: { source: RecordSource; d: Derived; onOpen?: () => void }) {
  const value = d.amount ?? d.quantity ?? d.date ?? ""
  return (
    <Item
      variant="outline"
      size="sm"
      data-record="row"
      {...(onOpen ? { render: <button type="button" onClick={onOpen} />, className: "text-left hover:bg-muted/50" } : {})}
    >
      {source.icon ? <ItemMedia variant="icon">{source.icon}</ItemMedia> : null}
      <ItemContent>
        <ItemTitle>{d.title}</ItemTitle>
        <ItemDescription>{[source.type ? `${source.app} · ${source.type}` : source.app, d.subtitle].filter(Boolean).join(" · ")}</ItemDescription>
      </ItemContent>
      <ItemActions>
        <Status d={d} />
        {value ? <span className="text-sm font-medium tabular-nums">{value}</span> : null}
      </ItemActions>
    </Item>
  )
}

/**
 * `card`: in an answer of the assistant's, in a chat, on the home. The anatomy
 * of docs/tech/APP-DESIGN.md §4: «App · Tipo» and the status, the title, the
 * subtitle, the amount or quantity, the progress, the person and the date, up
 * to four fields, up to two actions and «⋯». `children`: what the host adds
 * under the record (a confirmation waiting, how an action went).
 */
export function RecordCard({ source, d, children, ...acting }: { source: RecordSource; d: Derived; children?: ReactNode } & Acting) {
  const words = useWords()
  const body = d.amount || d.quantity || d.progress !== undefined || d.person || d.date || d.fields.length
  return (
    <Card className="w-full max-w-sm" data-record="card">
      <CardHeader>
        <div className="flex flex-row items-center justify-between gap-2">
          <Source source={source} />
          <Status d={d} />
        </div>
        <CardTitle data-record-title>{d.title}</CardTitle>
        {d.subtitle ? <CardDescription>{d.subtitle}</CardDescription> : null}
      </CardHeader>
      {body ? (
        <CardContent>
          <div className="flex flex-col gap-3">
            {d.amount || d.quantity ? <span className="text-2xl font-semibold tabular-nums">{d.amount ?? d.quantity}</span> : null}
            {d.progress !== undefined ? <Progress value={Math.round(d.progress * 100)} aria-label={words.progress} /> : null}
            {d.person || d.date ? (
              <div className="flex flex-row items-center justify-between gap-2">
                {d.person ? (
                  <span className="flex min-w-0 flex-row items-center gap-2">
                    <Avatar size="sm">
                      <AvatarFallback>{initials(d.person)}</AvatarFallback>
                    </Avatar>
                    <span className="truncate text-sm">{d.person}</span>
                  </span>
                ) : (
                  <span />
                )}
                {d.date ? <span className="shrink-0 text-sm text-muted-foreground">{d.date}</span> : null}
              </div>
            ) : null}
            {d.fields.length ? <Pairs fields={d.fields} /> : null}
          </div>
        </CardContent>
      ) : null}
      {d.actions.length || d.more.length || acting.menu?.length || children ? (
        <CardFooter className="flex-col items-stretch gap-3">
          <RecordActions d={d} {...acting} />
          {children}
        </CardFooter>
      ) : null}
    </Card>
  )
}

function Labelled({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-base font-medium">{value}</span>
    </div>
  )
}

/** `detail`: the opened record, every role, every group and field, every action the viewer may use. */
export function RecordDetail({ source, d, children, ...acting }: { source: RecordSource; d: Derived; children?: ReactNode } & Acting) {
  const words = useWords()
  return (
    <div className="flex w-full flex-col gap-4" data-record="detail">
      <div className="flex flex-col gap-1">
        <div className="flex flex-row items-center gap-2">
          <Source source={source} />
          <Status d={d} />
        </div>
        <h2 className="text-xl font-semibold" data-record-title>
          {d.title}
        </h2>
        {d.subtitle ? <span className="text-sm text-muted-foreground">{d.subtitle}</span> : null}
      </div>
      {d.amount || d.quantity || d.date || d.person || d.place ? (
        <div className="flex flex-row flex-wrap items-center gap-6">
          {d.amount ? <Labelled label={words.amount} value={d.amount} /> : null}
          {d.quantity ? <Labelled label={words.quantity} value={d.quantity} /> : null}
          {d.date ? <Labelled label={words.date} value={d.date} /> : null}
          {d.person ? <Labelled label={words.person} value={d.person} /> : null}
          {d.place ? <Labelled label={words.place} value={d.place} /> : null}
        </div>
      ) : null}
      {d.progress !== undefined ? <Progress value={Math.round(d.progress * 100)} aria-label={words.progress} /> : null}
      {d.groups.map((g) => (
        <section key={g.title} className="flex flex-col gap-2 rounded-xl border border-border p-4">
          <h3 className="text-sm font-semibold">{g.title}</h3>
          <Pairs fields={g.fields} />
        </section>
      ))}
      {!d.groups.length && d.fields.length ? <Pairs fields={d.fields} /> : null}
      <RecordActions d={d} {...acting} />
      {children}
    </div>
  )
}

/**
 * A record that can't be shown, at the surface it would have had: the same
 * words everywhere (`stateMessage`), the application's name and never the
 * record's title. `lastContact` is the time as words (`contactTime`);
 * `onRetry` is «Riprova» of an unreachable application, `onAskAccess`
 * «Chiedi l'accesso»: each button is there only with its handler.
 */
export function RecordState({
  state,
  source,
  surface = "card",
  lastContact,
  onRetry,
  onAskAccess,
  onLink,
  retrying,
}: {
  state: Exclude<State, "ok">
  source: RecordSource
  surface?: "card" | "row" | "chip" | "detail"
  lastContact?: string | null
  onRetry?: () => void
  onAskAccess?: () => void
  /** `not-linked`: start linking the viewer's account of the app. */
  onLink?: () => void
  retrying?: boolean
}) {
  const words = useWords()
  const m = stateMessage(state, { app: source.app, name: source.type }, lastContact, words.states)
  const act = state === "unreachable" ? onRetry : state === "no-access" ? onAskAccess : state === "not-linked" ? onLink : undefined
  if (surface === "chip")
    return (
      <span title={[m.title, m.hint].filter(Boolean).join(" · ")} className="inline-flex max-w-full items-center gap-1.5 rounded-md border border-dashed border-border px-2 py-0.5 align-middle" data-record="chip" data-record-state={state}>
        <span className="flex shrink-0 items-center text-muted-foreground [&_svg]:size-3.5">{source.icon}</span>
        <span className="truncate text-sm text-muted-foreground">{source.app}</span>
      </span>
    )
  return (
    <div
      role={state === "unreachable" ? "status" : undefined}
      className={`flex w-full gap-3 rounded-xl border border-dashed border-border p-4 ${surface === "detail" ? "" : "max-w-sm"} ${surface === "row" ? "flex-row items-center justify-between" : "flex-col"}`}
      data-record={surface}
      data-record-state={state}
    >
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="text-sm font-medium">{m.title}</span>
        {m.hint ? <span className="text-sm text-muted-foreground">{m.hint}</span> : null}
      </div>
      {m.action && act ? (
        <Button size="sm" variant="outline" className="self-start" onClick={act} disabled={retrying} aria-busy={retrying || undefined}>
          {m.action}
        </Button>
      ) : null}
    </div>
  )
}

/** A record on its way, in the shape of what is coming (docs/tech/APP-DESIGN.md §5): never a spinner, never a jump. */
export function RecordSkeleton({ surface = "card" }: { surface?: "card" | "row" | "chip" | "detail" }) {
  const words = useWords()
  if (surface === "chip") return <Skeleton className="inline-block h-6 w-32 rounded-md align-middle" aria-label={words.loading} />
  if (surface === "row") return <Skeleton className="h-14 w-full max-w-sm rounded-2xl" aria-label={words.loading} />
  return (
    <div className={`flex w-full flex-col gap-3 rounded-xl border border-border p-4 ${surface === "detail" ? "" : "max-w-sm"}`} aria-busy="true" aria-label={words.loading} data-record={surface} data-record-state="loading">
      <Skeleton className="h-3 w-32" />
      <Skeleton className="h-5 w-56 max-w-full" />
      <Skeleton className="h-4 w-40" />
      <Skeleton className="h-8 w-28" />
    </div>
  )
}
