import type { ReactNode } from "react"

import { ChartComponent, FormComponent, RecordCard, StatComponent, TableComponent, ViewState, type FormFieldSpec } from "./catalogue"
import { derive, format } from "@clegra/ui/records/derive"
import { Callout, Code, DataTable, Devices, DocPage, DoDont, Notes, Platforms, Section } from "./doc"
import type { Kit } from "./kit"
import { columns, labels, shipment, shipments, weekly } from "./samples"

/**
 * DECLARED VIEWS (Apps › Declared views): what a page of an application shows,
 * described as data in the manifest (`pages[].view`) and drawn by Clegra. The
 * `View` union of contract v1: table, cards, detail, form, chart, number,
 * frame (and `native`, for Clegra's own built-in applications only).
 */

function ViewPage({ type, lead, example, options, limits, render, doThis, dont, a11y, extra }: { type: string; lead: string; example: string; options: string[][]; limits?: string; render: (kit: Kit, device: "desktop" | "ipad" | "iphone") => ReactNode; doThis: string[]; dont: string[]; a11y: string[]; extra?: ReactNode }) {
  return (
    <DocPage title={`View: ${type}`} lead={lead}>
      <Section title="On web, Mac, iPad and iPhone" lead="Reference renderings from the design library. The iPad is the web's layout with native controls; the iPhone is its compact form.">
        <Devices>{render}</Devices>
      </Section>
      <Section title="Options" lead={limits}>
        <DataTable head={["Option", "Type", "What it does"]} rows={options} />
        <Code label="manifest.ts">{example}</Code>
      </Section>
      {extra}
      <Section title="Do and don't">
        <DoDont doThis={doThis} dont={dont} />
      </Section>
      <Section title="Accessibility">
        <Notes items={a11y} />
      </Section>
    </DocPage>
  )
}

const SOURCE = ["source", "{ action, input?, rows? }", "One of your read actions, with fixed arguments; `rows` names the field of the result that holds the rows."]

export const TableViewPage = () => (
  <ViewPage
    type="table"
    lead="Rows and columns from a read action: the default for anything people scan, search and open."
    limits="1 to 20 columns."
    options={[SOURCE, ["columns", "Column[]", "`{ field, label, format?, labels? }`. Formats: text, number, money, date, badge, link."], ["rowLink", "string", "A page's path with row fields in braces: `/shipments/{tracking}`. The first column becomes the link."], ["search", "boolean", "A search box above the table; what is typed reaches the action as `query`."]]}
    example={`{ type: "table", source: { action: "spedizioni_search", rows: "rows" }, search: true,
  rowLink: "/shipments/{tracking}",
  columns: [
    { field: "tracking", label: "Numero" },
    { field: "customer", label: "Cliente" },
    { field: "status", label: "Stato", format: "badge", labels: "shipmentStatus" },
    { field: "eta", label: "Consegna", format: "date" },
    { field: "cost", label: "Costo", format: "money" },
  ] }`}
    render={(kit, device) =>
      device === "iphone" ? (
        <kit.Div className="flex flex-col gap-2">
          {shipments.map((row, i) => (
            <kit.Div key={i} className="flex flex-col gap-1 rounded-xl border border-border p-3">
              <kit.Span className="text-sm font-medium">{String(row.tracking)}</kit.Span>
              {columns.slice(1).map((c) => (
                <kit.Div key={c.field} className="flex flex-row items-center justify-between gap-4">
                  <kit.Span className="text-sm text-muted-foreground">{c.label}</kit.Span>
                  <kit.Span className="text-sm">{format(row[c.field], c.format, c.labels ? labels[c.labels] : undefined)}</kit.Span>
                </kit.Div>
              ))}
            </kit.Div>
          ))}
        </kit.Div>
      ) : (
        <TableComponent kit={kit} columns={device === "ipad" ? columns.slice(0, 4) : columns} rows={shipments} labels={labels} />
      )
    }
    doThis={["Put the column people recognise a row by first: it is the link and, on iPhone, the row's title.", "Add `search` when the action can filter: people expect to type.", "Use `badge` with `labels` for states."]}
    dont={["Don't exceed 6 or 7 columns for everyday use: beyond that the iPad drops the last ones into the detail.", "Don't send formatted strings for numbers, money or dates.", "Don't make a table of one row: that is a detail."]}
    a11y={["Column headers are real headers; the search box has a label («Cerca spedizioni»).", "The row's link is the first cell's text, so it reads «SP-2026-0481, link».", "On iPhone each row is one group read as «label, value» pairs; rows are at least 44 pt tall."]}
  />
)

export const CardsViewPage = () => (
  <ViewPage
    type="cards"
    lead="One card per row: a title, a line under it, a few labelled values. For things people recognise by name more than compare by column."
    limits="At most 12 fields per card."
    options={[SOURCE, ["title", "string", "The row's field shown as the card's heading."], ["subtitle", "string", "The row's field shown under it."], ["fields", "Column[]", "Labelled values on the card."], ["link", "string", "A page's path with row fields in braces: the title becomes a link."]]}
    example={`{ type: "cards", source: { action: "spedizioni_search", rows: "rows" },
  title: "tracking", subtitle: "customer", link: "/shipments/{tracking}",
  fields: [
    { field: "status", label: "Stato", format: "badge", labels: "shipmentStatus" },
    { field: "eta", label: "Consegna", format: "date" },
  ] }`}
    render={(kit, device) => (
      <kit.Div className={`flex gap-3 ${device === "iphone" ? "flex-col" : "flex-row flex-wrap"}`}>
        {shipments.slice(0, device === "iphone" ? 2 : 3).map((row, i) => {
          const d = derive(shipment, row, "row", labels)
          return (
            <kit.Div key={i} className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4" style={device === "iphone" ? undefined : { width: 230 }}>
              <kit.Div className="flex flex-col">
                <kit.Span className="text-sm font-medium">{String(row.tracking)}</kit.Span>
                <kit.Span className="text-sm text-muted-foreground">{String(row.customer)}</kit.Span>
              </kit.Div>
              <kit.Div className="flex flex-row items-center justify-between gap-4">
                <kit.Span className="text-sm text-muted-foreground">Stato</kit.Span>
                <kit.Badge variant="outline">{d.status?.text}</kit.Badge>
              </kit.Div>
              <kit.Div className="flex flex-row items-center justify-between gap-4">
                <kit.Span className="text-sm text-muted-foreground">Consegna</kit.Span>
                <kit.Span className="text-sm">{format(row.eta, "date")}</kit.Span>
              </kit.Div>
            </kit.Div>
          )
        })}
      </kit.Div>
    )}
    doThis={["Keep cards to 2 to 4 fields: three columns on the web, two on iPad, one on iPhone.", "Use cards for a home widget (medium and large): they read at a glance."]}
    dont={["Don't use cards for more than about 30 items: a table with search scans faster.", "Don't put actions on a page's cards: a card opens its detail; actions live there and on artifacts."]}
    a11y={["A list of items; each card's heading is its title.", "The whole title is the link target; fields are read as «label, value»."]}
  />
)

export const DetailViewPage = () => (
  <ViewPage
    type="detail"
    lead="One record, in titled sections of labelled values. Where a table's row link and a card's link lead."
    limits="1 to 12 sections, 1 to 30 fields each."
    options={[SOURCE, ["sections", "{ title, fields: Column[] }[]", "Each section is a titled group. Two columns of sections on the web and iPad, one on iPhone."]]}
    example={`{ type: "detail", source: { action: "spedizioni_get" },
  sections: [
    { title: "Consegna", fields: [
      { field: "destination", label: "Destinazione" },
      { field: "eta", label: "Consegna prevista", format: "date" } ] },
    { title: "Collo", fields: [
      { field: "parcels", label: "Colli", format: "number" },
      { field: "insured", label: "Assicurata", format: "money" } ] },
  ] }`}
    render={(kit, device) => (
      <kit.Div className={`flex gap-4 ${device === "iphone" ? "flex-col" : "flex-row"}`}>
        {shipment.groups!.map((g) => (
          <kit.Div key={g.title} className="flex flex-1 flex-col gap-2 rounded-xl border border-border p-4">
            <kit.Span className="text-sm font-semibold">{g.title}</kit.Span>
            {g.fields.map((c) => (
              <kit.Div key={c.field} className="flex flex-row items-center justify-between gap-4">
                <kit.Span className="text-sm text-muted-foreground">{c.label}</kit.Span>
                <kit.Span className="text-sm">{format(shipments[0]![c.field], c.format)}</kit.Span>
              </kit.Div>
            ))}
          </kit.Div>
        ))}
      </kit.Div>
    )}
    doThis={["Group by what people look for («Consegna», «Collo»), not by where the data comes from.", "Put what changes most (status, dates) in the first section."]}
    dont={["Don't repeat the page's title as the first field.", "Don't show empty sections: leave a field out and Clegra shows «—» only for single missing values."]}
    a11y={["Each section is a heading followed by a description list.", "A missing value is read as «non disponibile», not as a dash."]}
  />
)

const formFields: FormFieldSpec[] = [
  { id: "customer", label: "Cliente", type: "text", required: true },
  { id: "parcels", label: "Colli", type: "number", required: true, hint: "Da 1 a 99." },
  { id: "eta", label: "Consegna entro", type: "date" },
  { id: "service", label: "Servizio", type: "choice", options: ["Standard", "Espresso 24h"] },
]

export const FormViewPage = () => (
  <ViewPage
    type="form"
    lead="Fields whose answers are the input of one of your write actions. Clegra checks them against the action's input schema, in the browser and again on the host, then runs the action as the person."
    limits="1 to 20 fields, unique ids. Not allowed on a home widget."
    options={[["fields", "FormField[]", "`{ id, label, type, required?, options? }`. `id` is the property of the action's input that receives the answer. Types: text, long-text, number, date, choice."], ["submit", "string", "One of your write actions."], ["submitLabel", "string (≤ 40)", "The button. Default «Invia»."], ["success", "string (≤ 300)", "The message once done."]]}
    example={`{ type: "form", submit: "spedizioni_create", submitLabel: "Crea la spedizione",
  success: "Spedizione creata.",
  fields: [
    { id: "customer", label: "Cliente", type: "text", required: true },
    { id: "parcels", label: "Colli", type: "number", required: true },
    { id: "eta", label: "Consegna entro", type: "date" },
    { id: "service", label: "Servizio", type: "choice", options: ["Standard", "Espresso 24h"] },
  ] }`}
    render={(kit) => <FormComponent kit={kit} fields={formFields} submitLabel="Crea la spedizione" />}
    doThis={["Ask only what the action needs; mark what is required.", "Write the button as the outcome: «Crea la spedizione».", "Write `success` as a fact: «Spedizione creata.»"]}
    dont={["Don't build wizards out of several form pages: one action, one form.", "Don't validate in your own words on the server what the schema can say: schema messages appear next to the field before sending."]}
    a11y={["Labels are tied to their controls; errors are announced and tied to the field.", "The keyboard matches the type (decimal pad for numbers); dates use the system's picker on iPhone and iPad.", "After sending, focus moves to the success message."]}
  />
)

export const ChartViewPage = () => (
  <ViewPage
    type="chart"
    lead="One point, bar or slice per row of a read action."
    limits="1 to 4 series; a pie has 1."
    options={[SOURCE, ["chart", '"bar" | "line" | "area" | "pie"', "Default: bar."], ["category", "string", "The row's field that labels each point."], ["series", "{ field, label, format? }[]", "The numbers drawn. `money` is drawn in euro and needs the prices permission."]]}
    example={`{ type: "chart", chart: "bar", source: { action: "spedizioni_weekly", rows: "weeks" },
  category: "week",
  series: [
    { field: "shipments", label: "Spedizioni" },
    { field: "delayed", label: "In ritardo" },
  ] }`}
    render={(kit) => <ChartComponent kit={kit} rows={weekly} category="week" series={[{ field: "shipments", label: "Spedizioni" }, { field: "delayed", label: "In ritardo" }]} />}
    doThis={["Return the rows already aggregated and in order.", "Label series with words people use."]}
    dont={["Don't choose colours or put the accent in a chart.", "Don't use a pie for more than 5 parts."]}
    a11y={["The data is also available as a table to assistive technology.", "Series are told apart by label and position, not by colour alone."]}
  />
)

export const NumberViewPage = () => (
  <ViewPage
    type="number"
    lead="One figure with its label: a page's headline number, and the home's small widget."
    options={[SOURCE, ["field", "string", "The field of the result that holds the number."], ["label", "string (≤ 80)", "What the number counts."], ["format", '"number" | "money"', "Money is in euro and follows the prices permission."]]}
    example={`{ type: "number", source: { action: "spedizioni_stats" },
  field: "in_transit", label: "Spedizioni in viaggio" }`}
    render={(kit) => <StatComponent kit={kit} label="Spedizioni in viaggio" value="12" />}
    doThis={["Say what is counted in the label."]}
    dont={["Don't use a number view for text or for a percentage with no base."]}
    a11y={["Read as «label, value». A missing value reads «non disponibile»."]}
  />
)

const FRAME_VIEW = `// manifest.ts
pages: [{ id: "map", path: "/map", title: "Mappa", permission: "spedizioni_shipments.view",
  view: { type: "frame", resource: "ui://spedizioni/map", height: 520 } }]`

export function FrameViewPage() {
  return (
    <DocPage title="View: frame" lead="The escape hatch: the application's own drawing, an MCP Apps view (a `ui://` HTML resource served by the application's MCP server) that Clegra shows in a sandboxed frame. Never the default.">
      <Callout>Data first: if a table, cards, a detail, a form, a chart or a number can say it, declare it. Clegra then draws it natively on every device, the assistant can use it in answers, and it can be read aloud. A frame is web content on every device and opaque to the assistant.</Callout>
      <Section title="When a frame is justified">
        <DoDont
          doThis={["The content is spatial or continuous: a map, a floor plan, a Gantt, a diagram, a canvas.", "The interaction is direct manipulation: dragging, drawing, a visual editor, a designer.", "It renders a medium Clegra has no view for: a 3D model, a specialised viewer, a waveform.", "It needs a custom live visualisation that roles and charts can't carry."]}
          dont={["Not to restyle a list, a card or a form with your brand.", "Not because the data is «special»: bind its roles first, then see what is missing.", "Not for navigation, settings, sign-in or onboarding: those are the host's.", "Not to show another product's whole web app inside Clegra."]}
        />
      </Section>
      <Section title="Options">
        <DataTable head={["Option", "Type", "What it does"]} rows={[["resource", "ui://<app>/<name>", "The view's HTML resource (MIME `text/html;profile=mcp-app`), read from your MCP server."], ["height", "integer, 100 to 4000", "The frame's starting height. The view then reports its content's size and Clegra fits the frame to it."]]} />
        <Code label="manifest.ts">{FRAME_VIEW}</Code>
      </Section>
      <Section title="What a frame must still do" lead="A frame is inside Clegra's page: it follows the look it is given and brings its own states.">
        <Notes
          items={[
            <>
              Wrap it in <code>{"<ClegraProvider>"}</code> from <code>@clegra/ui/frame</code> (Apps › Frame theming): light or dark, the account&apos;s scheme, the tokens, the person&apos;s text size and locale.
            </>,
            "Bring loading, empty and error states of your own (Apps › States shows the components).",
            "No fixed heights on your content: report the size and let the frame grow; the page scrolls, not the frame.",
            "No navigation chrome, no second accent colour, no dialogs that imitate Clegra's.",
            "Give every artifact that has a frame its roles too: the row, the chip and the spoken sentence are always drawn by Clegra.",
          ]}
        />
      </Section>
    </DocPage>
  )
}

export function ViewStatesPage() {
  return (
    <DocPage title="States" lead="Every data view has four states beside its data. For declared views Clegra draws them; a frame draws its own with the same components and the same words.">
      {(
        [
          ["loading", "Loading", "Skeletons in the shape of what is coming, after 300 ms (nothing flashes for a fast answer). No spinner for a whole page."],
          ["empty", "Empty", "Say what would be here and how to get the first one. One action at most."],
          ["error", "Error", "What failed, in the person's words, and what to do. Never a code or a stack trace."],
          ["unreachable", "Unreachable", "The application's server did not answer. Clegra says so with the time of the last contact and «Riprova». Old data is never shown as current."],
        ] as const
      ).map(([state, title, lead]) => (
        <Section key={state} title={title} lead={lead}>
          <Platforms>{(kit) => <ViewState kit={kit} state={state} />}</Platforms>
        </Section>
      ))}
      <Section title="Copy" lead="Italian, plain, in the «tu» form, one sentence.">
        <DataTable
          head={["State", "Write", "Not"]}
          rows={[
            ["empty", "«Nessuna spedizione. Le spedizioni compaiono qui appena ne crei una.»", "«Non ci sono dati da visualizzare»"],
            ["error", "«Non siamo riusciti a caricare le spedizioni. Riprova tra poco.»", "«Errore 500» · «Qualcosa è andato storto!»"],
            ["unreachable", "«Spedizioni non raggiungibile · Ultimo contatto 10:42»", "«Timeout di rete»"],
            ["no access", "«Non hai accesso a questo contenuto di Spedizioni»", "The record's title, or «Vietato»"],
          ]}
        />
      </Section>
    </DocPage>
  )
}

export function ViewsOverviewPage() {
  return (
    <DocPage title="Declared views" lead="Data first: an application describes what a page shows as data, and Clegra lays it out. The same declaration is a native screen on iPhone and iPad, a page on the web and the Mac, a widget on the home.">
      <Section title="The views of contract v1">
        <DataTable
          head={["type", "Shows", "Web and Mac", "iPad", "iPhone"]}
          rows={[
            ["table", "Rows and columns from a read action", "Table, optional search box", "Table; the last columns move to the detail when they don't fit", "A list: first column as title, the others as labelled values"],
            ["cards", "One card per row", "Grid, 3 columns", "Grid, 2 columns", "One column"],
            ["detail", "One record in titled sections", "Sections in 2 columns", "Sections in 2 columns", "Grouped list, one section after the other"],
            ["form", "Fields that feed a write action", "Fields and a button, max 28 rem wide", "The same, native controls", "Grouped form, native controls, the button above the keyboard"],
            ["chart", "Bars, a line, an area, a pie", "Chart with legend and tooltip", "Swift Charts", "Swift Charts, full width"],
            ["number", "One figure with its label", "Stat tile", "Stat tile", "Stat tile"],
            ["frame", "The application's own drawing (MCP Apps view)", "Sandboxed iframe", "Web view", "Web view"],
            ["native", "Clegra's built-in applications only", "—", "—", "—"],
          ]}
        />
        <Callout>Status of the renderers: the web and Mac client draws table, cards, detail, form, chart and number today. On iPhone and iPad the home draws number, cards and chart; full pages of installed applications and frames are being built. The device renderings in this section are the design library&apos;s reference for that work.</Callout>
      </Section>
      <Section title="Planned, not in contract v1" lead="Named in the platform plan and additive later. Don't build on them yet.">
        <DataTable head={["type", "For"]} rows={[["list", "Rows without columns. Today: `cards` without fields, or an artifact type's list form."], ["board", "Records in columns by status (a kanban)."], ["calendar", "Records on days and hours by their date."], ["split", "A list beside the selected record's detail."], ["timeline", "Records ordered by date as a page (the catalogue's `timeline` exists for answers)."]]} />
      </Section>
      <Section title="A page and its artifact">
        <Notes
          items={[
            "A page view shows many records inside the application. An artifact type (Apps › Catalogue › Record) is one record shown outside it: in an answer, on the home, in a space.",
            "Both are data. Declare the artifact type's roles and the page's columns from the same fields, and the record looks the same everywhere.",
          ]}
        />
        <Platforms>{(kit) => <RecordCard kit={kit} type={shipment} data={shipments[0]!} labels={labels} />}</Platforms>
      </Section>
    </DocPage>
  )
}
