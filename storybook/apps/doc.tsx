import { useState, type ReactNode } from "react"

import { ClegraProvider } from "@clegra/ui/frame"
import { OverlayHost } from "@clegra/ui/native/overlay"

import { nativeKit, webKit, type Kit } from "./kit"

/**
 * The «Apps» section's page furniture (Storybook only, never exported): the
 * page, web and native side by side, the device frames, the two looks, the
 * tables, do and don't, and code to copy.
 */

export function DocPage({ title, lead, children }: { title: string; lead: ReactNode; children: ReactNode }) {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-10 pb-16">
      <header className="flex flex-col gap-2">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Apps</p>
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        <p className="max-w-3xl text-base text-muted-foreground">{lead}</p>
      </header>
      {children}
    </div>
  )
}

export function Section({ title, lead, children }: { title: string; lead?: ReactNode; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
        {lead ? <p className="max-w-3xl text-sm text-muted-foreground">{lead}</p> : null}
      </div>
      {children}
    </section>
  )
}

function Panel({ label, note, children, width }: { label: string; note?: string; children: ReactNode; width?: number }) {
  return (
    <figure className="flex min-w-0 flex-col gap-2" style={width ? { width, maxWidth: "100%" } : undefined}>
      <figcaption className="flex flex-wrap items-baseline gap-x-2 text-xs">
        <span className="font-medium tracking-wide uppercase">{label}</span>
        {note ? <span className="text-muted-foreground">{note}</span> : null}
      </figcaption>
      <div className="min-w-0 rounded-xl border bg-background p-4">{children}</div>
    </figure>
  )
}

/** The same rendering with the web's components and with React Native's, side by side. */
export function Platforms({ children, iosNote }: { children: (kit: Kit) => ReactNode; iosNote?: string }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Panel label="Web and Mac" note="React: shadcn on Base UI">
        {children(webKit)}
      </Panel>
      <Panel label="iPhone and iPad" note={iosNote ?? "React Native, drawn with the same tokens (shown through react-native-web)"}>
        <OverlayHost>{children(nativeKit)}</OverlayHost>
      </Panel>
    </div>
  )
}

/** One rendering at the three widths the host has: the web and the Mac, the iPad's content column, the iPhone. */
export function Devices({ children }: { children: (kit: Kit, device: "desktop" | "ipad" | "iphone") => ReactNode }) {
  return (
    <div className="flex flex-col gap-6">
      <Panel label="Web and Mac" note="content column, from 1024 px">
        {children(webKit, "desktop")}
      </Panel>
      <div className="flex flex-wrap items-start gap-6">
        <Panel label="iPad" note="content column of the three-column layout" width={620}>
          <OverlayHost>{children(nativeKit, "ipad")}</OverlayHost>
        </Panel>
        <Panel label="iPhone" note="one column, 390 pt" width={390}>
          <OverlayHost>{children(nativeKit, "iphone")}</OverlayHost>
        </Panel>
      </div>
    </div>
  )
}

const LOOKS = [
  { mode: "light", label: "Light", note: "blue + orange" },
  { mode: "dark", label: "Dark", note: "blue + orange" },
] as const

/** The web rendering in both looks at once. The native side follows the toolbar's Theme. */
export function Schemes({ children }: { children: ReactNode }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {LOOKS.map((look) => (
        <figure key={look.label} className="flex min-w-0 flex-col gap-2">
          <figcaption className="flex flex-wrap items-baseline gap-x-2 text-xs">
            <span className="font-medium tracking-wide uppercase">{look.label}</span>
            <span className="text-muted-foreground">{look.note}</span>
          </figcaption>
          <ClegraProvider scoped preview={{ mode: look.mode }} className="min-w-0 rounded-xl border p-4">
            {children}
          </ClegraProvider>
        </figure>
      ))}
    </div>
  )
}

export function DataTable({ head, rows }: { head: string[]; rows: ReactNode[][] }) {
  return (
    <div className="overflow-x-auto rounded-xl border">
      <table className="w-full border-collapse text-left text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            {head.map((h) => (
              <th key={h} scope="col" className="px-3 py-2 font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b align-top last:border-b-0">
              {row.map((cell, j) => (
                <td key={j} className={`px-3 py-2 ${j === 0 ? "font-mono text-[13px] whitespace-nowrap" : "text-muted-foreground"}`}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function DoDont({ doThis, dont }: { doThis: string[]; dont: string[] }) {
  const list = (title: string, items: string[], color: string) => (
    <div className="flex flex-col gap-2 rounded-xl border p-4" style={{ borderTopWidth: 3, borderTopColor: color }}>
      <h3 className="text-sm font-semibold">{title}</h3>
      <ul className="flex list-disc flex-col gap-1 pl-5 text-sm text-muted-foreground">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  )
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {list("Do", doThis, "var(--success)")}
      {list("Don't", dont, "var(--destructive)")}
    </div>
  )
}

export function Code({ children, label }: { children: string; label?: string }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    void navigator.clipboard?.writeText(children).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }
  return (
    <div className="overflow-hidden rounded-xl border">
      <div className="flex items-center justify-between border-b bg-muted/50 px-3 py-1.5">
        <span className="text-xs text-muted-foreground">{label ?? "Example"}</span>
        <button type="button" onClick={copy} className="min-h-6 rounded px-2 text-xs font-medium underline-offset-4 hover:underline" aria-live="polite">
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto p-3 text-[13px] leading-relaxed">
        <code>{children}</code>
      </pre>
    </div>
  )
}

export function Notes({ items }: { items: ReactNode[] }) {
  return (
    <ul className="flex max-w-3xl list-disc flex-col gap-1.5 pl-5 text-sm text-muted-foreground">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  )
}

export function Callout({ children }: { children: ReactNode }) {
  return <p className="max-w-3xl rounded-xl border-l-4 border-l-primary bg-muted/50 px-4 py-3 text-sm">{children}</p>
}
