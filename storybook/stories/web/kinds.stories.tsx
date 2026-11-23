import type { Meta, StoryObj } from "@storybook/react-native-web-vite"
import { BoxesIcon, ContactIcon, LandmarkIcon } from "lucide-react"
import { useEffect, useState, type ReactNode } from "react"

import { CrossAppPicker, KindResults, kindIcon, PartialLine, REF_STATES, RefChip, SourceBadge, type KindRow, type KindSource, type PickedRef, type PickerWords, type RefState, type SourceStatus } from "@clegra/ui/records/kinds"

/**
 * The host's kind components (`@clegra/ui/records/kinds`):
 * what Clegra draws when records of several apps meet by kind (@clegra/sdk docs/spec.md
 * §3.1, §3.2, §9). Invented data: a CRM, a Warehouse and an ERP. The client
 * gives every word from its i18n catalogs; here they are English.
 */
const meta = { title: "Web/Records/Kinds" } satisfies Meta
export default meta
type Story = StoryObj

const icons = { CRM: <ContactIcon />, Warehouse: <BoxesIcon />, ERP: <LandmarkIcon /> }
const crm = { name: "CRM", icon: icons.CRM }
const warehouse = { name: "Warehouse", icon: icons.Warehouse }
const erp = { name: "ERP", icon: icons.ERP }

const words: PickerWords = {
  empty: "No records match.",
  loading: "Loading results",
  partial: {
    timeout: (app) => `${app} did not answer`,
    error: (app) => `${app} had an error`,
    noAccess: (app) => `${app}: no access`,
    notLinked: (app) => `${app}: link your account`,
    pending: (app) => `${app}: loading…`,
  },
  ref: { noAccess: "No access", notLinked: (app) => `Link your ${app} account`, gone: "Deleted", unreachable: (app) => `${app} didn't answer`, unknownApp: "App not in this workspace" },
  placeholder: "Choose a customer",
  search: "Search organizations",
  clear: "Clear",
}

const organizations: KindRow[] = [
  { uri: "clegra://crm/company/41", title: "Greenfield Retail", subtitle: "Leeds · 12 open deals", kind: "organization", source: "CRM" },
  { uri: "clegra://crm/company/77", title: "Harbour & Finch", subtitle: "Bristol", kind: "organization", source: "CRM" },
  { uri: "clegra://erp/customer/1203", title: "Greenfield Retail Ltd", subtitle: "GB123456789 · 4 open orders", kind: "organization", source: "ERP" },
  { uri: "clegra://erp/customer/988", title: "Northgate Supplies", subtitle: "GB987654321", kind: "organization", source: "ERP" },
  { uri: "clegra://warehouse/consignee/5", title: "Greenfield Retail — Leeds depot", subtitle: "Dock 3", kind: "organization", source: "Warehouse" },
]
const mixed: KindRow[] = [
  { uri: "clegra://crm/contact/9", title: "Ada Fernley", subtitle: "ada.fernley@greenfield.example", kind: "person", source: "CRM" },
  { uri: "clegra://erp/customer/1203", title: "Greenfield Retail Ltd", subtitle: "GB123456789", kind: "organization", source: "ERP" },
  { uri: "clegra://warehouse/item/A-220", title: "Oak shelf, 80 cm", subtitle: "SKU A-220 · 34 in stock", kind: "product", source: "Warehouse" },
  { uri: "clegra://erp/order/SO-4471", title: "SO-4471", subtitle: "Greenfield Retail Ltd · 2 Dec", kind: "order", source: "ERP" },
  { uri: "clegra://crm/meeting/3", title: "Quarterly review", subtitle: "Thu 4 Dec, 10:00", kind: "event", source: "CRM" },
  { uri: "clegra://warehouse/shipment/88", title: "Shipment 88", subtitle: "com.acme.shipment", kind: "com.acme.shipment", source: "Warehouse" },
]
const allOk: SourceStatus[] = [{ ...crm, state: "ok" }, { ...erp, state: "ok" }, { ...warehouse, state: "ok" }]

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-sm font-semibold text-muted-foreground">{title}</h3>
      {children}
    </section>
  )
}

function Panel({ children }: { children: ReactNode }) {
  return <div className="w-full max-w-md overflow-hidden rounded-3xl border border-border bg-popover">{children}</div>
}

/* --------------------------------------------------------------- chips */

const refs: { state: RefState; title?: string; source: KindSource }[] = [
  { state: "ok", title: "Ada Fernley", source: crm },
  { state: "no-access", source: erp },
  { state: "gone", source: crm },
  { state: "unreachable", source: warehouse },
  { state: "unknown-app", source: { name: "billing" } },
]

function Chips() {
  return (
    <div className="flex flex-col gap-8">
      <Section title="Kind icons">
        <div className="flex flex-row flex-wrap gap-4 text-sm">
          {["person", "organization", "event", "task", "document", "product", "order", "com.acme.shipment"].map((kind) => {
            const Icon = kindIcon(kind)
            return (
              <span key={kind} className="inline-flex items-center gap-1.5">
                <Icon className="size-4" /> {kind}
              </span>
            )
          })}
        </div>
      </Section>
      <Section title="Source badges">
        <div className="flex flex-row flex-wrap gap-2">
          <SourceBadge {...crm} />
          <SourceBadge {...warehouse} />
          <SourceBadge {...erp} title="ERP · erp.greenfield.example" />
          <SourceBadge name="A very long application name in this workspace" />
        </div>
      </Section>
      <Section title="Reference chips, every state (hover for the tooltip)">
        <div className="flex flex-col items-start gap-2">
          {refs.map((r) => (
            <div key={r.state} className="flex flex-row items-center gap-3">
              <code className="w-24 text-xs text-muted-foreground">{r.state}</code>
              <RefChip state={r.state} title={r.title} kind="person" kindLabel="Person" source={r.source} href={r.state === "ok" ? "#ada" : undefined} words={words.ref} />
            </div>
          ))}
        </div>
      </Section>
      <Section title="In running text">
        <p className="max-w-md text-sm leading-7">
          The deal is for <RefChip state="ok" title="Greenfield Retail Ltd" kind="organization" kindLabel="Organization" source={erp} onOpen={() => {}} words={words.ref} />, owned by{" "}
          <RefChip state="no-access" kind="person" kindLabel="Person" source={crm} words={words.ref} />, shipping from <RefChip state="unreachable" kind="com.acme.shipment" kindLabel="Shipment" source={warehouse} words={words.ref} />.
        </p>
      </Section>
    </div>
  )
}

export const ReferenceChips: Story = { globals: { theme: "light" }, render: () => <Chips /> }
export const ReferenceChipsDark: Story = { name: "Reference chips (dark)", globals: { theme: "dark" }, render: () => <Chips /> }

/* ------------------------------------------------------- partial line */

function Partials() {
  return (
    <div className="flex flex-col gap-6">
      <Section title="Some sources not ok">
        <Panel>
          <PartialLine
            sources={[
              { ...erp, state: "timeout" },
              { ...crm, state: "not-linked" },
              { ...warehouse, state: "no-access" },
            ]}
            words={words.partial}
          />
        </Panel>
      </Section>
      <Section title="An error and a source still loading">
        <Panel>
          <PartialLine
            sources={[
              { ...crm, state: "ok" },
              { ...erp, state: "error" },
              { ...warehouse, state: "pending" },
            ]}
            words={words.partial}
          />
        </Panel>
      </Section>
      <Section title="All ok: nothing">
        <Panel>
          <PartialLine sources={allOk} words={words.partial} />
          <span className="block px-3 py-2 text-xs text-muted-foreground">(the line renders nothing)</span>
        </Panel>
      </Section>
    </div>
  )
}

export const PartialLines: Story = { globals: { theme: "light" }, render: () => <Partials /> }
export const PartialLinesDark: Story = { name: "Partial lines (dark)", globals: { theme: "dark" }, render: () => <Partials /> }

/* ------------------------------------------------------------ results */

function Results({ rows, sources, mode }: { rows: KindRow[]; sources: SourceStatus[]; mode?: "grouped" | "merged" }) {
  const [selected, setSelected] = useState<string | null>(null)
  return (
    <Panel>
      <KindResults rows={rows} sources={sources} mode={mode} selected={selected} onSelect={setSelected} words={words} label="Organizations" />
    </Panel>
  )
}

function AllResults() {
  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
      <Section title="Grouped by source (default)">
        <Results rows={organizations} sources={allOk} />
      </Section>
      <Section title="Merged (a shared sortable order), each row with its source">
        <Results rows={mixed} sources={allOk} mode="merged" />
      </Section>
      <Section title="Partial: the ERP timed out, the Warehouse needs linking">
        <Results rows={organizations.filter((r) => r.source === "CRM")} sources={[{ ...crm, state: "ok" }, { ...erp, state: "timeout" }, { ...warehouse, state: "not-linked" }]} />
      </Section>
      <Section title="One source still loading">
        <Results rows={organizations.filter((r) => r.source !== "Warehouse")} sources={[{ ...crm, state: "ok" }, { ...erp, state: "ok" }, { ...warehouse, state: "pending" }]} />
      </Section>
      <Section title="Loading (every source pending)">
        <Results rows={[]} sources={allOk.map((s) => ({ ...s, state: "pending" as const }))} />
      </Section>
      <Section title="Empty">
        <Results rows={[]} sources={allOk} />
      </Section>
      <Section title="Empty and partial">
        <Results rows={[]} sources={[{ ...crm, state: "ok" }, { ...erp, state: "error" }, { ...warehouse, state: "no-access" }]} />
      </Section>
    </div>
  )
}

export const KindResultsStates: Story = { name: "Kind results", globals: { theme: "light" }, render: () => <AllResults /> }
export const KindResultsStatesDark: Story = { name: "Kind results (dark)", globals: { theme: "dark" }, render: () => <AllResults /> }

/* ------------------------------------------------------------- picker */

/** A pretend fan-out: the CRM answers fast, the ERP slowly, the Warehouse never (it times out after 3 s). */
function useFanOut() {
  const [query, setQuery] = useState<string | null>(null)
  const [sources, setSources] = useState<SourceStatus[]>(allOk)
  const [rows, setRows] = useState<KindRow[]>([])
  useEffect(() => {
    if (query === null) return
    const match = (source: string) => organizations.filter((r) => r.source === source && r.title.toLowerCase().includes(query.toLowerCase()))
    setRows([])
    setSources([{ ...crm, state: "pending" }, { ...erp, state: "pending" }, { ...warehouse, state: "pending" }])
    const settle = (name: string, state: SourceStatus["state"], found: KindRow[]) => {
      setSources((all) => all.map((s) => (s.name === name ? { ...s, state } : s)))
      setRows((all) => [...all, ...found])
    }
    const timers = [setTimeout(() => settle("CRM", "ok", match("CRM")), 300), setTimeout(() => settle("ERP", "ok", match("ERP")), 1200), setTimeout(() => settle("Warehouse", "timeout", []), 3000)]
    return () => timers.forEach(clearTimeout)
  }, [query])
  return { rows, sources, onQuery: setQuery }
}

const resolved = (uri: string): PickedRef => {
  const row = organizations.find((r) => r.uri === uri)!
  const source = [crm, erp, warehouse].find((s) => s.name === row.source)!
  return { uri, state: "ok", title: row.title, source }
}

function LivePicker({ id, initial = null }: { id: string; initial?: PickedRef | null }) {
  const fan = useFanOut()
  const [value, setValue] = useState<PickedRef | null>(initial)
  return (
    <div className="flex max-w-md flex-col gap-2">
      <label className="text-sm font-medium" htmlFor={id}>
        Customer
      </label>
      <CrossAppPicker id={id} kind="organization" kindLabel="Organization" value={value} onChange={(uri) => setValue(uri ? resolved(uri) : null)} {...fan} words={words} />
      <code className="text-xs text-muted-foreground">{value?.uri ?? "null"}</code>
    </div>
  )
}

function StaticPicker({ value }: { value: PickedRef | null }) {
  return <CrossAppPicker kind="organization" kindLabel="Organization" value={value} onChange={() => {}} onQuery={() => {}} rows={organizations} sources={allOk} words={words} />
}

function Pickers() {
  return (
    <div className="flex flex-col gap-8">
      <Section title="Live (type to search: the CRM answers at once, the ERP after a second, the Warehouse times out)">
        <LivePicker id="customer" />
      </Section>
      <Section title="With a value">
        <LivePicker id="customer-chosen" initial={resolved("clegra://erp/customer/1203")} />
      </Section>
      <Section title="The chosen value in each state">
        <div className="flex max-w-md flex-col gap-2">
          {REF_STATES.map((state) => (
            <StaticPicker key={state} value={{ uri: `clegra://erp/customer/${state}`, state, title: state === "ok" ? "Greenfield Retail Ltd" : undefined, source: state === "unknown-app" ? { name: "billing" } : erp }} />
          ))}
        </div>
      </Section>
    </div>
  )
}

export const CrossAppPickerStory: Story = { name: "Cross-app picker", globals: { theme: "light" }, render: () => <Pickers /> }
export const CrossAppPickerDark: Story = { name: "Cross-app picker (dark)", globals: { theme: "dark" }, render: () => <Pickers /> }
