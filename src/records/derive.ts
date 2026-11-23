/**
 * HOW A RECORD BECOMES EACH SURFACE: an application sends typed data and binds
 * its fields to semantic roles; the host derives every surface from them.
 * Pure, and read by both the host's record renderer (./record.tsx, what the
 * web client draws an artifact with) and the Apps catalogue's reference
 * renderings (../apps). The names are the contract's (manifest format 3:
 * `artifacts[].roles`, SEMANTIC_ROLES, ARTIFACT_SURFACES), repeated here
 * structurally so the design library has no dependency on the SDK.
 */
export type Tone = "neutral" | "info" | "success" | "warning" | "danger"
/** `record`: a record URI of another app (a cross-app reference): the host draws it as a resolved chip; as text it is never shown (no id, no remembered title). */
export type ColumnFormat = "text" | "number" | "money" | "date" | "badge" | "link" | "record"
export type Column = { field: string; label: string; format?: ColumnFormat; labels?: string }

export type Roles = {
  /** A template with fields in braces: "{number} · {customer}". */
  title: string
  subtitle?: string
  status?: { field: string; labels?: string; tones?: Record<string, Tone> }
  amount?: { field: string }
  date?: { field: string }
  person?: { field: string }
  quantity?: { field: string; unit?: string }
  image?: { field: string }
  place?: { field: string }
  progress?: { field: string }
}

export const SEMANTIC_ROLES = ["title", "subtitle", "status", "amount", "date", "person", "quantity", "image", "place", "progress"] as const
export const SURFACES = ["detail", "card", "row", "chip", "spoken"] as const
export type Surface = (typeof SURFACES)[number]
export const STATES = ["ok", "no-access", "not-linked", "gone", "unreachable", "uninstalled"] as const
export type State = (typeof STATES)[number]

export type ArtifactAction = { id: string; label: string; page?: string; action?: string }

export type ArtifactType = {
  id: string
  name: string
  plural: string
  app: string
  roles: Roles
  fields?: readonly Column[]
  groups?: readonly { title: string; fields: readonly Column[] }[]
  /** One sentence: spoken, a notification's text, the plain-text fallback. */
  summary?: string
  actions?: readonly ArtifactAction[]
}

export type Data = Record<string, unknown>
export type Labels = Record<string, Record<string, string>>

/** What a surface shows of a record, already as words. */
export type Derived = {
  title: string
  subtitle?: string
  status?: { text: string; tone: Tone }
  amount?: string
  quantity?: string
  date?: string
  person?: string
  place?: string
  image?: string
  progress?: number
  fields: { label: string; text: string; format?: ColumnFormat }[]
  groups: { title: string; fields: { label: string; text: string; format?: ColumnFormat }[] }[]
  actions: ArtifactAction[]
  /** Actions that did not fit: under «⋯». */
  more: ArtifactAction[]
}

const euro = new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" })
const plain = new Intl.NumberFormat("it-IT")
const day = new Intl.DateTimeFormat("it-IT", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" })

const at = (data: Data, path: string): unknown => path.split(".").reduce<unknown>((value, key) => (typeof value === "object" && value !== null ? (value as Data)[key] : undefined), data)

/** A template with a record's data in it ("{number} · {customer}"; a field may be a dotted path). A missing value leaves nothing, nor the separator left hanging at the end. */
export const fill = (template: string, data: Data) =>
  template
    .replace(/\{([a-zA-Z0-9_.]+)\}/g, (_, field: string) => {
      const value = at(data, field)
      return value == null ? "" : String(value)
    })
    .replace(/\s+([·,;:—-])\s*$/u, "")
    .replace(/\s{2,}/g, " ")
    .trim()

export function format(value: unknown, as: ColumnFormat | undefined, labels?: Record<string, string>): string {
  if (value == null || value === "") return "—"
  if (as === "record") return ""
  if (as === "money" && typeof value === "number") return euro.format(value)
  if (as === "number" && typeof value === "number") return plain.format(value)
  if (as === "date") {
    const date = new Date(String(value))
    return Number.isNaN(date.getTime()) ? String(value) : day.format(date)
  }
  return labels?.[String(value)] ?? String(value)
}

/** How much of a record each surface carries (the contract's degradation). */
export const SURFACE_RULES: Record<Surface, { roles: readonly (keyof Roles)[]; fields: number; actions: number; note: string }> = {
  detail: { roles: SEMANTIC_ROLES, fields: Infinity, actions: Infinity, note: "Every role, every group and field, every action the viewer may use." },
  card: { roles: ["title", "subtitle", "status", "amount", "quantity", "date", "person", "image"], fields: 4, actions: 2, note: "Up to 4 fields and 2 actions; the rest under «⋯». Amount, or quantity when there is no amount." },
  row: { roles: ["title", "subtitle", "status", "amount", "quantity", "date"], fields: 0, actions: 0, note: "Title, subtitle, status and one of amount, quantity, date (the first present, in that order)." },
  chip: { roles: ["title", "status"], fields: 0, actions: 0, note: "The type's icon and the title; the status only as a tone." },
  spoken: { roles: ["title", "status", "amount"], fields: 0, actions: 0, note: "The `summary` sentence, else «{type} {title}, {status}, {amount}». Never actions." },
}

export function derive(type: ArtifactType, data: Data, surface: Surface, labels: Labels = {}, options: { prices?: boolean } = {}): Derived {
  const { roles } = type
  const rule = SURFACE_RULES[surface]
  const has = (role: keyof Roles) => rule.roles.includes(role)
  const prices = options.prices !== false
  const column = (c: Column) => ({ label: c.label, text: format(data[c.field], c.format, c.labels ? labels[c.labels] : undefined), format: c.format })
  const visible = (c: Column) => prices || c.format !== "money"
  const out: Derived = { title: fill(roles.title, data), fields: [], groups: [], actions: [], more: [] }
  if (roles.subtitle && has("subtitle")) out.subtitle = fill(roles.subtitle, data)
  if (roles.status && has("status") && data[roles.status.field] != null) {
    const value = String(data[roles.status.field])
    out.status = { text: (roles.status.labels ? labels[roles.status.labels]?.[value] : undefined) ?? value, tone: roles.status.tones?.[value] ?? "neutral" }
  }
  if (roles.amount && has("amount") && prices && typeof data[roles.amount.field] === "number") out.amount = euro.format(data[roles.amount.field] as number)
  if (roles.quantity && has("quantity") && typeof data[roles.quantity.field] === "number") out.quantity = `${plain.format(data[roles.quantity.field] as number)}${roles.quantity.unit ? ` ${roles.quantity.unit}` : ""}`
  if (roles.date && has("date") && data[roles.date.field]) out.date = format(data[roles.date.field], "date")
  if (roles.person && has("person") && data[roles.person.field]) out.person = String(data[roles.person.field])
  if (roles.place && has("place") && data[roles.place.field]) out.place = String(data[roles.place.field])
  if (roles.image && has("image") && data[roles.image.field]) out.image = String(data[roles.image.field])
  if (roles.progress && has("progress") && typeof data[roles.progress.field] === "number") out.progress = Math.min(1, Math.max(0, data[roles.progress.field] as number))
  // A card shows the amount, or the quantity when there is none; a row shows one of amount, quantity, date.
  if (surface === "card" && out.amount) delete out.quantity
  if (surface === "row") {
    if (out.amount) (delete out.quantity, delete out.date)
    else if (out.quantity) delete out.date
  }
  // A field a role of this surface already shows (the delivery date as the card's date) is not repeated as a field.
  const byRole = new Set(rule.roles.flatMap((role) => (role === "title" || role === "subtitle" ? [] : [roles[role]?.field])).filter(Boolean))
  out.fields = (type.fields ?? []).filter(visible).filter((c) => !byRole.has(c.field)).slice(0, rule.fields).map(column)
  if (surface === "detail") out.groups = (type.groups ?? []).map((g) => ({ title: g.title, fields: g.fields.filter(visible).map(column) }))
  const actions = [...(type.actions ?? [])]
  out.actions = actions.slice(0, rule.actions)
  out.more = surface === "card" ? actions.slice(rule.actions) : []
  return out
}

/** The one sentence: the type's `summary`, else derived. */
export function spoken(type: ArtifactType, data: Data, labels: Labels = {}, options: { prices?: boolean } = {}): string {
  if (type.summary) return fill(type.summary, data)
  const d = derive(type, data, "spoken", labels, options)
  return [`${type.name} ${d.title}`, d.status?.text, d.amount].filter(Boolean).join(", ")
}

/** «10:42» today, «10 nov, 10:42» another day: when the host last had a valid answer. Null when it never had one, or the time can't be read. */
export function contactTime(lastContact: string | null | undefined, now: Date = new Date()): string | null {
  if (!lastContact) return null
  const date = new Date(lastContact)
  if (Number.isNaN(date.getTime())) return null
  const sameDay = date.toDateString() === now.toDateString()
  return new Intl.DateTimeFormat("it-IT", sameDay ? { hour: "2-digit", minute: "2-digit" } : { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(date)
}

/**
 * What every surface says instead of the record when it can't be shown: the
 * application's name, never a word of the record. `lastContact` is the time
 * already as words (`contactTime`); without one an unreachable application
 * has no hint.
 */
/**
 * The words of those states, as templates with «{app}» and «{when}»: the
 * library's own Italian unless the host gives them in the person's language
 * (RecordWordsProvider in records/record.tsx).
 */
/** `notLinked`/`link`: an app that signs people in itself, whose account the viewer has not linked (spec §9.3). */
export type StateWords = { noAccess: string; askAccess: string; notLinked: string; link: string; gone: string; unreachable: string; lastContact: string; retry: string; uninstalled: string }

export const ITALIAN_STATE_WORDS: StateWords = {
  noAccess: "Non hai accesso a questo contenuto di {app}",
  askAccess: "Chiedi l'accesso",
  gone: "Questo elemento non esiste più",
  unreachable: "{app} non raggiungibile",
  lastContact: "Ultimo contatto {when}",
  retry: "Riprova",
  uninstalled: "{app} non è più installata", notLinked: "Collega il tuo account {app} per vederlo", link: "Collega account",
}

const fillIn = (template: string, values: Record<string, string>) => template.replace(/\{(\w+)\}/g, (whole, name: string) => values[name] ?? whole)

export function stateMessage(
  state: Exclude<State, "ok">,
  type: { app: string; name?: string },
  lastContact?: string | null,
  words: StateWords = ITALIAN_STATE_WORDS,
): { title: string; hint?: string; action?: string } {
  const values = { app: type.app, when: lastContact ?? "" }
  switch (state) {
    case "no-access":
      return { title: fillIn(words.noAccess, values), action: words.askAccess }
    case "not-linked":
      return { title: fillIn(words.notLinked, values), action: words.link }
    case "gone":
      return { title: words.gone, ...(type.name ? { hint: type.name } : {}) }
    case "unreachable":
      return { title: fillIn(words.unreachable, values), ...(lastContact ? { hint: fillIn(words.lastContact, values) } : {}), action: words.retry }
    case "uninstalled":
      return { title: fillIn(words.uninstalled, values) }
  }
}
