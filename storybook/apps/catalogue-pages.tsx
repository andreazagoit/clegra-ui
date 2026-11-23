import { ChartComponent, FormComponent, ListComponent, RecordCard, RecordChip, RecordDetail, RecordRow, RecordSpoken, RecordState, StatComponent, TableComponent, TimelineComponent, type FormFieldSpec } from "./catalogue"
import { SURFACE_RULES, SURFACES, type Surface } from "@clegra/ui/records/derive"
import { Callout, Code, DataTable, Devices, DocPage, DoDont, Notes, Platforms, Schemes, Section } from "./doc"
import { webKit } from "./kit"
import { columns, labels, shipment, shipments, weekly } from "./samples"

/**
 * THE CATALOGUE (Apps › Catalogue): the components the host draws from typed
 * data and the assistant composes answers from. The names are the contract's
 * (CATALOGUE_COMPONENTS, SEMANTIC_ROLES, ARTIFACT_SURFACES).
 */

const record = shipments[0]!
const common = { type: shipment, data: record, labels }

export const ROLE_ROWS: string[][] = [
  ["title", "string, required", "A template with fields in braces: \"{tracking} · {customer}\". The record's name on every surface."],
  ["subtitle", "string", "A template: one secondary line."],
  ["status", "{ field, labels?, tones? }", "A state word. `labels` names a list of the manifest's labels; `tones` maps values to neutral, info, success, warning, danger."],
  ["amount", "{ field }", "Money in euro. Hidden from a viewer without the type's `prices` permission."],
  ["date", "{ field }", "The record's main date (ISO date or date-time). Orders a timeline."],
  ["person", "{ field }", "A person of the company: shown with their avatar and name."],
  ["quantity", "{ field, unit? }", "A number that is not money: «3 colli»."],
  ["image", "{ field }", "An https image address: the card's picture."],
  ["place", "{ field }", "An address or a place name."],
  ["progress", "{ field }", "0 to 1: a progress bar."],
]

const MANIFEST = `artifacts: [{
  id: "shipment",                        // clegra://spedizioni/shipment/<id>
  name: "Spedizione", plural: "Spedizioni", icon: "package",
  permission: "spedizioni_shipments.view",
  prices: "spedizioni_shipments.prices",
  schema: { type: "object", properties: { tracking: { type: "string" }, /* … */ } },
  roles: {
    title: "{tracking} · {customer}",
    subtitle: "{destination}",
    status: { field: "status", labels: "shipmentStatus",
              tones: { in_transit: "info", delivered: "success", delayed: "danger" } },
    amount: { field: "cost" },
    date: { field: "eta" },
    person: { field: "owner" },
    quantity: { field: "parcels", unit: "colli" },
    progress: { field: "progress" },
  },
  fields: [
    { field: "carrier", label: "Corriere" },
    { field: "weight", label: "Peso (kg)", format: "number" },
  ],
  groups: [{ title: "Consegna", fields: [{ field: "eta", label: "Consegna prevista", format: "date" }] }],
  summary: "Spedizione {tracking} per {customer}: {statusWord}, consegna prevista il {etaWord}.",
  actions: [
    { id: "open", label: "Apri in Spedizioni", page: "shipment" },
    { id: "notify", label: "Avvisa il cliente", action: "spedizioni_notify_customer" },
  ],
}]`

const surfaceWhere: Record<Surface, string> = {
  detail: "The opened record: a page, a sheet on iPhone.",
  card: "An answer of the assistant's, the home (at a widget size), a space's board, a chat.",
  row: "A line of a list, a search result, a notification.",
  chip: "Inline in text: a mention, a citation, a context item.",
  spoken: "The voice assistant, a notification's text, the plain-text fallback.",
}

export function RecordPage() {
  return (
    <DocPage title="Record" lead="One record of an application, drawn by Clegra from typed data. The application sends the data and says what each field means (its roles); Clegra lays it out on every surface and device.">
      <Callout>
        The assistant places it with <code>{'{ component: "record", uri, surface? }'}</code>. Only URIs returned by that turn&apos;s tools, only the actions the type declares: the model never retypes data.
      </Callout>
      <Section title="Semantic roles" lead="Roles bind fields of the record's data to meanings. Only `title` is required; a role you leave out is simply not shown. Core in contract v1: title, subtitle, status, amount, date, person; extended: quantity, image, place, progress.">
        <DataTable head={["Role", "Shape", "Meaning"]} rows={ROLE_ROWS} />
        <Notes
          items={[
            <>
              <code>fields</code> (up to 12 columns, most important first): the host shows as many as the surface fits. Formats: text, number, money, date, badge, link.
            </>,
            <>
              <code>groups</code>: titled groups of fields for the full surface. Meaning, not layout.
            </>,
            <>
              <code>summary</code>: a template for one sentence. Without it the host says «{"{type} {title}, {status}, {amount}"}».
            </>,
          ]}
        />
      </Section>
      <Section title="Surfaces" lead="The same record, from the most to the least room. An application never chooses the surface: the place does.">
        <DataTable head={["Surface", "Where", "What it carries"]} rows={SURFACES.map((s) => [s, surfaceWhere[s], SURFACE_RULES[s].note])} />
        <h3 className="text-sm font-semibold">card</h3>
        <Platforms>{(kit) => <RecordCard kit={kit} {...common} />}</Platforms>
        <h3 className="text-sm font-semibold">row</h3>
        <Platforms>{(kit) => <RecordRow kit={kit} {...common} />}</Platforms>
        <h3 className="text-sm font-semibold">chip</h3>
        <Platforms>{(kit) => <RecordChip kit={kit} {...common} />}</Platforms>
        <h3 className="text-sm font-semibold">spoken</h3>
        <Platforms>{(kit) => <RecordSpoken kit={kit} {...common} />}</Platforms>
        <h3 className="text-sm font-semibold">detail</h3>
        <Devices>{(kit) => <RecordDetail kit={kit} {...common} />}</Devices>
      </Section>
      <Section title="Without the prices permission" lead="A viewer without the type's `prices` permission gets the record without its amount and without the money fields. The card shows the quantity instead.">
        <Platforms>{(kit) => <RecordCard kit={kit} {...common} prices={false} />}</Platforms>
      </Section>
      <Section title="States" lead="What Clegra shows when the record can't be shown. The record's title never appears to someone without access, and old data is never shown as live.">
        <div className="grid gap-4 md:grid-cols-2">
          {(["no-access", "not-linked", "gone", "unreachable", "uninstalled"] as const).map((state) => (
            <figure key={state} className="flex flex-col gap-2">
              <figcaption className="font-mono text-xs">{state}</figcaption>
              <RecordState kit={webKit} type={shipment} state={state} />
              <RecordState kit={webKit} type={shipment} state={state} surface="spoken" />
            </figure>
          ))}
        </div>
      </Section>
      <Section title="Light and dark" lead="One palette for every account, light and dark. An application sets neither: the person does.">
        <Schemes>
          <RecordCard kit={webKit} {...common} />
        </Schemes>
      </Section>
      <Section title="Declare it">
        <Code label="manifest.ts">{MANIFEST}</Code>
      </Section>
      <Section title="Do and don't">
        <DoDont
          doThis={["Bind every role your data really has: each one makes the card, the row and the spoken sentence better.", "Write `summary` as you would say it aloud: «Spedizione SP-2026-0481 per Rossi Srl: in viaggio».", "Give `status` its tones, so a delay is red everywhere without you choosing a colour.", "Put the fields in order of importance: a card shows the first four."]}
          dont={["Don't put the status or the amount in the title: they have their own roles and would be said twice.", "Don't use `fields` for long text: a field is a short value.", "Don't declare more than one primary action: the first is the button, the rest go under «⋯».", "Don't reach for a custom view to change the card's look: the look is Clegra's."]}
        />
      </Section>
      <Section title="Accessibility">
        <Notes
          items={[
            "The status is a word with a tone, never a colour alone.",
            "The spoken surface is also what VoiceOver reads for a card or a row: one sentence, not a walk through every field.",
            "Actions are buttons at least 44 pt tall on iPhone and iPad; on the web they are reachable by keyboard in reading order.",
            "Amounts and dates are formatted for the person's locale (it-IT: «48,50 €», «12 nov 2026»).",
          ]}
        />
      </Section>
    </DocPage>
  )
}

export function ListPage() {
  return (
    <DocPage title="List" lead="Rows of records, one under the other. Records of different types may be mixed: each row is its type's `row` surface.">
      <Callout>
        <code>{'{ component: "list", uris[] | source: listUri, title? }'}</code>. Core in contract v1.
      </Callout>
      <Section title="Roles it reads" lead="Per row: title, subtitle, status, and one of amount, quantity, date (the first present, in that order).">
        <Devices>{(kit) => <ListComponent kit={kit} type={shipment} rows={shipments} labels={labels} title="Spedizioni di questa settimana" />}</Devices>
      </Section>
      <Section title="Surfaces">
        <DataTable
          head={["Surface", "Rendering"]}
          rows={[
            ["card", "The title and up to 5 rows, then «Vedi tutte (12)» which opens the application's page."],
            ["row", "«4 spedizioni» with the type's icon: a list never nests in a row."],
            ["spoken", "«Quattro spedizioni: una in ritardo, una consegnata, due in viaggio.» The count, then the statuses; at most three records by name."],
          ]}
        />
      </Section>
      <Section title="Do and don't">
        <DoDont doThis={["Return the records already in the order that matters; Clegra keeps it.", "Declare `list` on the type (a read action) so «all of them» is one URI, live."]} dont={["Don't send more than 50 URIs in one list: page it.", "Don't use a list for one type with many numeric fields: that is a table."]} />
      </Section>
      <Section title="Accessibility">
        <Notes items={["A real list for assistive technology (`role=list`), with the count announced.", "Each row is one stop; its status and value are part of its label.", "On iPhone a row is at least 44 pt tall and opens the record with one tap."]} />
      </Section>
    </DocPage>
  )
}

export function TablePage() {
  return (
    <DocPage title="Table" lead="Records of one type, compared by columns. The columns are role names and `fields` names; Clegra aligns, formats and, on a phone, reflows.">
      <Callout>
        <code>{'{ component: "table", uris[] | source, columns?: string[] }'}</code>. Core in contract v1. The page view <code>{'{ type: "table" }'}</code> renders the same way.
      </Callout>
      <Section title="On each device" lead="Numbers and money align right. On iPhone a table with more than three columns becomes a list: the first column is the title, the rest are labelled values.">
        <Devices>{(kit, device) => (device === "iphone" ? <ListComponent kit={kit} type={shipment} rows={shipments} labels={labels} /> : <TableComponent kit={kit} columns={device === "ipad" ? columns.slice(0, 4) : columns} rows={shipments} labels={labels} />)}</Devices>
      </Section>
      <Section title="Column formats">
        <DataTable
          head={["Format", "Rendering"]}
          rows={[
            ["text", "As written; with `labels`, the label of the value."],
            ["number", "Locale grouping, right-aligned, tabular figures."],
            ["money", "Euro, right-aligned. Left out for a viewer without the prices permission."],
            ["date", "«12 nov 2026»."],
            ["badge", "The value's label in a badge."],
            ["link", "An https address as a link that opens outside Clegra."],
          ]}
        />
      </Section>
      <Section title="Surfaces">
        <DataTable head={["Surface", "Rendering"]} rows={[["card", "Up to 5 rows and 4 columns, then «Vedi tutte»."], ["spoken", "«Quattro spedizioni, per un totale di 219,60 €.» The count and the sum of the amount role when there is one."]]} />
      </Section>
      <Section title="Do and don't">
        <DoDont doThis={["Keep to 5 or 6 columns; put the identifying one first.", "Use `badge` with labels for states."]} dont={["Don't format numbers yourself («1.240,00 €» as text): send the number and the format.", "Don't rely on column widths: they are Clegra's."]} />
      </Section>
      <Section title="Accessibility">
        <Notes items={["Real table semantics on the web: column headers with scope, a caption from the title.", "The reflowed list on iPhone reads «label, value» for each cell.", "Rows that open a record are links, not click handlers on the row."]} />
      </Section>
    </DocPage>
  )
}

export function ChartPage() {
  return (
    <DocPage title="Chart" lead="Records, or rows of a read action, drawn as bars, a line, an area or a pie. The application names the category and the values; the colours are Clegra's.">
      <Callout>
        <code>{'{ component: "chart", uris[] | source, chart: "bar"|"line"|"area"|"pie", category, value: "count" | roleOrField, aggregate? }'}</code>. Extended in contract v1. The page view <code>{'{ type: "chart", category, series }'}</code> renders the same way.
      </Callout>
      <Section title="On each device">
        <Devices>{(kit) => <ChartComponent kit={kit} rows={weekly} category="week" series={[{ field: "shipments", label: "Spedizioni" }, { field: "delayed", label: "In ritardo" }]} />}</Devices>
      </Section>
      <Section title="Roles it reads">
        <DataTable head={["Option", "Accepts"]} rows={[["category", "A role (`status`, `date`, `person`) or a field name: one point, bar or slice per value."], ["value", "`count`, or a numeric role or field (`amount`, `quantity`) with `aggregate`: sum, avg, min, max."], ["series (page view)", "1 to 4 numeric fields; a pie has one. `money` is drawn in euro and needs the prices permission."]]} />
      </Section>
      <Section title="Surfaces">
        <DataTable head={["Surface", "Rendering"]} rows={[["card", "The chart at the card's width, legend under it."], ["row", "Not drawn: the title and the total."], ["spoken", "«Questa settimana 47 spedizioni, una in ritardo; la settimana scorsa 52.» The last value and the comparison, never a list of points."]]} />
      </Section>
      <Section title="Do and don't">
        <DoDont doThis={["One message per chart: at most 4 series.", "Use a line or an area for time, bars for categories, a pie only for parts of a whole (up to 5)."]} dont={["Don't pick colours: series take Clegra's chart palette, the same in every app.", "Don't use the accent (orange, neon yellow) for a series: it is for the «sì» and one figure to notice."]} />
      </Section>
      <Section title="Accessibility">
        <Notes items={["Every chart has a text alternative: the spoken sentence, and the data as a table for assistive technology.", "Series are told apart by label and position, not by colour alone.", "On iOS the chart is a Swift Charts view with its audio graph."]} />
      </Section>
    </DocPage>
  )
}

export function StatPage() {
  return (
    <DocPage title="Stat" lead="One number over records: a count, a total, an average. The home's small widget.">
      <Callout>
        <code>{'{ component: "stat", uris[] | source, value: "count" | roleOrField, aggregate?, label }'}</code>. Extended in contract v1. The page view <code>{'{ type: "number", field, label, format? }'}</code> renders the same way.
      </Callout>
      <Section title="On each platform">
        <Platforms>{(kit) => <StatComponent kit={kit} label="Spedizioni in viaggio" value="12" hint="2 in ritardo" />}</Platforms>
        <Platforms>{(kit) => <StatComponent kit={kit} label="Costo del mese" value="1.842,30 €" />}</Platforms>
      </Section>
      <Section title="Surfaces">
        <DataTable head={["Surface", "Rendering"]} rows={[["card (small widget)", "The label and the number."], ["row", "The label on the left, the number on the right."], ["spoken", "«Dodici spedizioni in viaggio.»"]]} />
      </Section>
      <Section title="Do and don't">
        <DoDont doThis={["Label what the number counts: «Spedizioni in viaggio», not «Totale».", "Use `format: \"money\"` for euro, so it follows the prices permission."]} dont={["Don't put the unit in the label and in the value.", "Don't show a number that needs a paragraph to explain."]} />
      </Section>
      <Section title="Accessibility">
        <Notes items={["Read as one phrase: label, then value.", "The number scales with the person's text size and never truncates: the label wraps first."]} />
      </Section>
    </DocPage>
  )
}

export function TimelinePage() {
  return (
    <DocPage title="Timeline" lead="Records in the order of their `date` role: what happened, what comes next.">
      <Callout>
        <code>{'{ component: "timeline", uris[] | source }'}</code>. Extended in contract v1. Needs the type&apos;s <code>date</code> role.
      </Callout>
      <Section title="On each platform">
        <Platforms>{(kit) => <TimelineComponent kit={kit} type={shipment} rows={shipments} labels={labels} />}</Platforms>
      </Section>
      <Section title="Roles it reads" lead="date (required, the order), title, subtitle, status (its tone colours the marker).">
        <DataTable head={["Surface", "Rendering"]} rows={[["card", "The next 5 records by date."], ["spoken", "«La prossima consegna è il 12 novembre: SP-2026-0481 per Rossi Srl.» The next one, then how many follow."]]} />
      </Section>
      <Section title="Do and don't">
        <DoDont doThis={["Bind `date` to the date people plan by (the delivery), not a technical one (the last update)."]} dont={["Don't use a timeline as a calendar: for days and hours link to the Calendar."]} />
      </Section>
      <Section title="Accessibility">
        <Notes items={["An ordered list: position and date are announced.", "The marker's tone repeats the status word; it adds no information of its own."]} />
      </Section>
    </DocPage>
  )
}

const formFields: FormFieldSpec[] = [
  { id: "customer", label: "Cliente", type: "text", required: true, value: "Rossi Srl" },
  { id: "parcels", label: "Colli", type: "number", required: true, value: "3", hint: "Da 1 a 99." },
  { id: "eta", label: "Consegna entro", type: "date", error: "Scrivi una data, per esempio 12/11/2026.", value: "12 nov" },
  { id: "notes", label: "Note per il corriere", type: "long-text" },
]

export function FormPage() {
  return (
    <DocPage title="Form" lead="One of the application's actions as a form, built from its input schema. The person fills it in, Clegra checks it against the schema and asks for confirmation before it runs.">
      <Callout>
        <code>{'{ component: "form", uri, action }'}</code>. Extended in contract v1. The page view <code>{'{ type: "form", fields, submit, submitLabel?, success? }'}</code> renders the same way.
      </Callout>
      <Section title="On each platform">
        <Platforms iosNote="React Native, drawn; on iOS the fields are SwiftUI TextField, DatePicker and Picker">{(kit) => <FormComponent kit={kit} title="Nuova spedizione" fields={formFields} submitLabel="Crea la spedizione" />}</Platforms>
      </Section>
      <Section title="Field types">
        <DataTable
          head={["Type", "Web", "iPhone and iPad"]}
          rows={[
            ["text", "Input", "TextField"],
            ["long-text", "Textarea", "TextField, vertical"],
            ["number", "Input, decimal keyboard; «12,5» is read as 12.5", "TextField, decimal pad"],
            ["date", "Calendar in a popover", "DatePicker"],
            ["choice", "Select (radio group up to 4 options)", "Picker (menu)"],
          ]}
        />
      </Section>
      <Section title="Surfaces">
        <DataTable head={["Surface", "Rendering"]} rows={[["card", "Up to 4 fields inline; more open the form as a sheet."], ["spoken", "The assistant asks the required fields one at a time, repeats them, and asks «Confermi?»."]]} />
      </Section>
      <Section title="Do and don't">
        <DoDont doThis={["Label fields with what to write: «Consegna entro».", "Put limits in the schema (minimum, maximum, pattern): Clegra shows the message before sending.", "Name the button with the outcome: «Crea la spedizione»."]} dont={["Don't ask for what Clegra already knows (the person, the company, today's date).", "Don't use a form for one yes/no: declare an action; «Conferma» is the question."]} />
      </Section>
      <Section title="Accessibility">
        <Notes items={["Every field has a visible label tied to its control; a placeholder is never the label.", "An error is text under the field, announced when it appears, and the field is marked invalid.", "Required fields say so in the label, not by colour.", "The submit button is the last stop and is disabled only while sending."]} />
      </Section>
    </DocPage>
  )
}
