# Changelog

`@clegra/ui`, Clegra's design system. Newest first. Versions before 1.0 are prereleases on the npm dist-tag `next`.
Until this repository existed the library was the `ui` entry of the unscoped package that preceded `@clegra/sdk`; its
history is kept here.

## 0.1.0-next.14 (2026-11-23)

- **Breaking: Clegra's own window leaves the package.** `@clegra/ui/shell` no longer exports `AppShell`, `ShellMain`,
  `ShellHeader`, `DrawerPill`, `useShell`, `ShellRail`, `RailTile`, `RailActiveBar`, `RAIL_LINK`, `UserButton`,
  `Face` nor the types `RailItem`, `RailGroup`, `RailReorder`, `RailSlot`, `ShellUser`, `UserMenuEntry`; the entry
  `@clegra/ui/shell/reorder` (`railReorder`) is gone and with it the optional `@dnd-kit/*` peers. They drew Clegra's
  own chrome (its rail of apps, the account block), which apps never draw: Clegra frames them. What an app's own
  pages use stays: `SiteShell`, `NavBar`, `NavSections`, `NavLink`, `SectionsPill`, `ShellPage`, `PageHeading`,
  `AppIconImage`, `CountBadge`, `Keys`, `ShortcutsDialog`, the header's pills and surfaces, `ShellLinkProvider`,
  `isCurrentPath`, `initials`, `countLabel`. The guide's «The app shell» is now «An app's pages».

## 0.1.0-next.13 (2026-11-23)

- **Overlays in the app's accent** (owner, 2026-11-23: Calendar's date picker showed the chosen day in Clegra's blue
  inside the red app). Popovers, menus, context menus, selects, comboboxes, dialogs, alert dialogs, sheets, drawers,
  tooltips, hover cards and the navigation menu are portalled under `<body>`, outside the element carrying
  `data-app-accent`; each overlay's `Portal` now takes `useAppAccentProps()` (new in `clegra/app-accent`: the accent in
  force where the overlay opens, read from React's context, which crosses the portal; nothing outside every app's
  area). `AppShell`'s `chrome` (the search, the open app's menu) is in the open app's accent context too, so what it
  opens follows the app. A test keeps every web overlay's portal wired.

## 0.1.0-next.12 (2026-11-23)

- **One base for every second sidebar** (owner, 2026-11-23: an app's bar, a list and a site's sidebar were 240 or
  320). One width, `--shell-sidebar` (320, Posta's list), replaces `--shell-nav` (240) and `--shell-list`; with it
  `--shell-sidebar-band` (56, the top band), `--shell-sidebar-pad` (8, the rows from the sides) and
  `--shell-sidebar-row` (34, a nav row). `AppShell` sizes its `nav` and `list` panels itself (their content fills
  them), `NavBar`, `NavSections`, `NavLink` and `SiteShell`'s docked sidebar read the same tokens; the site's phone
  drawer stays 240. `--shell-clegra` becomes `--shell-side-panel` (380): every right side panel's width.

## 0.1.0-next.11 (2026-11-23)

- **One surface for every panel** (owner, 2026-11-23: the rail's blocks, the list, the side panel and the page were
  four tones). The new token `--panel` (light Grigio 50, dark Grigio 850; `--sidebar` is it, `tokens.ts` `panel`) and
  the class `.surface-panel` (`glass.css`): solid `--panel`, the hairline, no shadow. `FloatingPanel` uses it, so
  the rail's blocks, an app's bar and a sidebar page's list are one tone, the same as the phone's drawer and a
  site's sidebar; the rail's own tint (`--rail-tint`) is removed. With no shadow only the ground shows between and
  around the panels (the shadows drew a grey halo around the rail's blocks and in the window's corners).
  `.glass-thick` stays for menus, popovers and the composer. A selected row's secondary words are a step towards
  the text (about 6:1 on `--fill-strong` over the panel, light and dark; 4.1 / 4.4 before).

## 0.1.0-next.10 (2026-11-23)

- **Faces on a surface** (owner, 2026-11-23). A stack's ring (`AvatarGroup`'s faces and count) is the colour of the
  surface it sits on, never a hard white: the page (`--face-ring`, default `--background`), a glass pill or panel
  (its opaque tone), a selected control's fill. Faces in a `PillItem`'s `icon` are sized from the item (its height
  less 12, initials 8, each covering a third of the one before) with the same start padding, so a filter chip with
  people holds them evenly.

## 0.1.0-next.9 (2026-11-23)

- **The rail's blocks, with lines inside** (`ShellRail`, owner 2026-11-23). `brand` is a block of its own
  (`data-rail-block="brand"`), no longer with the first group. `RailGroup`'s `joinPrevious` is replaced by
  `join: "flush" | "line"`: the group goes on in the block of the group shown before it (an empty group in between no
  longer parts them), right under it or after a thin line inside the pill (40 wide, `data-rail-line`; in the phone's
  drawer the sidebar's separator). `railBlocks` returns each block's groups with their `line`. The `search` slot is
  gone from the rail: `drawerSearch` (a node) is a field atop the phone's drawer only; an app opens its search its own
  way from tablet width (⌘K).
- **The selected state in two tiers** (owner, 2026-11-23). Selected rows are neutral again: the new class
  `selected-row`, the sidebar's active entry (`SidebarMenuButton`, `SidebarMenuSubButton`), an active `NavLink` and a
  table's checked row are `--fill-strong` with the words in their usual colours, no longer the glass fill. Controls
  (a set `PillItem`, a segment, a tab, a pressed toggle, the open rail tile, `selected`) keep the glass fill in the
  app's colour. Inside a selected control an `Avatar`, `AvatarGroupCount` or `Badge` keeps its own initials, ground
  and ring (new `--own-foreground`, `--own-muted-foreground`).
- **Pills hold their items evenly** (owner, 2026-11-23): a `HeaderPill`'s gap between items equals its side padding
  (4), so icon buttons no longer touch while the sides have room; `PillDivider` drops its own margin (the gap is on
  each side).

## 0.1.0-next.8 (2026-11-23)

- **The glass fill and the selected state** (owner, 2026-11-23). One recipe for every solid coloured thing,
  `.glass-fill` (`src/brand/theme.css`, in `styles.css`): the colour at 90% with the regular blur behind it, a light
  inner edge and top highlight, the pills' shadow and the colour's foreground (`--glass-fill`,
  `--glass-fill-foreground`, default `--primary`; `--glass-fill-share`, `--glass-fill-edge`; solid with «Reduce
  transparency»), and `.glass-fill-neutral`. It replaces `.glass-tinted` (removed from `glass.css`; the tinted
  `HeaderPill` uses it). `Button` and `Badge`'s default variant is `glass-fill`; `.btn-yes` on a `Button` is the glass
  fill in its colour. Every **selected state** is the glass fill in the app's colour, never a faded tint: a set
  `PillItem` (its count reverses), the chosen `Segmented` segment, the active `TabsTrigger` (line tabs: the underline
  in the accent), a pressed `Toggle`/`ToggleGroupItem`, the sidebar's active entry, an active `NavLink`, the open
  rail tile and the face, a table's checked row, and the new class `selected` for anything else; inside it the text
  roles are the fill's foreground. A `QuestionnaireChoice` that is checked has a solid accent edge instead of a tint.
- **Bubbles**: `Bubble`'s `default` is the glass fill and `muted` the neutral one (no hover tint); `BubbleContent`'s
  corners are the new `--radius-bubble` (22: a capsule on one line, like the button).
- **Accents**: the soft ground is gone (`soft` from `AppAccentTone` and `appAccentVariables`, `--app-accent-soft`,
  `bg-app-accent-soft`, `--selection`; an MCP Apps view no longer receives `--clegra-app-accent-soft` and
  `--clegra-selection`; `--color-background-info` is the accent at 10%/20%). The light fills of `red` (`#D02424`),
  `green` (`#127535`), `teal` (`#0F716A`) and `gray` (`#636363`) are a shade deeper so their foreground is AA on the
  glass fill too (`accents.test.ts` checks it). Storybook: «Clegra/Selected states».

## 0.1.0-next.7 (2026-11-23)

- **The rail in blocks** (`ShellRail`, owner 2026-11-23): no longer one tall panel. Each group is its own glass pill
  (the panels' thick glass, `--rail-radius`, the rail's tint), stacked `--shell-inset` (8) apart with the ground
  between them; `brand` and `search` open the first block with the first group, and a group with the new
  `joinPrevious` goes on in the block before it (when that one is shown). The last of these blocks scrolls inside when
  the window is short. Detached at the bottom, aligned to the window's bottom edge, the **account block**: the new
  `controls` slot (an app's own tiles, such as notifications), the `footer` items and the face. The thin lines between
  groups are gone (the blocks part them). `AppShell`'s rail column (`data-sidebar-panel="rail"`) has no panel of its
  own any more; each block is `data-rail-block` (its first group's id), the account block `data-rail-account`. The phone's drawer is unchanged.

## 0.1.0-next.6 (2026-11-23)

- **`SiteShell`** (`@clegra/ui/shell`): the frame of an app's own website, shown in a card inside Clegra and on its
  own in a tab. The inner bar (`NavBar` + `NavSections`) as a left sidebar flush to the page's edges (240, no panel,
  no radius, no glass, a hairline on its right): the app's tile and name (`brand`: `{ name, href?, icon?, image? }`),
  its `sections`, the `footer` items and `footerExtra` pinned at the bottom; the page beside it, scrolling on its
  own. Under 768 a slim top bar whose ☰ opens the sidebar as a drawer (a sheet from the left: a pick, Esc or a click
  outside closes it). `accent` tints the whole site. Test hooks `data-site-shell`, `data-site-sidebar`,
  `data-site-bar`, `data-site-menu`, `data-site-drawer`, `data-site-main`. Needs only `styles.css`. Storybook:
  «Clegra/Shell/Site shell».

## 0.1.0-next.5 (2026-11-21)

- **Every app has its own accent**, like Apple's apps: a closed palette of ten names (`blue`, Clegra's and the default,
  `indigo`, `purple`, `pink`, `red`, `orange`, `yellow`, `green`, `teal`, `gray`), each hand-tuned for light and dark
  with a foreground, a text colour and a soft ground, every pair WCAG AA (a test computes them). `@clegra/ui/accents`
  (`APP_ACCENT_NAMES`, `appAccentColors`, `isAppAccent`, `appAccentOf`, `appAccentVariables`), the stylesheet's
  `data-app-accent` scopes (`--app-accent`, `--app-accent-foreground`, `--app-accent-text`, `--app-accent-soft`; Tailwind
  `bg-app-accent`…; `@clegra/ui/accents.css`, in `styles.css`) pointing `--primary`, `--link`, `--ring`,
  `--sidebar-active` and the new `--selection` at the accent, `<AppAccent>` / `useAppAccent()` /
  `appAccentProps()` (`@clegra/ui/clegra/app-accent`) and `<AppShell accent>` (the app's bar, list and content; never
  the rail or `aside`). Status colours never change. Storybook: «Brand/App accents».
- The open entry of an inner bar and a set header pill use `--selection` (Clegra's neutral fill outside an app, the
  accent's soft ground inside).
- **MCP Apps views**: `hostContextFor({ accent })` puts the accent in the standard info and ring variables and
  Clegra's roles; `styles.variables` now holds only the standard names and Clegra's `--clegra-*` roles travel in
  `_meta["clegra/ui"].variables` with `accent` (the official client refuses unknown names). `themeOfHostContext`
  reads them there; `applyClegraTheme` marks the document `data-app-accent`; `ClegraTheme.accent`.

## 0.1.0-next.4 (2026-11-20)

- **The lockup's Faccina is 20 % larger** beside the wordmark (`@clegra/ui/face`: `ClegraLockup`, `LOCKUP` in
  `/geometry`): the face is 1.92 of its 100-unit box (was 1.6), with the same gap to the word and the same vertical
  centre; `box` and `viewBox` grow to the left by 32 units. The wordmark's strokes are unchanged, so a lockup set by
  its height keeps the word's size and is 4.8 % wider.

## 0.1.0-next.3 (2026-11-20)

- **Fragments are artifacts** in `@clegra/ui/records/derive`, with no alias: `ArtifactType` and `ArtifactAction`
  (were `FragmentType`, `FragmentAction`); the comments and docs say artifact.

## 0.1.0-next.2 (2026-11-19)

- **Clegra's face** (`@clegra/ui/face`, web and React Native): `ClegraFace` with its states and expressions, the
  lockup with the wordmark, `@clegra/ui/react-native/face` (the native one by name), `@clegra/ui/face/shapes`, `/geometry` (`faceSvg`, the shapes as data) and `/motion`.
  The brand mark is public; its geometry ships as data (no JSON import).
- **Records** (`@clegra/ui/records/record`, `/kinds`, `/derive`): the record card, row, chip, detail, state and
  skeleton, the kind results and reference chips, and `derive` (a record's fields, state and words from a
  fragment). Every word is a prop or a `StateWords`/`Labels` value.
- **`palette`** in `@clegra/ui/tokens`: the brand tones the face falls back to without a stylesheet.

## 0.1.0-next.1 (2026-11-17)

The design the Clegra client uses today, public: an app on `@clegra/ui` looks like Clegra.

- **The app shell** (`@clegra/ui/shell`, web): `AppShell` (rail, docked inner bar and list, floating header, the
  page, bottom bar, aside), `ShellRail` with the signed-in person (`user`: a face that goes to a page or opens a menu
  of items, choices and separators) and its `brand`/`search` slots, `NavBar`, `NavSections`, `SectionsPill`,
  `ShellHeader`, `DrawerPill`, `ShellMain`, the page frame `ShellPage` / `PageHeading`, `AppIconImage`,
  `CountBadge`, `Keys`, `ShortcutsDialog`, `useShell()`, `isCurrentPath`. Presentational: the app's link component is
  `link`, every word is a prop.
- **Embedded**: `<AppShell embedded>` renders only the page, no chrome, when Clegra shows it (apps don't draw
  Clegra's chrome); `useShell().embedded` says so. The app decides it on the server (a layout of its embed route).
- **`@clegra/ui/shell/reorder`**: `railReorder`, dragging the rail's items into the person's order; the only entry
  that imports `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities` (new optional peers).
- **`@clegra/ui/clegra/*`**: `pill` (the header's glass pills), `surface` (`FloatingPanel`, `ScrollEdge`,
  `Segmented`), `rows` (`RowList`, `Row`, `RowIcon`, `FactList`, `Fact`), `confirm-switch` (`ConfirmSwitch`,
  `needsConfirmation`).
- **`@clegra/ui/glass.css`**: Clegra's frosted glass layer (the panels, the header's pills, menus and popovers on thick
  glass with capsule buttons, `.glass-table` with its phone rules, `.glass-card`, `.glass-tinted`, the scroll edge).
  `prebuilt.css` includes it.
- **Fonts bundled** (the owner's decision of 2026-11-17, replacing next.0's «the font is the app's»): Inter and Geist
  Mono, variable woff2, latin subset, with their OFL texts in `fonts/`; `styles.css` declares them
  (`font-display: swap`) and defaults `--font-sans` / `--font-mono` to them ahead of a system stack. An app's own
  next/font variable or `:root` rule still overrides them. The self-referencing `--font-sans` of next.0 is gone.
- Theme: `--control-edge` (a field's edge at 3:1 where the edge carries the control), light and dark.

## 0.1.0-next.0 (2026-11-17)

The first version published to npm (`npm i @clegra/ui@next`).

- **Its own package and repository** (npm refused the unscoped name). Every import is `@clegra/ui/<subpath>`, the
  subpaths unchanged (`@clegra/ui/components/button`, `@clegra/ui/frame`, `@clegra/ui/styles.css`, …).
  The source is `src/` at the repository's root; `@clegra/ui` does not depend on `@clegra/sdk`.
- **Everything is public.** The components that were reserved for Clegra's own shell and assistant (sidebar,
  navigation-menu, menubar, bubble, message, message-scroller, trace, questionnaire, marker, attachment, code-block,
  sonner, resizable, form) are exported and shipped, web and native. So are `@clegra/ui/drawn/*` and every
  `@clegra/ui/native/*` entry, `native/toast` included. Every app, Clegra's own too, uses the same package.
- The wire key Clegra's look rides in stays `hostContext._meta["clegra/ui"]`.
- No font file ships: the theme's `--font-sans` is the app's to define (README, «Fonts»).
- `publishConfig.access: public`; a prerelease is refused without a dist-tag (npm and `prepack`).
