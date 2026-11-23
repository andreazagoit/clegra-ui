# @clegra/ui

> The public repository, [github.com/andreazagoit/clegra-ui](https://github.com/andreazagoit/clegra-ui), is a
> read-only snapshot of each version, published from where the package is developed: issues are welcome there,
> pull requests are not merged.

Clegra's design system. MIT. The app shell every Clegra web app is framed by (the rail with the person's face, the
inner bar, the floating glass header, the page's column), components for React (shadcn's components on Base UI) and React Native (the same names
and props; SwiftUI through Expo UI on iOS where it has the control), the theme (light and dark), plain tokens, and
`<ClegraProvider>`, which gives an app's own MCP Apps view the look of the host it is shown in. Every Clegra app uses
it, Clegra's own included: there is one public `@clegra/ui`.

```sh
npm i @clegra/ui@next
```

ESM JavaScript with its type declarations, Node 20+. Every library it draws with (React 19, Base UI, lucide,
recharts, sonner, React Native's, Tailwind 4…) is an **optional peer dependency**: install those your components
use. In a Next.js app that is also a Clegra app, `npx @clegra/sdk init --ui` adds `@clegra/ui`, the web libraries and
the stylesheet for you. `@clegra/ui` does not depend on `@clegra/sdk`.

Versions before 1.0 are prereleases on the dist-tag `next`; [docs/RELEASE.md](docs/RELEASE.md) says how the tarball is
made, checked and published. The full guide: [docs/guide.md](docs/guide.md).

## Use it

```css
/* app/globals.css (Tailwind 4) */
@import "tailwindcss";
@import "@clegra/ui/styles.css";
@import "@clegra/ui/glass.css";
```

Without Tailwind: `import "@clegra/ui/prebuilt.css"` once, in the root layout (it holds both).

```tsx
import { AppShell, ShellRail, ShellMain, ShellPage } from "@clegra/ui/shell"   // web
import { Button } from "@clegra/ui/components/button"   // web, or native under the react-native condition
import { RowList, Row, FactList, Fact } from "@clegra/ui/clegra/rows"
import { ClegraProvider } from "@clegra/ui/frame"
import { colorsFor } from "@clegra/ui/tokens"
```

**The shell.** A Next.js app frames its pages exactly as Clegra's client does:

```tsx
<AppShell link={Link} embedded={embedded} rail={<ShellRail brand={…} groups={[{ id: "pages", items }]} user={{ name, email, menu }} />}>
  <ShellMain label="Orders">
    <div className="px-(--shell-gutter) pt-(--shell-header) pb-(--shell-bottom)">
      <ShellPage title="Orders" description="Every order, newest first.">{cards}</ShellPage>
    </div>
  </ShellMain>
</AppShell>
```

Presentational: your link component (`link`), your words (props), your data. Inside Clegra (an embedded page) pass
`embedded`: the shell draws no chrome, only the page, and `useShell()` says so; a layout of the app's embed route
(`app/embed/layout.tsx`) passes it, so it is decided on the server. The guide has the full example
([docs/guide.md](docs/guide.md#the-app-shell)).

**An app's own website.** `SiteShell` frames it (in a card inside Clegra, or on its own in a tab): the app's inner bar
as a left sidebar flush to the page's edges, a slim top bar with ☰ and a drawer under 768
([docs/guide.md](docs/guide.md#an-apps-own-website-siteshell)).

**Fonts.** The package ships Clegra's type: Inter and Geist Mono (variable woff2, latin, SIL Open Font License, in
`fonts/`). `styles.css` and `prebuilt.css` declare them (`font-display: swap`) and default `--font-sans` and
`--font-mono` to them ahead of a system stack: the stylesheet alone is enough. To use another font, set the variable
(next/font's `variable: "--font-sans"` on `<html>`, or a `:root` rule): the theme's value is in Tailwind's theme
layer, so yours wins, and the bundled file is then never downloaded. `tokens` carries sizes and line heights only.

## Entries

| Import | Platform | What |
| --- | --- | --- |
| `@clegra/ui/components/<name>` | web, React Native | A component: web in a browser bundle, native under `react-native` (Expo UI under Metro's `ios`) |
| `@clegra/ui/react/components/<name>`, `@clegra/ui/react-native/components/<name>` | one platform | The web or the native version explicitly |
| `@clegra/ui/drawn/components/<name>`, `@clegra/ui/drawn/base-ui/<name>` | web (react-native-web), React Native | The drawn (`.native`) versions on any platform, e.g. for a gallery |
| `@clegra/ui/base-ui/<name>` (+ `react/`, `react-native/`) | both | Base UI parts the components build on (`popover`) |
| `@clegra/ui/hooks/<name>` (+ `react/`, `react-native/`) | both | `use-mobile` |
| `@clegra/ui/primitives` (+ `react/`, `react-native/`) | both | HTML's elements under the same names on both platforms |
| `@clegra/ui/shell` | web | The app shell: `AppShell` (`embedded`), `ShellRail` (blocks of glass, the account block with `user`, slots), `NavBar`, `NavSections`, `SectionsPill`, `ShellHeader`, `DrawerPill`, `ShellMain`, `ShellPage`, `PageHeading`, `useShell`, `AppIconImage`, `ShortcutsDialog`, the header's pills and surfaces |
| `@clegra/ui/shell/reorder` | web | `railReorder` for `ShellRail`'s `reorder` (the only entry using the optional `@dnd-kit/*` peers) |
| `@clegra/ui/clegra/<name>` | web | `pill`, `surface`, `rows` (`RowList`, `Row`, `RowIcon`, `FactList`, `Fact`), `confirm-switch` (`ConfirmSwitch`), `app-accent` (`AppAccent`, `useAppAccent`) |
| `@clegra/ui/frame` | web | `ClegraProvider`, `useClegraTheme`, `useClegraHost`, `hostContextFor` |
| `@clegra/ui/tokens` | any | `colorsFor(mode)`, `radius`, `type` |
| `@clegra/ui/accents` | any | The apps' accents, a closed palette of ten names (`blue` default … `gray`): `APP_ACCENT_NAMES`, `appAccentColors`, `isAppAccent`, `appAccentVariables`; `data-app-accent` / `<AppAccent>` / `<AppShell accent>` tint an app's area (docs/guide.md «An app's accent») |
| `@clegra/ui/native/<name>` | React Native | `theme`, `overlay`, `toast`, `icons`, `icon-context`, `expo-ui-controls`, `expo-ui-*`, `tw`, `use-tw`, `slot`, `lucide`, `sf-symbols`, `form-context`, `chat-context`, `checkbox-el` |
| `@clegra/ui/metro` | React Native | `withClegraUI(config)` for Expo's Metro |
| `@clegra/ui/styles.css`, `glass.css`, `theme.css`, `shadcn.css`, `accents.css`, `prebuilt.css` | web | The stylesheets (`glass.css`: the glass layer the shell needs; `prebuilt.css`: compiled, both in, no Tailwind needed) |

Everything is public: the app shell and every component, the assistant's too (sidebar, navigation-menu, menubar,
bubble, message, message-scroller, trace, questionnaire, marker, attachment, code-block, sonner, resizable, form).
The shell and `clegra/*` are web only (no `react-native` condition): React Native apps use the components.

## This repository

The package is the repository's root; `.github/workflows/publish.yml` publishes each new version to npm with provenance ([docs/RELEASE.md](docs/RELEASE.md)).

| Path | What | In the tarball |
| --- | --- | --- |
| `src/` | Components (`*.tsx` web, `*.native.tsx`, `*.ios.tsx`), `shell/`, `clegra/`, `base-ui/`, `hooks/`, `native/`, `frame/`, `primitives`, `tokens`, the stylesheets (`glass.css` too) and the palette (`brand/`), the fonts (`fonts/`), `metro.cjs` | built, as `dist/` |
| `docs/` | The guide, the release steps | no |
| `scripts/` | The build, `prepack`/`postpack`, the pack check, the public Storybook's check | no |
| `.storybook/`, `.storybook-public/`, `storybook/` | The Storybook (dev-only): every component, web and React Native, the face, the records, examples (`storybook/examples`); the public build is the app developers' catalogue (`storybook/apps`, the «Apps» stories only) | no |
| `components.json` | shadcn's settings: components are added with shadcn's CLI and stay as shadcn made them | no |

```sh
npm ci
npm run typecheck   # tsc over src/, then over the Storybook (storybook/tsconfig.json)
npm test            # the theme's tests (tokens against the stylesheets, the frame's theme, the native tw helper), the shell's (its rules, its server render standalone and embedded), the confirm switch's rule
npm run build       # dist/ (git-ignored); npm pack builds it itself
npm run pack:check  # slow: npm pack, the publish guard, the fonts, plain Node, a fresh Next.js + Tailwind 4 app with the sidebar and <AppShell> (standalone and embedded)
npm run storybook                # the catalogue by eye (http://localhost:6006)
npm run build-storybook:public   # the public catalogue, into storybook-public/ (git-ignored)
npm run check:storybook:public -- --forbidden <list.mjs>   # only «Apps» stories, nothing internal in the build
```

In the repository the package exports its TypeScript and CSS source. `npm pack` and `npm publish` build `dist/` and
swap in a package.json whose exports point there (scripts/prepack.mjs); scripts/postpack.mjs puts the repository's back.
