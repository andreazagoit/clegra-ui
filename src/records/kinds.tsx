"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"
import {
  Building2Icon,
  CalendarDaysIcon,
  ChevronsUpDownIcon,
  FileTextIcon,
  LinkIcon,
  LockIcon,
  PackageIcon,
  PuzzleIcon,
  ShapesIcon,
  ShoppingCartIcon,
  SquareCheckIcon,
  Trash2Icon,
  TriangleAlertIcon,
  UserIcon,
  XIcon,
  type LucideIcon,
} from "lucide-react"

import { Badge } from "@clegra/ui/react/components/badge"
import { Button } from "@clegra/ui/react/components/button"
import { Command, CommandGroup, CommandInput, CommandItem, CommandList } from "@clegra/ui/react/components/command"
import { Popover, PopoverContent, PopoverTrigger } from "@clegra/ui/react/components/popover"
import { Skeleton } from "@clegra/ui/react/components/skeleton"
import { Spinner } from "@clegra/ui/react/components/spinner"
import { Tooltip, TooltipContent, TooltipTrigger } from "@clegra/ui/react/components/tooltip"

/**
 * THE HOST'S KIND COMPONENTS, on the web (@clegra/sdk docs/spec.md §3.1, §3.2, §9):
 * what Clegra draws when it shows records of several Clegra apps together by
 * *kind* (person, organization, event, task, document, product, order, or a
 * third party's dotted kind such as `com.acme.shipment`).
 *
 * - `kindIcon`: the icon of a kind.
 * - `SourceBadge`: the app a record comes from (§9 rule 6: every record names its source).
 * - `RefChip`: a cross-app reference (§3.2) in one of the five states of §9 rule 3.
 * - `PartialLine`: the line that says which source did not answer (§9 rule 4).
 * - `KindResults`: a fan-out result, grouped by source or merged (§9 rule 5).
 * - `CrossAppPicker`: a form field holding a record URI of a kind.
 *
 * Like ./record.tsx: nothing here fetches, knows an application or has a
 * word of its own. Every visible word comes in through `words`, from the
 * client's i18n catalogs.
 */

/* ------------------------------------------------------------------ kinds */

const KIND_ICONS: Record<string, LucideIcon> = {
  person: UserIcon,
  organization: Building2Icon,
  event: CalendarDaysIcon,
  task: SquareCheckIcon,
  document: FileTextIcon,
  product: PackageIcon,
  order: ShoppingCartIcon,
}

/** The icon of a kind: one per standard kind of §3.1; any other kind (a third party's, or one this host doesn't know) gets the generic one. */
export function kindIcon(kind: string): LucideIcon {
  return Object.hasOwn(KIND_ICONS, kind) ? KIND_ICONS[kind]! : ShapesIcon
}

function KindGlyph({ kind, className = "size-3.5" }: { kind: string; className?: string }) {
  const Icon = kindIcon(kind)
  return <Icon aria-hidden className={`shrink-0 ${className}`} />
}

/* ----------------------------------------------------------------- source */

/** An app of the workspace as the person sees it: its name in the workspace (§9 rule 1) and its icon. */
export type KindSource = { name: string; icon?: ReactNode }

/** A small badge naming the app a record comes from. `title`: a longer description for the native tooltip (the app's full name, its address). */
export function SourceBadge({ name, icon, title }: KindSource & { title?: string }) {
  return (
    <Badge variant="outline" title={title ?? name} className="max-w-40 font-normal text-muted-foreground" data-kind-source={name}>
      {icon}
      <span className="truncate">{name}</span>
    </Badge>
  )
}

/* -------------------------------------------------------------- reference */

/** The states of a resolved reference (§9 rule 3): `ok` with its title, or why there is none. */
export const REF_STATES = ["ok", "no-access", "not-linked", "gone", "unreachable", "unknown-app"] as const
export type RefState = (typeof REF_STATES)[number]

/** The words a reference chip needs for its states that are not `ok`. `unreachable` takes the app's name («CRM didn't answer»). */
export type RefWords = { noAccess: string; notLinked: (app: string) => string; gone: string; unreachable: (app: string) => string; unknownApp: string }

type RefLook = {
  /** The leading icon: the kind's for `ok`, the state's otherwise. */
  icon: LucideIcon | null
  /** The words in place of the title (never the title unless `ok`). */
  text: (words: RefWords, app: string) => string | null
  /** The chip's frame and text: six visibly distinct looks. */
  className: string
  /** The text's own decoration. */
  textClassName: string
  /** Whether it can be opened (a link or a button): only a record that is there and visible. */
  opens: boolean
}

const REF_LOOKS: Record<RefState, RefLook> = {
  ok: { icon: null, text: () => null, className: "border-border bg-card text-foreground", textClassName: "font-medium", opens: true },
  "no-access": { icon: LockIcon, text: (w) => w.noAccess, className: "border-dashed border-border bg-muted/40 text-muted-foreground", textClassName: "", opens: false },
  "not-linked": { icon: LinkIcon, text: (w, app) => w.notLinked(app), className: "border-dashed border-primary/50 text-muted-foreground", textClassName: "", opens: false },
  gone: { icon: Trash2Icon, text: (w) => w.gone, className: "border-dashed border-border text-muted-foreground", textClassName: "line-through", opens: false },
  unreachable: { icon: TriangleAlertIcon, text: (w, app) => w.unreachable(app), className: "border-warning/60 bg-warning/10 text-foreground [&_[data-ref-icon]]:text-warning", textClassName: "", opens: false },
  "unknown-app": { icon: PuzzleIcon, text: (w) => w.unknownApp, className: "border-dotted border-muted-foreground/50 text-muted-foreground", textClassName: "italic", opens: false },
}

/** How a reference in `state` looks: the pure mapping RefChip draws (tested in kinds.test.ts). */
export function refLook(state: RefState): RefLook {
  return REF_LOOKS[state]
}

/** What a chip says, in words: the title for `ok`, the state's words otherwise. Never a title for another state, even when one is given (§9 rule 3: no stale title). */
export function refText(state: RefState, title: string | undefined, app: string, words: RefWords): string {
  if (state === "ok") return title ?? ""
  return refLook(state).text(words, app) ?? ""
}

export type RefChipProps = {
  state: RefState
  /** The record's title, shown only when `state` is `ok`. */
  title?: string
  kind: string
  /** The kind in the person's language («Person», «Persona»). */
  kindLabel: string
  /** The app the URI names (for `unknown-app`, the name the URI carries). */
  source: KindSource
  /** Where the record opens (its page in the host): the chip is then a link. Only for `ok`. */
  href?: string
  /** Opens the record in place: the chip is then a button. Only for `ok`. */
  onOpen?: () => void
  words: RefWords
  /** Inside another control (a picker's trigger): plain, never a link or a button of its own. */
  inert?: boolean
}

/**
 * A cross-app reference (§3.2), resolved by the host for the viewer, in one
 * of six visibly distinct looks. A tooltip says the kind, the source and the
 * state in words.
 */
export function RefChip({ state, title, kind, kindLabel, source, href, onOpen, words, inert = false }: RefChipProps) {
  const look = refLook(state)
  const text = refText(state, title, source.name, words)
  const StateIcon = look.icon
  const said = [kindLabel, source.name, state === "ok" ? null : text].filter(Boolean).join(" · ")
  const inside = (
    <>
      <span data-ref-icon className="flex shrink-0 items-center [&_svg]:size-3.5">
        {StateIcon ? <StateIcon aria-hidden /> : <KindGlyph kind={kind} />}
      </span>
      <span className={`truncate text-sm ${look.textClassName}`} data-ref-text>
        {text}
      </span>
      {state === "ok" || state === "unknown-app" ? <SourceBadge {...source} /> : <span className="shrink-0 text-xs opacity-80">{source.name}</span>}
    </>
  )
  const className = `inline-flex max-w-full items-center gap-1.5 rounded-md border px-2 py-0.5 align-middle outline-none ${look.className}`
  const interactive = !inert && look.opens
  const trigger =
    interactive && href ? (
      <a href={href} className={`${className} hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring`} />
    ) : interactive && onOpen ? (
      <button type="button" onClick={onOpen} className={`${className} hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring`} />
    ) : (
      <span className={className} />
    )
  return (
    <Tooltip>
      <TooltipTrigger render={trigger} aria-label={state === "ok" ? `${text} · ${said}` : said} data-ref={kind} data-ref-state={state}>
        {inside}
      </TooltipTrigger>
      <TooltipContent>{said}</TooltipContent>
    </Tooltip>
  )
}

/* ---------------------------------------------------------------- partial */

/** A source's state in a fan-out (§9 rule 4), plus `pending`: still loading. */
export const SOURCE_STATES = ["ok", "timeout", "error", "no-access", "not-linked", "pending"] as const
export type SourceState = (typeof SOURCE_STATES)[number]

/** The words of the partial line, each with the app's name: «ERP did not answer», «CRM: link your account»… */
export type PartialWords = {
  timeout: (app: string) => string
  error: (app: string) => string
  noAccess: (app: string) => string
  notLinked: (app: string) => string
  pending: (app: string) => string
}

export type SourceStatus = KindSource & { state: SourceState }

/** The notes of a partial result: one per source that is not `ok`, in the sources' order. Empty when every source is ok. */
export function partialNotes(sources: readonly SourceStatus[], words: PartialWords): { name: string; state: Exclude<SourceState, "ok">; text: string }[] {
  const say: Record<Exclude<SourceState, "ok">, (app: string) => string> = { timeout: words.timeout, error: words.error, "no-access": words.noAccess, "not-linked": words.notLinked, pending: words.pending }
  return sources.flatMap((s) => (s.state === "ok" ? [] : [{ name: s.name, state: s.state, text: say[s.state](s.name) }]))
}

/** Whether a result is partial (§9 rule 4): some source is not `ok` (a pending one included). */
export const isPartial = (sources: readonly SourceStatus[]) => sources.some((s) => s.state !== "ok")

/** One line under results naming every source that was not ok; a spinner beside a source still loading. Nothing when all are ok. */
export function PartialLine({ sources, words }: { sources: readonly SourceStatus[]; words: PartialWords }) {
  const notes = partialNotes(sources, words)
  if (!notes.length) return null
  return (
    <p role="status" className="flex flex-row flex-wrap items-center gap-x-3 gap-y-1 px-3 py-2 text-xs text-muted-foreground" data-kind-partial>
      {notes.map((n) => (
        <span key={n.name} className="inline-flex items-center gap-1" data-kind-partial-source={n.name} data-state={n.state}>
          {n.state === "pending" ? <Spinner aria-hidden className="size-3" /> : n.state === "timeout" || n.state === "error" ? <TriangleAlertIcon aria-hidden className="size-3 text-warning" /> : <LockIcon aria-hidden className="size-3" />}
          {n.text}
        </span>
      ))}
    </p>
  )
}

/* ---------------------------------------------------------------- results */

/** A record in a fan-out result: its URI, title, an optional subtitle, its kind and the name of its source (one of `sources`). */
export type KindRow = { uri: string; title: string; subtitle?: string; kind: string; source: string }

export type ResultsWords = {
  /** No record in any source (and none still loading). */
  empty: string
  /** Read aloud while every source is loading. */
  loading: string
  partial: PartialWords
}

export type KindResultsProps = {
  rows: readonly KindRow[]
  /** Every source asked, in the order to show them, each with its state. */
  sources: readonly SourceStatus[]
  /**
   * `grouped`: one section per source, in each source's own order (the
   * default, always allowed). `merged`: one list in the order given, each row
   * with its source; only for an order by a property every source declares
   * sortable (§9 rule 5), the caller's to know.
   */
  mode?: "grouped" | "merged"
  onSelect: (uri: string) => void
  /** The URI chosen now: its row carries a check. */
  selected?: string | null
  words: ResultsWords
  /** A search box at the top, in the same keyboard flow (the picker's). */
  search?: { value: string; onValueChange: (text: string) => void; placeholder: string }
  /** The list's accessible name. */
  label?: string
}

/** The sections of a grouped result: each source in its order with its rows; a source still loading and without rows keeps its place; an ok source without rows has none. */
export function groupRows(rows: readonly KindRow[], sources: readonly SourceStatus[]): { source: SourceStatus; rows: KindRow[] }[] {
  return sources.flatMap((source) => {
    const own = rows.filter((r) => r.source === source.name)
    return own.length || source.state === "pending" ? [{ source, rows: own }] : []
  })
}

function ResultRow({ row, source, showSource, selected, onSelect }: { row: KindRow; source: KindSource; showSource: boolean; selected: boolean; onSelect: (uri: string) => void }) {
  return (
    <CommandItem value={row.uri} onSelect={() => onSelect(row.uri)} data-checked={selected} data-kind-row={row.uri}>
      <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
        <KindGlyph kind={row.kind} />
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate">{row.title}</span>
        {row.subtitle ? <span className="truncate text-xs font-normal text-muted-foreground">{row.subtitle}</span> : null}
      </span>
      {showSource ? <SourceBadge {...source} /> : null}
    </CommandItem>
  )
}

function RowSkeleton() {
  return (
    <div className="flex flex-row items-center gap-2 px-3 py-2" aria-hidden>
      <Skeleton className="size-6 rounded-md" />
      <div className="flex flex-1 flex-col gap-1">
        <Skeleton className="h-3.5 w-40 max-w-full" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
  )
}

/**
 * A fan-out result (§9 rules 4–5), drawn from props: grouped by source (the
 * header is the source's badge and its count) or merged (each row with its
 * badge), keyboard navigable (arrows, Enter; the list takes focus with Tab),
 * an empty and a loading state, and the partial line under it.
 */
export function KindResults({ rows, sources, mode = "grouped", onSelect, selected = null, words, search, label }: KindResultsProps) {
  const byName = new Map(sources.map((s) => [s.name, s]))
  const sourceOf = (row: KindRow): KindSource => byName.get(row.source) ?? { name: row.source }
  const pending = sources.some((s) => s.state === "pending")
  const loading = !rows.length && pending
  const empty = !rows.length && !pending
  return (
    <Command shouldFilter={false} loop label={label} tabIndex={search ? -1 : 0} className="h-auto focus-visible:ring-2 focus-visible:ring-ring" data-kind-results={mode}>
      {search ? <CommandInput value={search.value} onValueChange={search.onValueChange} placeholder={search.placeholder} aria-label={search.placeholder} /> : null}
      <CommandList>
        {loading ? (
          <div aria-busy="true" aria-label={words.loading} data-kind-results-state="loading">
            <RowSkeleton />
            <RowSkeleton />
            <RowSkeleton />
          </div>
        ) : empty ? (
          <div className="py-6 text-center text-sm text-muted-foreground" data-kind-results-state="empty">
            {words.empty}
          </div>
        ) : mode === "merged" ? (
          <CommandGroup>
            {rows.map((row) => (
              <ResultRow key={row.uri} row={row} source={sourceOf(row)} showSource selected={row.uri === selected} onSelect={onSelect} />
            ))}
            {pending ? <RowSkeleton /> : null}
          </CommandGroup>
        ) : (
          groupRows(rows, sources).map((group) => (
            <CommandGroup
              key={group.source.name}
              data-kind-group={group.source.name}
              heading={
                <span className="flex flex-row items-center gap-2">
                  <SourceBadge name={group.source.name} icon={group.source.icon} />
                  {group.source.state === "pending" ? <Spinner aria-hidden className="size-3" /> : <span className="tabular-nums">{group.rows.length}</span>}
                </span>
              }
            >
              {group.rows.map((row) => (
                <ResultRow key={row.uri} row={row} source={group.source} showSource={false} selected={row.uri === selected} onSelect={onSelect} />
              ))}
              {!group.rows.length ? <RowSkeleton /> : null}
            </CommandGroup>
          ))
        )}
      </CommandList>
      <PartialLine sources={sources} words={words.partial} />
    </Command>
  )
}

/* ----------------------------------------------------------------- picker */

/** The field's value as the host resolved it for the viewer: the URI and what its chip shows. */
export type PickedRef = { uri: string; state: RefState; title?: string; source: KindSource; href?: string }

export type PickerWords = ResultsWords & {
  ref: RefWords
  /** The trigger with no value («Choose a customer»). */
  placeholder: string
  /** The search box's placeholder («Search people»). */
  search: string
  /** The clear button's label. */
  clear: string
}

export type CrossAppPickerProps = {
  /** The kind the field holds (its `ref: { kind }`). */
  kind: string
  kindLabel: string
  value: PickedRef | null
  onChange: (uri: string | null) => void
  /**
   * The search text, debounced inside by `debounceMs` (default 250 ms), and
   * called at once with the current text when the picker opens. The caller
   * answers with `rows` and `sources`.
   */
  onQuery: (text: string) => void
  debounceMs?: number
  rows: readonly KindRow[]
  sources: readonly SourceStatus[]
  /** Grouped by source by default (§9 rule 5). */
  mode?: "grouped" | "merged"
  words: PickerWords
  disabled?: boolean
  id?: string
  "aria-label"?: string
}

/**
 * A combobox for a form field holding a record URI of a kind (§3.2): the
 * trigger shows the chosen record as a RefChip (or the placeholder), the
 * popover a search box and the results by source with the partial line, and
 * a clear button sits beside the trigger. Props-driven: the caller fans out.
 */
export function CrossAppPicker({ kind, kindLabel, value, onChange, onQuery, debounceMs = 250, rows, sources, mode = "grouped", words, disabled, id, "aria-label": ariaLabel }: CrossAppPickerProps) {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState("")
  const query = useRef(onQuery)
  useEffect(() => {
    query.current = onQuery
  }, [onQuery])
  const asked = useRef<string | null>(null)

  useEffect(() => {
    if (!open) {
      asked.current = null
      return
    }
    // Opening asks at once; typing asks after the pause.
    const first = asked.current === null
    const ask = () => {
      asked.current = text
      query.current(text)
    }
    if (first) {
      ask()
      return
    }
    if (asked.current === text) return
    const timer = setTimeout(ask, debounceMs)
    return () => clearTimeout(timer)
  }, [open, text, debounceMs])

  return (
    <div className="flex w-full flex-row items-center gap-1" data-kind-picker={kind}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={<Button variant="outline" className="h-auto min-h-9 min-w-0 flex-1 justify-between" id={id} disabled={disabled} aria-label={ariaLabel ?? (value ? undefined : words.placeholder)} />}
        >
          {value ? (
            <span className="flex min-w-0 flex-1 justify-start">
              <RefChip state={value.state} title={value.title} kind={kind} kindLabel={kindLabel} source={value.source} words={words.ref} inert />
            </span>
          ) : (
            <span className="flex min-w-0 flex-1 items-center gap-2 font-normal text-muted-foreground">
              <KindGlyph kind={kind} />
              <span className="truncate">{words.placeholder}</span>
            </span>
          )}
          <ChevronsUpDownIcon aria-hidden className="size-4 shrink-0 opacity-50" />
        </PopoverTrigger>
        <PopoverContent align="start" className="w-(--anchor-width) min-w-80 p-0">
          <KindResults
            rows={rows}
            sources={sources}
            mode={mode}
            selected={value?.uri ?? null}
            words={words}
            label={kindLabel}
            search={{ value: text, onValueChange: setText, placeholder: words.search }}
            onSelect={(uri) => {
              onChange(uri)
              setOpen(false)
            }}
          />
        </PopoverContent>
      </Popover>
      {value ? (
        <Tooltip>
          <TooltipTrigger render={<Button variant="ghost" size="icon" aria-label={words.clear} disabled={disabled} onClick={() => onChange(null)} data-kind-picker-clear />}>
            <XIcon aria-hidden />
          </TooltipTrigger>
          <TooltipContent>{words.clear}</TooltipContent>
        </Tooltip>
      ) : null}
    </div>
  )
}
