import type { ReactNode } from "react"

import { derive, spoken, stateMessage, type Column, type Data, type Derived, type ArtifactType, type Labels, type State } from "@clegra/ui/records/derive"
import { format } from "@clegra/ui/records/derive"
import type { Kit } from "./kit"

/**
 * THE CATALOGUE'S REFERENCE RENDERINGS: how the host draws typed data, written
 * once against a kit (apps/kit.tsx) so the same code shows the web and the
 * React Native rendering. Reference, not the host's production code: it fixes
 * what each surface carries and how it is laid out.
 */

type RecordProps = { kit: Kit; type: ArtifactType; data: Data; labels: Labels; prices?: boolean }

const initials = (name: string) => name.split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase()

function Status({ kit, d }: { kit: Kit; d: Derived }) {
  const { Badge, ToneDot, Span } = kit
  if (!d.status) return null
  return (
    <Badge variant="outline">
      <ToneDot tone={d.status.tone} />
      <Span>{d.status.text}</Span>
    </Badge>
  )
}

function Pairs({ kit, fields }: { kit: Kit; fields: Derived["fields"] }) {
  const { Div, Span } = kit
  return (
    <Div className="flex flex-col gap-1">
      {fields.map((f) => (
        <Div key={f.label} className="flex flex-row items-center justify-between gap-4">
          <Span className="text-sm text-muted-foreground">{f.label}</Span>
          <Span className="text-sm">{f.text}</Span>
        </Div>
      ))}
    </Div>
  )
}

/** `chip`: the type's icon and the title; the status as a tone only. */
export function RecordChip({ kit, type, data, labels }: RecordProps) {
  const { Div, Span, ToneDot, icons } = kit
  const d = derive(type, data, "chip", labels)
  return (
    <Div className="flex flex-row items-center gap-1.5 self-start rounded-md border border-border bg-card px-2 py-1">
      <icons.FileText className="size-3.5 text-muted-foreground" />
      <Span className="text-sm font-medium">{d.title}</Span>
      {d.status ? <ToneDot tone={d.status.tone} /> : null}
    </Div>
  )
}

/** `row`: one line of a list, a search result. */
export function RecordRow({ kit, type, data, labels, prices }: RecordProps) {
  const { Item, ItemMedia, ItemContent, ItemTitle, ItemDescription, ItemActions, Span, icons } = kit
  const d = derive(type, data, "row", labels, { prices })
  return (
    <Item variant="outline" size="sm">
      <ItemMedia variant="icon">
        <icons.FileText />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>{d.title}</ItemTitle>
        {d.subtitle ? <ItemDescription>{d.subtitle}</ItemDescription> : null}
      </ItemContent>
      <ItemActions>
        <Status kit={kit} d={d} />
        <Span className="text-sm font-medium">{d.amount ?? d.quantity ?? d.date ?? ""}</Span>
      </ItemActions>
    </Item>
  )
}

/** `card`: in an answer of the assistant's, on the home, in a space. */
export function RecordCard({ kit, type, data, labels, prices }: RecordProps) {
  const { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Button, Div, Span, Avatar, AvatarFallback, Progress } = kit
  const d = derive(type, data, "card", labels, { prices })
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <Div className="flex flex-row items-center justify-between gap-2">
          <Span className="text-xs text-muted-foreground">
            {type.app} · {type.name}
          </Span>
          <Status kit={kit} d={d} />
        </Div>
        <CardTitle>{d.title}</CardTitle>
        {d.subtitle ? <CardDescription>{d.subtitle}</CardDescription> : null}
      </CardHeader>
      <CardContent>
        <Div className="flex flex-col gap-3">
          {d.amount || d.quantity ? <Span className="text-2xl font-semibold">{d.amount ?? d.quantity}</Span> : null}
          {d.progress !== undefined ? <Progress value={Math.round(d.progress * 100)} /> : null}
          <Div className="flex flex-row items-center justify-between gap-2">
            {d.person ? (
              <Div className="flex flex-row items-center gap-2">
                <Avatar size="sm">
                  <AvatarFallback>{initials(d.person)}</AvatarFallback>
                </Avatar>
                <Span className="text-sm">{d.person}</Span>
              </Div>
            ) : null}
            {d.date ? <Span className="text-sm text-muted-foreground">{d.date}</Span> : null}
          </Div>
          {d.fields.length ? <Pairs kit={kit} fields={d.fields} /> : null}
        </Div>
      </CardContent>
      {d.actions.length ? (
        <CardFooter>
          <Div className="flex flex-row flex-wrap items-center gap-2">
            {d.actions.map((a, i) => (
              <Button key={a.id} size="sm" variant={i === 0 ? "default" : "outline"}>
                {a.label}
              </Button>
            ))}
            {d.more.length ? (
              <Button size="sm" variant="ghost" aria-label={`Altre azioni: ${d.more.map((a) => a.label).join(", ")}`}>
                ⋯
              </Button>
            ) : null}
          </Div>
        </CardFooter>
      ) : null}
    </Card>
  )
}

/** `detail`: the opened record. */
export function RecordDetail({ kit, type, data, labels, prices }: RecordProps) {
  const { Div, Span, H2, Button, Progress } = kit
  const d = derive(type, data, "detail", labels, { prices })
  return (
    <Div className="flex w-full flex-col gap-4">
      <Div className="flex flex-col gap-1">
        <Div className="flex flex-row items-center gap-2">
          <Span className="text-xs text-muted-foreground">
            {type.app} · {type.name}
          </Span>
          <Status kit={kit} d={d} />
        </Div>
        <H2 className="text-xl font-semibold">{d.title}</H2>
        {d.subtitle ? <Span className="text-sm text-muted-foreground">{d.subtitle}</Span> : null}
      </Div>
      <Div className="flex flex-row flex-wrap items-center gap-6">
        {d.amount ? <Labelled kit={kit} label="Importo" value={d.amount} /> : null}
        {d.quantity ? <Labelled kit={kit} label="Quantità" value={d.quantity} /> : null}
        {d.date ? <Labelled kit={kit} label="Data" value={d.date} /> : null}
        {d.person ? <Labelled kit={kit} label="Persona" value={d.person} /> : null}
        {d.place ? <Labelled kit={kit} label="Luogo" value={d.place} /> : null}
      </Div>
      {d.progress !== undefined ? <Progress value={Math.round(d.progress * 100)} /> : null}
      {d.groups.map((g) => (
        <Div key={g.title} className="flex flex-col gap-2 rounded-xl border border-border p-4">
          <Span className="text-sm font-semibold">{g.title}</Span>
          <Pairs kit={kit} fields={g.fields} />
        </Div>
      ))}
      {!d.groups.length && d.fields.length ? <Pairs kit={kit} fields={d.fields} /> : null}
      <Div className="flex flex-row flex-wrap items-center gap-2">
        {d.actions.map((a, i) => (
          <Button key={a.id} size="sm" variant={i === 0 ? "default" : "outline"}>
            {a.label}
          </Button>
        ))}
      </Div>
    </Div>
  )
}

function Labelled({ kit, label, value }: { kit: Kit; label: string; value: string }) {
  const { Div, Span } = kit
  return (
    <Div className="flex flex-col">
      <Span className="text-xs text-muted-foreground">{label}</Span>
      <Span className="text-base font-medium">{value}</Span>
    </Div>
  )
}

/** `spoken`: what the voice assistant says, and the text of a notification. */
export function RecordSpoken({ kit, type, data, labels, prices }: RecordProps) {
  const { Div, Span } = kit
  return (
    <Div className="flex flex-col gap-1 rounded-xl bg-muted p-3">
      <Span className="text-xs text-muted-foreground">Clegra dice</Span>
      <Span className="text-sm">«{spoken(type, data, labels, { prices })}»</Span>
    </Div>
  )
}

/** A record that can't be shown: the same words on every surface, never the record's title. */
export function RecordState({ kit, type, state, surface = "card" }: { kit: Kit; type: ArtifactType; state: Exclude<State, "ok">; surface?: "card" | "row" | "chip" | "spoken" }) {
  const { Div, Span, Button, icons } = kit
  // The catalogue's sample: a fixed time of the last contact.
  const m = stateMessage(state, type, "10:42")
  if (surface === "spoken")
    return (
      <Div className="flex flex-col gap-1 rounded-xl bg-muted p-3">
        <Span className="text-xs text-muted-foreground">Clegra dice</Span>
        <Span className="text-sm">«{[m.title, m.hint].filter(Boolean).join(". ")}.»</Span>
      </Div>
    )
  if (surface === "chip")
    return (
      <Div className="flex flex-row items-center gap-1.5 self-start rounded-md border border-dashed border-border px-2 py-1">
        <icons.FileText className="size-3.5 text-muted-foreground" />
        <Span className="text-sm text-muted-foreground">{type.app}</Span>
      </Div>
    )
  return (
    <Div className={`flex w-full max-w-sm gap-3 rounded-xl border border-dashed border-border p-4 ${surface === "row" ? "flex-row items-center justify-between" : "flex-col"}`}>
      <Div className="flex flex-col gap-0.5">
        <Span className="text-sm font-medium">{m.title}</Span>
        {m.hint ? <Span className="text-sm text-muted-foreground">{m.hint}</Span> : null}
      </Div>
      {m.action ? (
        <Button size="sm" variant="outline" className="self-start">
          {m.action}
        </Button>
      ) : null}
    </Div>
  )
}

/** `list`: rows of records, mixed types allowed. */
export function ListComponent({ kit, type, rows, labels, title, prices }: { kit: Kit; type: ArtifactType; rows: Data[]; labels: Labels; title?: string; prices?: boolean }) {
  const { Div, Span, ItemGroup } = kit
  return (
    <Div className="flex w-full flex-col gap-2">
      {title ? <Span className="text-sm font-semibold">{title}</Span> : null}
      <ItemGroup>
        {rows.map((data, i) => (
          <RecordRow key={i} kit={kit} type={type} data={data} labels={labels} prices={prices} />
        ))}
      </ItemGroup>
    </Div>
  )
}

/** `table`: records of one type; the columns are roles and field names. */
export function TableComponent({ kit, columns, rows, labels }: { kit: Kit; columns: readonly Column[]; rows: Data[]; labels: Labels }) {
  const { Table, TableHeader, TableRow, TableHead, TableBody, TableCell, Badge } = kit
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map((c) => (
            <TableHead key={c.field} className={c.format === "money" || c.format === "number" ? "text-right" : ""}>
              {c.label}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row, i) => (
          <TableRow key={i}>
            {columns.map((c) => {
              const text = format(row[c.field], c.format, c.labels ? labels[c.labels] : undefined)
              return (
                <TableCell key={c.field} className={c.format === "money" || c.format === "number" ? "text-right" : ""}>
                  {c.format === "badge" ? <Badge variant="outline">{text}</Badge> : text}
                </TableCell>
              )
            })}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

/** `stat`: one number over records. */
export function StatComponent({ kit, label, value, hint }: { kit: Kit; label: string; value: string; hint?: string }) {
  const { Div, Span } = kit
  return (
    <Div className="flex w-full max-w-xs flex-col gap-2 rounded-xl border border-border bg-card p-4">
      <Span className="text-sm text-muted-foreground">{label}</Span>
      <Span className="text-3xl font-semibold">{value}</Span>
      {hint ? <Span className="text-xs text-muted-foreground">{hint}</Span> : null}
    </Div>
  )
}

/** `chart`: bar here; line, area and pie take the same data. */
export function ChartComponent({ kit, rows, category, series }: { kit: Kit; rows: Record<string, string | number>[]; category: string; series: { field: string; label: string }[] }) {
  const { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, BarChart, Bar, XAxis, CartesianGrid } = kit
  const config = Object.fromEntries(series.map((s, i) => [s.field, { label: s.label, color: `var(--chart-${i === 0 ? 1 : 4})` }]))
  return (
    <ChartContainer config={config} className="h-[220px] w-full">
      <BarChart accessibilityLayer data={rows}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey={category} tickLine={false} tickMargin={10} axisLine={false} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        {series.map((s) => (
          <Bar key={s.field} dataKey={s.field} fill={`var(--color-${s.field})`} radius={4} />
        ))}
      </BarChart>
    </ChartContainer>
  )
}

/** `timeline`: records in the order of their `date` role. */
export function TimelineComponent({ kit, type, rows, labels }: { kit: Kit; type: ArtifactType; rows: Data[]; labels: Labels }) {
  const { Div, Span, ToneDot } = kit
  const field = type.roles.date?.field ?? ""
  const sorted = [...rows].sort((a, b) => String(a[field]).localeCompare(String(b[field])))
  return (
    <Div className="flex w-full flex-col">
      {sorted.map((data, i) => {
        const d = derive(type, data, "detail", labels)
        return (
          <Div key={i} className="flex flex-row gap-3">
            <Div className="flex w-24 flex-col items-end pt-0.5">
              <Span className="text-xs text-muted-foreground">{d.date}</Span>
            </Div>
            <Div className="flex flex-col items-center pt-1.5">
              <ToneDot tone={d.status?.tone ?? "neutral"} />
              {i < sorted.length - 1 ? <Div className="w-px flex-1 bg-border" style={{ minHeight: 28 }} /> : null}
            </Div>
            <Div className="flex flex-1 flex-col pb-4">
              <Span className="text-sm font-medium">{d.title}</Span>
              <Span className="text-sm text-muted-foreground">{[d.status?.text, d.subtitle].filter(Boolean).join(" · ")}</Span>
            </Div>
          </Div>
        )
      })}
    </Div>
  )
}

export type FormFieldSpec = { id: string; label: string; type: "text" | "long-text" | "number" | "date" | "choice"; required?: boolean; options?: readonly string[]; hint?: string; error?: string; value?: string }

/** `form`: one declared action as a form built from its input schema. Submitting goes through «Conferma». */
export function FormComponent({ kit, title, fields, submitLabel = "Invia" }: { kit: Kit; title?: string; fields: readonly FormFieldSpec[]; submitLabel?: string }) {
  const { FieldSet, FieldLegend, FieldGroup, Field, FieldLabel, FieldDescription, FieldError, Input, Textarea, Button, Div } = kit
  return (
    <Div className="flex w-full max-w-md flex-col gap-4">
      <FieldSet>
        {title ? <FieldLegend>{title}</FieldLegend> : null}
        <FieldGroup>
          {fields.map((f) => (
            <Field key={f.id} data-invalid={f.error ? "true" : undefined}>
              <FieldLabel htmlFor={`${kit.platform}-${f.id}`}>
                {f.label}
                {f.required ? " *" : ""}
              </FieldLabel>
              {f.type === "long-text" ? (
                <Textarea id={`${kit.platform}-${f.id}`} defaultValue={f.value} aria-invalid={f.error ? true : undefined} />
              ) : (
                <Input
                  id={`${kit.platform}-${f.id}`}
                  defaultValue={f.value}
                  inputMode={f.type === "number" ? "decimal" : undefined}
                  placeholder={f.type === "date" ? "gg/mm/aaaa" : f.type === "choice" ? f.options?.join(" · ") : undefined}
                  aria-invalid={f.error ? true : undefined}
                />
              )}
              {f.hint ? <FieldDescription>{f.hint}</FieldDescription> : null}
              {f.error ? <FieldError>{f.error}</FieldError> : null}
            </Field>
          ))}
        </FieldGroup>
      </FieldSet>
      <Button className="self-start">{submitLabel}</Button>
    </Div>
  )
}

/** The four states every data view has beside its data. */
export function ViewState({ kit, state, app = "Spedizioni" }: { kit: Kit; state: "loading" | "empty" | "error" | "unreachable"; app?: string }): ReactNode {
  const { Div, Skeleton, Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent, Button, Alert, AlertTitle, AlertDescription, icons } = kit
  if (state === "loading")
    return (
      <Div className="flex w-full flex-col gap-3" aria-busy="true" aria-label="Caricamento">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </Div>
    )
  if (state === "empty")
    return (
      <Empty className="border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <icons.Inbox />
          </EmptyMedia>
          <EmptyTitle>Nessuna spedizione</EmptyTitle>
          <EmptyDescription>Le spedizioni compaiono qui appena ne crei una.</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button size="sm">Nuova spedizione</Button>
        </EmptyContent>
      </Empty>
    )
  if (state === "error")
    return (
      <Alert variant="destructive">
        <AlertTitle>Non siamo riusciti a caricare le spedizioni</AlertTitle>
        <AlertDescription>Riprova tra poco. Se continua, scrivi a chi gestisce {app}.</AlertDescription>
      </Alert>
    )
  return (
    <Div className="flex w-full flex-col gap-3 rounded-xl border border-dashed border-border p-4">
      <Div className="flex flex-col gap-0.5">
        <kit.Span className="text-sm font-medium">{app} non raggiungibile</kit.Span>
        <kit.Span className="text-sm text-muted-foreground">Ultimo contatto 10:42. Nessun dato vecchio viene mostrato come attuale.</kit.Span>
      </Div>
      <Button size="sm" variant="outline" className="self-start">
        Riprova
      </Button>
    </Div>
  )
}
