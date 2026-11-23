import { Badge } from "@clegra/ui/components/badge"
import { Button } from "@clegra/ui/components/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@clegra/ui/components/card"
import { ClegraProvider, clegraStyleVariables, useClegraTheme } from "@clegra/ui/frame"

import { Callout, Code, DataTable, DocPage, DoDont, Notes, Section } from "./doc"

/** Apps › Introduction and Apps › Frame theming. */

export function IntroductionPage() {
  return (
    <DocPage title="Design for Clegra apps" lead="How an application looks inside Clegra, and what Clegra gives you so it looks right on the web, the Mac, the iPad and the iPhone without drawing it four times.">
      <Section title="Data first: you send data, Clegra lays it out">
        <Notes
          items={[
            "An application sends typed data, says what each field means (semantic roles) and which actions exist. Clegra draws it with native components on every device.",
            "The assistant composes its answers from the same catalogue of components, bound to your data by URI: it never retypes a value.",
            "The same record is a card in an answer, a row in a list, a chip in a sentence, a widget on the home, and one spoken sentence. You declare it once.",
            "A custom view in a frame is the escape hatch, for what data can't describe: a map, a canvas, a designer.",
          ]}
        />
      </Section>
      <Section title="Where to look">
        <DataTable
          head={["Section", "What it is", "You need it when"]}
          rows={[
            ["Catalogue", "record, list, table, chart, stat, timeline, form: the components Clegra draws from typed data, with the roles each reads and its surfaces", "always: this is how your records appear outside your pages"],
            ["Declared views", "table, cards, detail, form, chart, number, frame: what a page of your application shows, on each device", "your application has pages"],
            ["Components", "the @clegra/ui components a custom view may use, with props, do and don't, examples, accessibility", "you build a frame"],
            ["Frame theming", "<ClegraProvider>: the host's look inside your view", "you build a frame"],
          ]}
        />
      </Section>
      <Section title="Entry points of @clegra/ui" lead="The design library, its own package: one import path per entry. Its UI libraries are optional peer dependencies (npx @clegra/sdk init --ui adds them).">
        <DataTable
          head={["Import", "Platform", "What"]}
          rows={[
            ["@clegra/ui/components/<name>", "web · React Native", "A component. Resolves to the web version in a browser bundle and to the native one under the `react-native` condition."],
            ["@clegra/ui/react/components/<name>", "web", "The web version, explicitly."],
            ["@clegra/ui/react-native/components/<name>", "React Native", "The native version, explicitly (iOS: SwiftUI through Expo UI where it exists)."],
            ["@clegra/ui/frame", "web", "<ClegraProvider>, useClegraTheme, useClegraHost, hostContextFor."],
            ["@clegra/ui/tokens", "any", "The theme as plain values: colours per scheme and mode, radii, type sizes."],
            ["@clegra/ui/prebuilt.css", "web", "The whole stylesheet, compiled: tokens, theme and every class the components use. No Tailwind in your build."],
            ["@clegra/ui/styles.css", "web", "The same as a Tailwind CSS 4 entry: import it after `tailwindcss` and use Tailwind's classes in your own markup too."],
            ["@clegra/ui/hooks/<name>, @clegra/ui/primitives", "web · React Native", "use-mobile; HTML's elements under the same names on both platforms."],
            ["@clegra/ui/native/theme, @clegra/ui/metro", "React Native", "useColors, setThemeChoice; the Metro helper that picks the iOS files."],
          ]}
        />
        <Callout>Inside Clegra, an application&apos;s own code runs only as a web view in a frame. The React Native entry points are for Clegra&apos;s apps and for standalone Expo apps that want the same look; on iPhone and iPad your application is native through declared views and artifacts.</Callout>
      </Section>
      <Section title="The look is not yours to set">
        <DoDont
          doThis={["Use the tokens: `bg-background`, `text-muted-foreground`, `var(--primary)`.", "One palette for every account (blue and orange): let the person pick light or dark and the text size.", "Write UI copy in Italian, plain, «tu» form."]}
          dont={["No second accent: each scheme has exactly one, and it is Clegra's.", "No fake system UI: no sidebar, no header, no Clegra dialogs, no assistant bubbles drawn by you.", "No fixed colours, no fixed pixel font sizes, no fixed frame heights."]}
        />
      </Section>
    </DocPage>
  )
}

const VIEW = `import { createRoot } from "react-dom/client"
import { ClegraProvider, useClegraHost, useClegraTheme } from "@clegra/ui/frame"
import { Button } from "@clegra/ui/components/button"
import "@clegra/ui/prebuilt.css" // or, with Tailwind 4 in your build: @import "tailwindcss"; @import "@clegra/ui/styles.css";

function View() {
  const host = useClegraHost()
  const { mode, scheme, locale } = useClegraTheme()
  return (
    <main style={{ padding: "1rem" }}>
      <Button onClick={() => host.request("tools/call", { name: "spedizioni_refresh", arguments: {} })}>
        Aggiorna
      </Button>
    </main>
  )
}

createRoot(document.getElementById("root")!).render(
  <ClegraProvider appInfo={{ name: "spedizioni-map", version: "1.0.0" }}>
    <View />
  </ClegraProvider>,
)`

const WITH_EXT_APPS = `// With the official MCP Apps client owning the bridge: pass its host context.
import { App } from "@modelcontextprotocol/ext-apps"
import { ClegraProvider } from "@clegra/ui/frame"

const app = new App({ name: "spedizioni-map", version: "1.0.0" })
await app.connect()

function Root() {
  const [context, setContext] = useState(app.getHostContext())
  useEffect(() => { app.onhostcontextchanged = (changed) => setContext((c) => ({ ...c, ...changed })) }, [])
  return <ClegraProvider hostContext={context}><View /></ClegraProvider>
}`

const HOST = `// HOST SIDE (Clegra's shell): the look as standard host-context fields.
import { hostContextFor } from "@clegra/ui/frame"

const look = hostContextFor({ mode: "dark", textScale: 1.15, locale: "it-IT", os: "ios" })
// → { theme: "dark",
//     styles: { variables: { "--color-background-primary": "#0A0A0A", …, "--clegra-primary": "#2D4BEE", … } },
//     locale: "it-IT", platform: "mobile",
//     _meta: { [CLEGRA_UI_META_KEY]: { textScale: 1.15, os: "ios" } } }
// Merge it into the ui/initialize result's hostContext; send it again with
// ui/notifications/host-context-changed whenever the look changes.`

function Inside() {
  const theme = useClegraTheme()
  return (
    <Card className="max-w-sm">
      <CardHeader>
        <CardTitle>SP-2026-0481</CardTitle>
        <CardDescription>Rossi Srl · Verona</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap items-center gap-2">
        <Badge variant="outline">In viaggio</Badge>
        <span className="text-sm text-muted-foreground">
          {theme.mode} · {theme.locale} · ×{theme.textScale}
        </span>
      </CardContent>
      <CardFooter className="gap-2">
        <Button size="sm">Avvisa il cliente</Button>
        <Button size="sm" variant="outline">
          Riprogramma
        </Button>
      </CardFooter>
    </Card>
  )
}

export type FrameThemingArgs = { mode: "light" | "dark"; textScale: number }

export function FrameThemingPage({ mode, textScale }: FrameThemingArgs) {
  const variables = clegraStyleVariables(mode)
  const own = Object.entries(variables).filter(([name]) => name.startsWith("--clegra-"))
  return (
    <DocPage title="Frame theming" lead="An application's own view is web content in a sandboxed frame. <ClegraProvider> makes it look like the Clegra around it: light or dark, the tokens, the person's text size and locale, and a frame as tall as its content.">
      <Callout>
        Built on the MCP Apps standard (<code>io.modelcontextprotocol/ui</code>): the look rides in the standard host context, so a view written this way also renders in other MCP Apps hosts. Clegra adds the text size.
      </Callout>
      <Section title="Try it" lead="Change Mode and Text scale in the Controls panel: this is the provider in preview mode, applying what a host would send.">
        <ClegraProvider scoped preview={{ mode, textScale }} className="rounded-xl border p-6">
          <div style={{ fontSize: `${textScale}rem` }}>
            <Inside />
          </div>
        </ClegraProvider>
      </Section>
      <Section title="In your view">
        <Code label="main.tsx">{VIEW}</Code>
        <Notes
          items={[
            <>
              The complete example is one React file, one stylesheet, one HTML page: «A view in a frame» in the <code>@clegra/ui</code> guide.
            </>,
            <>
              Two stylesheets, one choice: <code>@clegra/ui/prebuilt.css</code> needs nothing in your build and styles the components; lay out your own markup with plain CSS and the tokens (<code>var(--background)</code>, <code>var(--border)</code>). With Tailwind 4 in your build, import <code>@clegra/ui/styles.css</code> instead and use Tailwind&apos;s classes everywhere.
            </>,
            "Until the host answers, the provider renders `fallback` (nothing by default), so the view never flashes in the wrong colours.",
            "Opened outside a host (a browser tab while developing) it follows the system's light or dark; `preview={{ mode }}` fixes a look.",
          ]}
        />
        <Code label="with @modelcontextprotocol/ext-apps">{WITH_EXT_APPS}</Code>
      </Section>
      <Section title="What the provider does">
        <DataTable
          head={["From the host", "Applied as"]}
          rows={[
            ["hostContext.theme", "the `dark` class and `data-theme` on <html>, `color-scheme`"],
            ["hostContext.styles.variables", "custom properties on <html>: the standard names as sent, and the library's roles (`--background`, `--primary`…) from `--clegra-*`, or from the standard names in a host that is not Clegra"],
            ['_meta["clegra/ui"].textScale', "the root font size: everything in rem follows the person's text size (Dynamic Type on iPhone and iPad)"],
            ["hostContext.locale", "`lang` on <html>; `useClegraTheme().locale` for Intl formatting"],
            ['_meta["clegra/ui"].reducedMotion, contrast', "`data-reduced-motion`, `data-contrast` on <html>, beside the browser's own media queries"],
            ["(to the host) the content's size", "`ui/notifications/size-changed` on every change: the frame grows and shrinks, the page scrolls"],
          ]}
        />
      </Section>
      <Section title={`Clegra's roles for ${mode}`} lead="Sent as `--clegra-<role>`; the stylesheet reads them as `--<role>`. Use the roles, never the values.">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {own.map(([name, value]) => (
            <div key={name} className="flex items-center gap-3 rounded-lg border p-2">
              <span aria-hidden className="size-8 shrink-0 rounded-md border" style={{ background: name.endsWith("radius") ? "transparent" : value }} />
              <span className="flex min-w-0 flex-col">
                <code className="truncate text-[13px]">{name}</code>
                <span className="truncate text-xs text-muted-foreground">{value}</span>
              </span>
            </div>
          ))}
        </div>
      </Section>
      <Section title="Host side">
        <Code label="the shell">{HOST}</Code>
      </Section>
      <Section title="Do and don't">
        <DoDont
          doThis={["Size text and spacing in rem, so the person's text size applies.", "Leave the body transparent: the host's page is the ground.", "Bring your own loading, empty and error states.", "Honour reduced motion: no animation that is not a response to the person."]}
          dont={["Don't set a height on <html> or <body>, and don't scroll the whole view: report the size.", "Don't read `prefers-color-scheme` yourself: the person may have chosen the opposite of the system in Clegra.", "Don't cache the look: it changes while the view is open.", "Don't treat the host context as trusted input for anything but appearance."]}
        />
      </Section>
      <Section title="Accessibility">
        <Notes
          items={[
            "At text scale 2 a view must still work: let text wrap, never clip it; nothing depends on a fixed height.",
            "Targets are at least 44 by 44 pt when `platform` is mobile (`useClegraTheme().platform`).",
            "Text keeps a contrast of at least 4.5:1 in light and dark: the roles guarantee it, hard-coded colours don't.",
            "The frame has a title given by the host (the page's or the artifact's name); your view starts with its content, not with a repeated heading.",
          ]}
        />
      </Section>
    </DocPage>
  )
}
