/**
 * A TINY VIEW FOR CLEGRA (an MCP Apps view): one file of React, shown by the
 * host in a sandboxed frame. <ClegraProvider> asks the host for its context,
 * applies the look (light or dark, the account's scheme, the tokens, the
 * person's text size, the locale) and keeps the frame as tall as its content.
 * Bundle it into one HTML file and serve it from your MCP server as the
 * resource `ui://spedizioni/eta` (MIME `text/html;profile=mcp-app`).
 */
import { useEffect, useState } from "react"
import { createRoot } from "react-dom/client"

import { Badge } from "@clegra/ui/components/badge"
import { Button } from "@clegra/ui/components/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@clegra/ui/components/card"
import { Skeleton } from "@clegra/ui/components/skeleton"
import { ClegraProvider, useClegraHost, useClegraTheme } from "@clegra/ui/frame"

import "./styles.css"

type Eta = { tracking: string; customer: string; city: string; day: string }

function EtaCard() {
  const host = useClegraHost()
  const { locale } = useClegraTheme()
  const [eta, setEta] = useState<Eta | null>(null)
  const [failed, setFailed] = useState(false)

  // The data comes from one of the application's own tools, called through the host as the person looking.
  const load = () => {
    setFailed(false)
    host
      .request("tools/call", { name: "spedizioni_eta", arguments: {} })
      .then((result) => setEta((result as { structuredContent: Eta }).structuredContent))
      .catch(() => setFailed(true))
  }
  useEffect(load, [host.connected]) // eslint-disable-line react-hooks/exhaustive-deps

  if (failed)
    return (
      <Card>
        <CardHeader>
          <CardTitle>Non siamo riusciti a caricare la consegna</CardTitle>
          <CardDescription>Riprova tra poco.</CardDescription>
        </CardHeader>
        <CardFooter>
          <Button variant="outline" onClick={load}>
            Riprova
          </Button>
        </CardFooter>
      </Card>
    )
  if (!eta)
    return (
      <div aria-busy="true" aria-label="Caricamento" className="flex flex-col gap-3">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-24 w-full" />
      </div>
    )
  const day = new Intl.DateTimeFormat(locale, { weekday: "long", day: "numeric", month: "long" }).format(new Date(eta.day))
  return (
    <Card>
      <CardHeader>
        <CardTitle>{eta.tracking}</CardTitle>
        <CardDescription>
          {eta.customer} · {eta.city}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex items-center gap-2">
        <Badge variant="outline">In viaggio</Badge>
        <span>Consegna prevista {day}</span>
      </CardContent>
    </Card>
  )
}

createRoot(document.getElementById("root")!).render(
  <ClegraProvider appInfo={{ name: "spedizioni-eta", version: "1.0.0" }}>
    <main className="p-4">
      <EtaCard />
    </main>
  </ClegraProvider>,
)
