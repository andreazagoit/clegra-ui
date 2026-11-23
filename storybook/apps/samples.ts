import type { Column, Data, ArtifactType, Labels } from "@clegra/ui/records/derive"

/** The catalogue's example application: «Spedizioni», a courier's shipments. Italian copy, as people see it. */
export const labels: Labels = {
  shipmentStatus: { in_transit: "In viaggio", delivered: "Consegnata", delayed: "In ritardo", preparing: "In preparazione" },
}

export const shipment: ArtifactType = {
  id: "shipment",
  name: "Spedizione",
  plural: "Spedizioni",
  app: "Spedizioni",
  roles: {
    title: "{tracking} · {customer}",
    subtitle: "{destination}",
    status: { field: "status", labels: "shipmentStatus", tones: { in_transit: "info", delivered: "success", delayed: "danger", preparing: "neutral" } },
    amount: { field: "cost" },
    date: { field: "eta" },
    person: { field: "owner" },
    quantity: { field: "parcels", unit: "colli" },
    place: { field: "destination" },
    progress: { field: "progress" },
  },
  fields: [
    { field: "carrier", label: "Corriere" },
    { field: "weight", label: "Peso (kg)", format: "number" },
    { field: "service", label: "Servizio" },
    { field: "shipped", label: "Partita il", format: "date" },
    { field: "insured", label: "Assicurata", format: "money" },
    { field: "reference", label: "Riferimento" },
  ],
  groups: [
    { title: "Consegna", fields: [{ field: "destination", label: "Destinazione" }, { field: "eta", label: "Consegna prevista", format: "date" }, { field: "service", label: "Servizio" }] },
    { title: "Collo", fields: [{ field: "parcels", label: "Colli", format: "number" }, { field: "weight", label: "Peso (kg)", format: "number" }, { field: "insured", label: "Assicurata", format: "money" }] },
  ],
  summary: "Spedizione {tracking} per {customer}: {statusWord}, consegna prevista il {etaWord}.",
  actions: [
    { id: "open", label: "Apri in Spedizioni", page: "shipment" },
    { id: "notify", label: "Avvisa il cliente", action: "spedizioni_notify_customer" },
    { id: "reschedule", label: "Riprogramma", action: "spedizioni_reschedule" },
  ],
}

const row = (tracking: string, customer: string, destination: string, status: string, cost: number, eta: string, parcels: number, progress: number, owner: string): Data => ({
  tracking,
  customer,
  destination,
  status,
  statusWord: labels.shipmentStatus![status]!.toLowerCase(),
  cost,
  eta,
  etaWord: new Intl.DateTimeFormat("it-IT", { day: "numeric", month: "long", timeZone: "UTC" }).format(new Date(eta)),
  parcels,
  progress,
  owner,
  carrier: "Corriere Nord",
  weight: parcels * 6.5,
  service: "Espresso 24h",
  shipped: "2026-11-09",
  insured: 500,
  reference: `ORD-${tracking.slice(-3)}`,
})

export const shipments: Data[] = [
  row("SP-2026-0481", "Rossi Srl", "Verona", "in_transit", 48.5, "2026-11-12", 3, 0.6, "Marta Bianchi"),
  row("SP-2026-0480", "Bianchi Spa", "Bologna", "delivered", 22, "2026-11-10", 1, 1, "Luca Verdi"),
  row("SP-2026-0479", "Verdi & C.", "Torino", "delayed", 131.2, "2026-11-11", 8, 0.4, "Marta Bianchi"),
  row("SP-2026-0478", "Neri Snc", "Padova", "preparing", 17.9, "2026-11-14", 2, 0.1, "Luca Verdi"),
]

/** The columns of the page views' examples. */
export const columns: Column[] = [
  { field: "tracking", label: "Numero" },
  { field: "customer", label: "Cliente" },
  { field: "status", label: "Stato", format: "badge", labels: "shipmentStatus" },
  { field: "eta", label: "Consegna", format: "date" },
  { field: "cost", label: "Costo", format: "money" },
]

/** Shipments per week, for the chart examples. */
export const weekly = [
  { week: "Sett. 42", shipments: 34, delayed: 3 },
  { week: "Sett. 43", shipments: 41, delayed: 5 },
  { week: "Sett. 44", shipments: 38, delayed: 2 },
  { week: "Sett. 45", shipments: 52, delayed: 4 },
  { week: "Sett. 46", shipments: 47, delayed: 1 },
]
