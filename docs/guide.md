# `@clegra/ui`: the design library

`@clegra/ui` is Clegra's design system: Clegra's components for React (shadcn's components on
Base UI) and React Native (the same names and props; SwiftUI through Expo UI on iOS where it has the control), the
theme (light and dark) and `<ClegraProvider>`, which gives an app's own view the look of the Clegra it is shown in.

Most apps need none of it. An app sends **typed data** and says what each field means; Clegra lays it out natively on
the web and the Mac (the Clegra apps specification in `@clegra/sdk`: pages, artifacts). On the iPhone and iPad an app's pages are its own UI: its embedded
pages and its MCP Apps views (the generated one or yours) in a WebView, with Clegra's native navigation, actions,
forms and confirmations around them, and its records in chat as Clegra's generic card. `@clegra/ui` is for what data
can't describe: an app's own view in a frame (an MCP Apps view, spec §5) and the app's own web pages.

## Install

`@clegra/ui` is its own package; an app that only serves MCP (`@clegra/sdk`, Node, no React) never installs it. Its
libraries are **optional peer dependencies**. In a Next.js app that is a Clegra app, add it with the SDK's CLI:

```sh
npx @clegra/sdk init --ui     # or, after `npx @clegra/sdk init`, the same with --ui
npm install
```

`--ui` adds `@clegra/ui` and the web libraries it imports to your `package.json` (`@base-ui/react`, `lucide-react`,
`class-variance-authority`, `cn`, `cmdk`, `date-fns`, `recharts`, `sonner`, … at the ranges `@clegra/ui` declares;
nothing already there is changed) and puts `@import "@clegra/ui/styles.css";` after `@import "tailwindcss";` in
`app/globals.css`. Without Tailwind it tells you what to do by hand (below). `--dry-run` prints and writes nothing.

| You need | For |
| --- | --- |
| `react` 19, `react-dom` 19 | the web (a Next.js app has them) |
| `tailwindcss` 4 | only for the Tailwind entry, `styles.css` |
| `react-native`, `react-native-svg`, `lucide-react-native`, `@expo/ui` | React Native (Expo); `@expo/ui` for the iOS controls |

The library is ESM JavaScript with `.d.ts` beside each file; the client components keep their `"use client"`.
Nothing is bundled: your bundler sees one copy of React and Base UI.

## Entry points

| Import | Platform | What |
| --- | --- | --- |
| `@clegra/ui/components/<name>` | web, React Native | A component: the web version in a browser bundle, the native one under the `react-native` condition (and the Expo UI one under Metro's `ios`, see «React Native») |
| `@clegra/ui/react/components/<name>` | web | The web version, explicitly |
| `@clegra/ui/react-native/components/<name>` | React Native | The native version, explicitly |
| `@clegra/ui/shell` | web | The app shell: `AppShell`, `ShellRail`, `NavBar`, `NavSections`, `ShellHeader`, `ShellMain`, `ShellPage`, `PageHeading`, `useShell`, `SiteShell` (an app's own website), … (below, «The app shell») |
| `@clegra/ui/shell/reorder` | web | `railReorder`: dragging the rail's items into the person's order (needs `@dnd-kit/*`) |
| `@clegra/ui/clegra/<name>` | web | Clegra's layer over shadcn: `pill` (the header's pills), `surface` (floating panels, the scroll edge, `Segmented`), `rows` (`RowList`, `Row`, `RowIcon`, `FactList`, `Fact`), `confirm-switch`, `app-accent` (`AppAccent`, `useAppAccent`, `appAccentProps`) |
| `@clegra/ui/frame` | web | `ClegraProvider`, `useClegraTheme`, `useClegraHost`, `hostContextFor` |
| `@clegra/ui/tokens` | any | The theme as plain values: `colorsFor(mode)`, `radius`, `type` |
| `@clegra/ui/accents` | any | The apps' accents: `APP_ACCENT_NAMES`, `appAccentColors`, `isAppAccent`, `appAccentOf`, `appAccentVariables` (below, «An app's accent») |
| `@clegra/ui/styles.css` | web | The stylesheet as a Tailwind CSS 4 entry: tokens, theme, the fonts, the components' variants |
| `@clegra/ui/glass.css` | web | Clegra's glass layer (after `styles.css`): the shell's panels and pills, menus, `.glass-table`, `.glass-card` |
| `@clegra/ui/prebuilt.css` | web | `styles.css` and `glass.css` compiled: no Tailwind in your build |
| `@clegra/ui/theme.css`, `@clegra/ui/shadcn.css` | web | The two parts of `styles.css`, separately |
| `@clegra/ui/accents.css` | web | The accents' scopes (`data-app-accent`), already in `styles.css` and `theme.css` |
| `@clegra/ui/hooks/<name>` | web, React Native | `use-mobile` |
| `@clegra/ui/primitives` | web, React Native | HTML's elements under the same names on both platforms |
| `@clegra/ui/base-ui/<name>` | web, React Native | Base UI parts the components build on (`popover`) |
| `@clegra/ui/drawn/components/<name>`, `@clegra/ui/drawn/base-ui/<name>` | web (react-native-web), React Native | The drawn (`.native`) version on any platform, e.g. a gallery showing the native look in a browser |
| `@clegra/ui/native/theme`, `/overlay`, `/toast`, `/icons`, `/icon-context`, `/expo-ui-controls`, … | React Native | `useColors`, `setThemeChoice`; the overlay host; `toast()` (the native side of sonner); icons; `ExpoHost` (Expo UI's `Host` in the app's colour scheme) and the layout helpers the native controls share; every file of `native/` is an entry |
| `@clegra/ui/metro` | React Native | `withClegraUI(config)` for Metro |

There is no `@clegra/ui` root entry: one import path per component, so a bundle holds what it uses. Only the
stylesheets have side effects. Everything is public, the app shell and the components of Clegra's own assistant
too (sidebar, navigation-menu, menubar, bubble, message, message-scroller, trace, questionnaire, marker, attachment,
code-block, sonner, resizable, form): Clegra itself is built with this package, and so is every app.

## Tailwind 4

```css
/* app/globals.css */
@import "tailwindcss";
@import "@clegra/ui/styles.css";
@import "@clegra/ui/glass.css";   /* the glass layer: the shell, menus' and buttons' shape (leave it out for plain shadcn shapes) */
```

That is all: `styles.css` carries an `@source` of its own folder, so Tailwind finds the classes the components use
wherever the package is installed. Your markup can use Tailwind's classes with Clegra's roles (`bg-background`,
`text-muted-foreground`, `border-border`, `rounded-lg`).

Without Tailwind, import the compiled stylesheet once (in a Next.js app, in `app/layout.tsx`):

```tsx
import "@clegra/ui/prebuilt.css"
```

It styles the components and sets the tokens; it holds the classes the components use, not all of Tailwind, so lay
out your own markup with plain CSS and the variables (`var(--background)`, `var(--border)`, `var(--radius)`).

### Fonts

The package ships Clegra's type: **Inter** (sans) and **Geist Mono** (mono), each one variable woff2 (weights 100 to
900, latin subset: 47 kB and 23 kB) in `fonts/`, with their SIL Open Font License texts beside them. `styles.css` and
`prebuilt.css` declare them (`@font-face`, `font-display: swap`) and set `--font-sans` (and `--font-heading`, the same)
and `--font-mono` to them ahead of a system stack, so the stylesheet alone gives the right typography: no
`next/font`, no `@fontsource`, nothing to configure. Your bundler copies the two files with the CSS (Next.js, Vite
and webpack follow `url()`s in an imported stylesheet).

To use another font, define the variable yourself; the theme's values sit in Tailwind's theme layer, so yours wins
whatever the order:

```tsx
// app/layout.tsx: next/font sets --font-sans on <html>
const brand = Inter_Tight({ subsets: ["latin"], variable: "--font-sans" })
<html className={brand.variable}>…</html>
```

```css
/* or plain CSS, after the imports */
:root { --font-sans: "My Font", ui-sans-serif, system-ui, sans-serif; }
```

The bundled files load only when text uses them: with your own `--font-sans`, Inter is never downloaded.

```tsx
import { Button } from "@clegra/ui/components/button"
import { Card, CardContent, CardHeader, CardTitle } from "@clegra/ui/components/card"

export default function Page() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Ordine 1024</CardTitle>
      </CardHeader>
      <CardContent>
        <Button>Salva</Button>
      </CardContent>
    </Card>
  )
}
```

## The app shell

Every Clegra web app has the same frame, Clegra's own client included: the **rail** (the app's places as tiles in glass
blocks, the signed-in person's face in a block of its own at the bottom), an optional docked **inner bar** (240), a **floating header** of glass pills
over the content, and the page under it with the shell's gutters. `@clegra/ui/shell` draws it, exactly as the client
does; you configure it with props. It is presentational: no router (your link component comes in as `link`), no
i18n (every word is a prop), no data, no persistence. Web only (React DOM; there is no native shell).

```css
/* app/globals.css: the one way to style it */
@import "tailwindcss";
@import "@clegra/ui/styles.css";
@import "@clegra/ui/glass.css";   /* the shell's glass: panels, header pills, menus, .glass-table, .glass-card */
```

(`prebuilt.css` already holds the glass.) Then, a client component the layouts share:

```tsx
// components/frame.tsx
"use client"

import Link from "next/link"
import { BarChart3Icon, HouseIcon, InboxIcon, LogOutIcon, UserRoundIcon, UsersIcon } from "lucide-react"
import { usePathname } from "next/navigation"
import { AppShell, DrawerPill, isCurrentPath, ShellHeader, ShellMain, ShellRail, useShell } from "@clegra/ui/shell"

const pages = [
  { id: "home", label: "Home", href: "/home", icon: HouseIcon, shortcut: "⌥1" },
  { id: "orders", label: "Orders", href: "/orders", icon: InboxIcon, shortcut: "⌥2", badge: 4 },
  { id: "customers", label: "Customers", href: "/customers", icon: UsersIcon, shortcut: "⌥3" },
  { id: "reports", label: "Reports", href: "/reports", icon: BarChart3Icon, shortcut: "⌥4" },
]

function Header() {
  const { phone } = useShell()
  if (!phone) return null   // wider, the rail is on screen: the header holds only the page's own pills
  return <ShellHeader phone><DrawerPill label="Open the menu" /></ShellHeader>
}

export function Frame({ embedded = false, children }: { embedded?: boolean; children: React.ReactNode }) {
  const pathname = usePathname()
  return (
    <AppShell
      link={Link}
      embedded={embedded}
      rail={
        <ShellRail
          brand={({ rail }) => <MyMark compact={rail} />}            // your mark, never Clegra's
          groups={[{ id: "pages", label: "Pages", items: pages.map((p) => ({ ...p, active: isCurrentPath(pathname, p.href) })) }]}
          user={{
            name: "Anna Rossi",
            email: "anna@example.com",
            menu: [
              { kind: "item", id: "profile", label: "Profile", icon: UserRoundIcon, href: "/profile" },
              { kind: "separator", id: "line" },
              { kind: "item", id: "sign-out", label: "Sign out", icon: LogOutIcon, onSelect: signOut },
            ],
          }}
        />
      }
      header={<Header />}
    >
      <ShellMain label="Orders">
        {/* The shell's gutters: 64 under the floating header, room for the bottom; embedded, the header's room is given back. */}
        <div className="flex w-full min-w-0 flex-1 flex-col px-(--shell-gutter) pt-(--shell-header) pb-(--shell-bottom)">{children}</div>
      </ShellMain>
    </AppShell>
  )
}
```

```tsx
// app/(app)/layout.tsx
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <Frame>{children}</Frame>
}

// app/(app)/orders/page.tsx
import { Button } from "@clegra/ui/components/button"
import { ShellPage } from "@clegra/ui/shell"

export default function Orders() {
  return (
    <ShellPage title="Orders" description="Every order of the shop, newest first." layout="full" actions={<Button>New order</Button>}>
      <div className="grid gap-4 @[680px]:grid-cols-2">{/* cards */}</div>
      <div className="glass-table">{/* shadcn's <Table>: the head block and the rows' card, as in Clegra */}</div>
    </ShellPage>
  )
}
```

What it takes:

- `AppShell`: `link`, `rail`, `nav` (a docked inner bar: `NavBar` + `NavSections`), `list` (a docked list),
  `header` (`ShellHeader` with `HeaderGroup`s of `HeaderPill`/`PillItem`), `bottomBar`, `aside`, `chrome` (key
  listeners), `embedded`; `children` is the page in a `ShellMain` (the landmark, named after the page).
- `ShellRail`: a `brand` slot (a function of `{ rail }`: the rail's compact look or the phone drawer's row),
  `drawerSearch` (a field atop the phone's drawer only: the rail has no search tile), `groups` of `RailItem`s (`{ id,
  label, href, icon, tile?, active?, badge?, description?, shortcut?, external? }`), a `controls` slot, `footer` items,
  and `user`: `{ name, email, image?, label?, tooltip?, href? | onSelect?, active?, menu? }`. The rail is drawn in
  **blocks**, each its own glass pill, 8 apart with the ground between them: `brand` alone in the first; then every
  group is a block of its own, unless it has `join`: it goes on in the block of the group shown before it, right under
  it (`join: "flush"`) or after a thin line inside the pill (`join: "line"`); the last of these scrolls inside when
  the window is short. Detached at the bottom, aligned to the window's bottom edge, the **account block**:
  `controls` (your own tiles, drawn with `RAIL_LINK` and `RailTile`), the `footer` items (the account's or the
  system's places, such as settings) and the face. Test hooks: `data-rail-block="brand"` or `"<first group's id>"`, `data-rail-line`, `data-rail-account`. With `href`/`onSelect` and no `menu` the face goes
  there; with `menu` (`item`, `choice` such as the language or the theme, `separator`) it opens the menu headed by
  name and email.
- Phone (under 768): the panels go, the rail becomes a drawer (`DrawerPill` opens it), the inner bar folds into the
  header's `SectionsPill`. `useShell()` returns `{ phone, embedded, openDrawer, closeDrawer }`.
- Dragging a group into the person's order: give the group `onOrder(ids)` and the rail
  `reorder={railReorder}` from `@clegra/ui/shell/reorder`, the only entry that uses `@dnd-kit/core`,
  `@dnd-kit/sortable` and `@dnd-kit/utilities` (optional peers: install them only then).
- The page: `ShellPage` (`layout` `contained`, a 960 column, or `full`; `title`, `media`, `status`, `description`,
  `actions`, `toolbar`) and `PageHeading` alone. It is a container, so its cards can go two by two from 680 of room
  (`@[680px]:grid-cols-2`). Inside cards: `RowList`/`Row`/`RowIcon` (rows with a hairline between them) and
  `FactList`/`Fact` (label and value pairs) from `@clegra/ui/clegra/rows`; `ConfirmSwitch` from
  `@clegra/ui/clegra/confirm-switch` (a setting's switch whose consequential direction asks first). Wrap a shadcn
  `Table` in `.glass-table` and a plain block in `.glass-card` for Clegra's table and card.
- Also: `AppIconImage` (an app icon in Apple's mask), `CountBadge`, `Keys`, `ShortcutsDialog` (the list of
  shortcuts), `Face`, `isCurrentPath`, `initials`; the header's parts and surfaces (`HeaderGroup`, `HeaderPill`,
  `PillItem`, `PillDivider`, `Hint`, `ShortcutKeys`, `FloatingPanel`, `ScrollEdge`, `Segmented`) are re-exported
  from `@clegra/ui/clegra/pill` and `@clegra/ui/clegra/surface`.

### Inside Clegra: `embedded`

When Clegra shows one of your pages (an embedded page, `url: "/embed/…"` in your app's definition), Clegra draws the
chrome around it. Your page must not draw its own: with `embedded` the shell renders only the page (`children`) on
the ground, with no rail, inner bar, header, bottom bar, aside or `chrome`, and gives the header's room back.
`useShell().embedded` tells your components. Decide it on the server, so the chrome never flashes: the page's path is
under your embed route, so that route gets a layout of its own:

```tsx
// app/embed/layout.tsx: every page under /embed is shown inside Clegra
import { Frame } from "@/components/frame"
export default function EmbedLayout({ children }: { children: React.ReactNode }) {
  return <Frame embedded>{children}</Frame>
}
```

(`@clegra/sdk` handles the embed route itself: its proxy, the ticket, `getEmbedCaller`; `@clegra/ui` only takes the
boolean.)

### An app's own website: `SiteShell`

An app's own website (its pages Clegra shows in a card, the client drawing nothing around them, and the same pages
open on their own in a browser tab) has one frame: the app's inner bar as a **left sidebar**, flush to the page's
top, bottom and left (no floating panel, no radius, no glass; a hairline on its right), 240 wide on the sidebar's
ground. At the top a band of 56 with the app's tile and name; then its sections (the open one marked); its settings
and `footerExtra` pinned at the bottom. The page is beside it on `bg-background`, scrolling on its own at the
window's full height. Under 768 the sidebar folds into a slim flush top bar (☰ and the name) and opens as a drawer
from the left (a pick, Esc or a click outside closes it; focus stays inside while it is open). The switch is CSS
only, so the first HTML never flashes.

```tsx
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ReceiptIcon, SettingsIcon, UsersIcon } from "lucide-react"
import { isCurrentPath, type NavSection, SiteShell } from "@clegra/ui/shell"

export function SiteFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const item = (id: string, label: string, href: string, icon: typeof ReceiptIcon) => ({ id, label, href, icon, active: isCurrentPath(pathname, href) })
  const sections: NavSection[] = [
    { id: "main", items: [item("invoices", "Invoices", "/invoices", ReceiptIcon)] },
    { id: "records", label: "Records", items: [item("customers", "Customers", "/customers", UsersIcon)] },
  ]
  return (
    <SiteShell
      link={Link}
      accent="green"                                   // the app's accent (its manifest's); none: Clegra's blue
      brand={{ name: "Invoices", icon: ReceiptIcon, href: "/" }}   // or image: { light, dark? } (AppIconImage)
      label="Invoices sections"
      sections={sections}
      footer={[item("settings", "Settings", "/settings", SettingsIcon)]}
      footerExtra={<SignedInPerson />}                 // outside Clegra: the person and sign out
      menuLabel="Open menu"
      closeLabel="Close"
    >
      <div className="px-(--shell-gutter) py-8">{children}</div>
    </SiteShell>
  )
}
```

- Props: `link?` (`ShellLinkComponent`), `accent?` (`AppAccentName`: the whole site, the drawer included, takes it),
  `brand` (`SiteBrand`: `{ name, href?, icon?: ShellIcon, image?: AppIconImageSource }`; `icon` is drawn in a 28 tile on
  the accent, `image` masked by `AppIconImage`), `label` (the `aside`'s and its `nav`'s name), `sections`
  (`NavSection[]`), `footer?` (`NavItem[]`), `footerExtra?`, `menuLabel` (the ☰), `closeLabel` (the drawer's ✕),
  `id?` (`data-app-bar`, default `site`), `className?`, `children` (the page; put a `ShellPage` in it).
- Its parts are the inner bar's (`NavBar`, `NavSections`, `NavLink`): the same entries, tooltips and keys.
- Test hooks: `data-site-shell`, `data-site-sidebar` (the docked one), `data-site-bar` (the phone's top bar),
  `data-site-menu` (the ☰, with `aria-expanded` and `aria-controls`), `data-site-drawer`, `data-site-main`, and the
  inner bar's `data-app-bar` / `data-app-bar-entry`.
- Stylesheets: `@clegra/ui/styles.css` only (no glass is drawn); `glass.css` is harmless if the app has it.

## Theming tokens

The theme is shadcn's variables pointed at Clegra's palette (one blue, one orange accent, the same for every
account), light and dark:

- Roles: `--background`, `--foreground`, `--card`, `--popover`, `--primary`, `--secondary`, `--muted`, `--accent`,
  `--destructive`, `--border`, `--input`, `--ring`, `--chart-1`…`--chart-5`, and Clegra's own (`--yes`, `--highlight`,
  `--link`). Each is a Tailwind colour too (`bg-primary`, `text-muted-foreground`).
- Radii: `--radius` (0.875rem) and the scale `rounded-sm` … `rounded-4xl` derived from it; the glass layer's
  concentric radii (`--radius-panel` 22, `--radius-pill` 20, `--radius-card` 18, `--radius-item` 16, …).
- The shell's measures: `--shell-gutter`, `--shell-header`, `--shell-bottom`, `--shell-column`, `--shell-nav`,
  `--shell-rail`; a field's edge where it carries the control: `--control-edge`.
- Dark mode: the `dark` class on an ancestor (`<html class="dark">`); `@custom-variant dark` is in `styles.css`.
- Plain values for code that can't read CSS (React Native, canvas, email): `colorsFor("light" | "dark")` from
  `@clegra/ui/tokens`.

Rules: use the roles, never fixed colours; one accent (it marks the «sì» and one figure to notice); light or dark and
the text size belong to the person, so a view sets neither.

### An app's accent

Every app has its own tint colour, like Apple's apps: one name of a closed palette (never a free colour), declared
in its manifest (`accent` in `@clegra/sdk`; absent: `blue`, Clegra's).

| Name | Light fill / text | Dark fill / text |
| --- | --- | --- |
| `blue` (default) | `#2D4BEE` / `#2D4BEE` | `#2D4BEE` / `#8FA2FF` |
| `indigo` | `#4F46E5` / `#4338CA` | `#5850EC` / `#A5B4FC` |
| `purple` | `#8B2FD9` / `#7E22CE` | `#9340E0` / `#C9A6FF` |
| `pink` | `#C81E73` / `#BE185D` | `#D42A82` / `#F9A8D4` |
| `red` | `#D02424` / `#C81E1E` | `#E0302F` / `#FCA5A5` |
| `orange` | `#EA580C` / `#B33E05` | `#FB8C3C` / `#FB8C3C` |
| `yellow` | `#B88300` / `#875A00` | `#FACC15` / `#FACC15` |
| `green` | `#127535` / `#15803D` | `#34C759` / `#4ADE80` |
| `teal` | `#0F716A` / `#0F766E` | `#2DD4BF` / `#2DD4BF` |
| `gray` | `#636363` / `#5C5C5C` | `#6B6B6B` / `#A3A3A3` |

Each has a foreground (on the fill); every pair is WCAG AA (4.5:1 for text, also on the glass fill over the page's
grounds; 3:1 for the fill as a control), checked by `src/brand/accents.test.ts`. The values live in
`src/brand/accents.ts`; `src/brand/accents.css` is generated from them (`npm run accents`).

`data-app-accent="<name>"` on an element (or `<AppAccent accent>` from `@clegra/ui/clegra/app-accent`, or the
shell's `<AppShell accent>`, which marks the app's bar, list and content but not the rail or `aside`) sets
`--app-accent`, `--app-accent-foreground` and `--app-accent-text` (Tailwind: `bg-app-accent`, `text-app-accent-text`…)
and points the roles of the app's own controls at them: `--primary` and `--primary-foreground` (primary buttons,
switches, progress, checked boxes, every selected state), `--link` and `--ring` (links, the focus ring) and
`--sidebar-active`. Outside every app's area these are Clegra's blue; Clegra's chrome (the rail, the account menu, the Faccina,
the assistant) never takes an app's accent, and `--destructive`, `--success`, `--warning` never change.

### The glass fill and the selected state

Every solid coloured thing is one recipe, `.glass-fill` (in `styles.css`): the colour at 90% with the chrome's blur
behind it, a light inner edge and top highlight, the pills' shadow, the colour's foreground; solid with «Reduce
transparency». The colour is `--glass-fill` (default `--primary`, so the app's accent in its area) with
`--glass-fill-foreground`; `.glass-fill-neutral` is the neutral form. The primary `Button` and the solid `Badge`
(their default variant), the tinted `HeaderPill`, `.btn-yes` on a `Button` (in the «sì» colour) and the `Bubble`'s
`default` (`muted`: neutral) are glass fills; bubbles have corners of `--radius-bubble` (a capsule on one line).

The selected state has two tiers. A selected **control** (a set `PillItem`, the chosen `Segmented` segment, the active
`TabsTrigger`, a pressed `Toggle` or `ToggleGroupItem`, the open rail tile, a chosen chip) is the glass fill, never a
faded tint; anything else of the kind adds the class `selected` while it is chosen. Inside it the text roles
(`--foreground`, `--muted-foreground`, `--link`…) are the fill's foreground, so its words and icons stay readable;
an `Avatar`, an `AvatarGroupCount` or a `Badge` inside keeps its own colours. A selected **row** (the open row of a
list, the sidebar's active entry, an active `NavLink`, a sub-nav's open page, a table's checked row) is a subtle
neutral highlight instead: `--fill-strong` with the words in their usual colours; anything else of the kind adds the
class `selected-row`. Both are written outside Tailwind's layers, so a hover or ground a component sets for its other
states never paints over them.
shadcn's components are not restyled: they read the roles.

### A view in a frame

Inside Clegra (and in ChatGPT and Claude) an app's own view is an MCP Apps view in a sandboxed frame.
`<ClegraProvider>` speaks the standard (`ui/initialize`, the host context, `ui/notifications/host-context-changed`,
`ui/notifications/size-changed`): it applies the host's look (light or dark, the tokens, the text size, the locale),
follows every change and keeps the frame as tall as its content.

```tsx
import { createRoot } from "react-dom/client"
import { ClegraProvider, useClegraHost } from "@clegra/ui/frame"
import { Button } from "@clegra/ui/components/button"
import "@clegra/ui/prebuilt.css"

function View() {
  const host = useClegraHost()
  return <Button onClick={() => host.request("tools/call", { name: "order_refresh", arguments: {} })}>Aggiorna</Button>
}

createRoot(document.getElementById("root")!).render(
  <ClegraProvider appInfo={{ name: "orders-view", version: "1.0.0" }}>
    <main style={{ padding: "1rem" }}>
      <View />
    </main>
  </ClegraProvider>,
)
```

With the official client (`@modelcontextprotocol/ext-apps`) owning the bridge, pass its host context as the
`hostContext` prop. Outside a host it previews: `<ClegraProvider preview={{ mode: "dark" }}>`. A host draws the same
look with `hostContextFor({ mode, accent, … })`: `styles.variables` holds only the standard names (the official
client refuses others), with the app's accent in the info and ring ones; Clegra's own roles (`--clegra-<role>`) and
the `accent` name travel in `_meta["clegra/ui"]`. The provider applies both, and marks the document
`data-app-accent`, so a view's buttons, links and focus ring are in its app's tint.

## React Native

```js
// metro.config.js
const { getDefaultConfig } = require("expo/metro-config")
const { withClegraUI } = require("@clegra/ui/metro")
module.exports = withClegraUI(getDefaultConfig(__dirname))
```

```tsx
import { Button } from "@clegra/ui/react-native/components/button"
import { useColors } from "@clegra/ui/native/theme"
```

Every component has a native version (`x.native`): drawn with the tokens, on every platform. Where Expo UI has the
control, iOS gets a SwiftUI version (`x.ios`): `withClegraUI` turns on Metro's package exports and adds the `ios`
condition. Install `react-native`, `react-native-svg`, `lucide-react-native` and, for the iOS controls, `@expo/ui`.
Inside Clegra on iPhone and iPad an app shows its own UI (its embedded pages and views) with native controls around
it; the React Native entry points are for standalone Expo apps that want the same look.

## Versions and licence

Its own version and changelog ([CHANGELOG.md](../CHANGELOG.md)); before 1.0.0 a minor version may change a
component's props. MIT; the Clegra name, logo and face are trademarks and not part of the licence (`NOTICE.md` in the
package names the owner and the third-party work the library builds on).
