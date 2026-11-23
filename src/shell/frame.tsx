"use client"

import { MenuIcon } from "lucide-react"
import { createContext, useContext } from "react"
import { cn } from "cn"

import type { AppAccentName } from "../brand/accents"
import { AppAccentContext, appAccentProps } from "../clegra/app-accent"
import { HeaderPill, PillItem } from "../clegra/pill"
import { FloatingPanel, ScrollEdge } from "../clegra/surface"
import { SidebarProvider, useSidebar } from "../components/sidebar"
import { ShellLinkProvider, type ShellLinkComponent } from "./link"

/**
 * THE FRAME (the app shell design, the design system §5): content is the
 * ground and the chrome floats on it. Down the left, floating panels inset 8
 * from the window with a gap of 8: the `rail` (a column of pills, its
 * blocks, the account's detached at the bottom: `ShellRail`), then the docked `nav` (240, the app's inner bar) and a
 * sidebar page's docked `list`, each hidden when it is empty. Then the
 * content slot: the scroll edge, the floating `header`, the page
 * (`children`, a `ShellMain`), the phone's `bottomBar`; `aside` after it (the
 * Clegra panel, the FAB, a browser column). On a phone (under 768) the panels
 * go: the rail draws itself as a drawer (`ShellRail`, a sheet that portals out
 * of the hidden panel), the nav is a sheet the app opens.
 *
 * Above the rail, a strip for the Mac app's window buttons
 * (`[data-window-buttons]`, hidden unless the app's stylesheet shows it).
 *
 * EMBEDDED (`embedded`): the page is shown inside Clegra (an embed page in the
 * host's frame), where Clegra draws the chrome: no rail, nav, list, header,
 * bottom bar, aside or `chrome`, only the page (`children`) on the ground,
 * with the header's and the FAB's room given back (`--shell-header` and
 * `--shell-bottom` are the gutter). Decide it on the server, as the page is
 * rendered (the page's path is under the app's embed route, `/embed/…`: a
 * layout of its own passes `embedded`), so the chrome never flashes.
 * `useShell()` keeps working (`embedded: true`).
 */
export function AppShell({
  link,
  embedded = false,
  rail,
  nav,
  list,
  chrome,
  header,
  bottomBar,
  aside,
  accent,
  className,
  children,
}: {
  /** The app's link component (`next/link`, the client's `Link`): every internal link of the shell. */
  link?: ShellLinkComponent
  /** Shown inside Clegra (an embed page): only the page, no chrome of its own (apps don't draw Clegra's chrome). */
  embedded?: boolean
  /** The rail (`ShellRail`). */
  rail: React.ReactNode
  /** The docked inner bar: a `NavBar`, or the app's slot it fills from the page (hidden while empty). */
  nav?: React.ReactNode
  /** A sidebar page's docked list (hidden while empty). */
  list?: React.ReactNode
  /** Parts without a place of their own (key listeners, the app's frame logic): rendered between the panels and the content. */
  chrome?: React.ReactNode
  /** The floating header (`ShellHeader` and its pills). */
  header?: React.ReactNode
  /** The phone's bottom bar (search, the primary action). */
  bottomBar?: React.ReactNode
  /** After the content slot: the Clegra panel and its button, a browser column. */
  aside?: React.ReactNode
  /**
   * The open app's tint (src/brand/accents.ts): its bar, its list and the content slot (with the header) take it;
   * the rail and `aside` (Clegra's chrome: the Faccina, the assistant) stay Clegra's blue. None: Clegra's own page.
   */
  accent?: AppAccentName
  className?: string
  /** The page, in a `ShellMain`. */
  children: React.ReactNode
}) {
  const tint = accent ? appAccentProps(accent) : {}
  const inApp = (node: React.ReactNode) => (accent ? <AppAccentContext accent={accent}>{node}</AppAccentContext> : node)
  if (embedded)
    return (
      <ShellLinkProvider link={link}>
        <EmbeddedContext value>
          <SidebarProvider open className={className} data-shell-embedded="" style={{ "--shell-header": "var(--shell-gutter)", "--shell-bottom": "var(--shell-gutter)" } as React.CSSProperties}>
            <div data-page-area="" {...tint} className="relative flex h-svh min-w-0 flex-1 flex-col bg-background">
              <div className="relative flex min-h-0 min-w-0 flex-1 flex-col">{inApp(children)}</div>
            </div>
          </SidebarProvider>
        </EmbeddedContext>
      </ShellLinkProvider>
    )
  return (
    <ShellLinkProvider link={link}>
      {/* Open on wide screens; on a phone the rail is the drawer (shadcn's Sidebar). */}
      <SidebarProvider open className={className} style={{ "--sidebar-width": "20rem" } as React.CSSProperties}>
        {/* The rail's blocks, the app's bar and the list's panel (the design system §5; owner, 2026-11-12 and 2026-11-23): inset 8 from the window, a gap of 8, the panels' one surface (--panel). The content starts right after them and never runs under them. */}
        <div data-sidebar-panels="" className="m-2 mr-0 hidden h-[calc(100svh-1rem)] shrink-0 gap-2 md:flex">
          <div className="flex h-full shrink-0 flex-col gap-2">
            {/* The Mac app's window buttons: a free strip above the rail, shown by the app's stylesheet (html.desktop-mac). */}
            <div data-window-buttons="" aria-hidden className="hidden h-(--window-buttons-strip) w-(--shell-rail) shrink-0" />
            {/* The rail's column: no panel of its own, the ground shows through; `ShellRail` draws its blocks, each a pill on the panels' surface (data-rail-block). */}
            <div data-sidebar-panel="rail" className="flex min-h-0 w-(--shell-rail) flex-1">
              {rail}
            </div>
          </div>
          {nav && (
            <FloatingPanel data-sidebar-panel="nav" {...tint} className="h-full shrink-0 has-[>:only-child:empty]:hidden">
              {inApp(nav)}
            </FloatingPanel>
          )}
          {list && (
            <FloatingPanel data-sidebar-panel="list" {...tint} className="h-full shrink-0 has-[>:only-child:empty]:hidden">
              {inApp(list)}
            </FloatingPanel>
          )}
        </div>
        {chrome}
        {/* The content slot: the ground. The page scrolls under the floating header and its scroll edge. */}
        <div data-page-area="" {...tint} className="relative flex h-svh min-w-0 flex-1 flex-col bg-background">
          <div className="relative flex min-h-0 min-w-0 flex-1 flex-col">
            <ScrollEdge />
            {inApp(
              <>
                {header}
                {children}
              </>,
            )}
          </div>
          {inApp(bottomBar)}
        </div>
        {aside}
      </SidebarProvider>
    </ShellLinkProvider>
  )
}

/**
 * The page's landmark, named after the page (there is no title band): one
 * isolated layer under the floating header and its scroll edge, whatever
 * z-index its own parts use. It scrolls; the page pads itself (64 under the
 * header, the FAB's room at the bottom).
 */
export function ShellMain({ label, className, ...props }: React.ComponentProps<"main"> & { label?: string }) {
  return <main aria-label={label} data-shell-main="" className={cn("isolate flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto overscroll-contain", className)} {...props} />
}

/**
 * The floating header's row (the design system §3): over the content slot,
 * 12 from its top (4 on a phone, with the phone's taller pills) and the
 * content's gutter (--shell-gutter) from its sides; only its pills take
 * pointer events. Put `HeaderGroup`s in it (`HeaderGroup`, `HeaderPill`, `PillItem` below in this entry).
 */
export function ShellHeader({ phone, className, ...props }: React.ComponentProps<"div"> & { phone: boolean }) {
  return (
    <div
      data-header-bar=""
      className={cn(
        "pointer-events-none absolute inset-x-0 z-20 flex items-center gap-2 px-(--shell-gutter) *:pointer-events-auto",
        phone ? "top-1 [--shell-pill:2.75rem] [--shell-pill-item:2.25rem]" : "top-3",
        className
      )}
      {...props}
    />
  )
}

/** On a phone, the first pill of the header: ☰ opens the rail's drawer. */
export function DrawerPill({ label }: { label: string }) {
  const { setOpenMobile } = useSidebar()
  return (
    <HeaderPill round>
      <PillItem icon={<MenuIcon />} aria-label={label} data-testid="header-apps" onClick={() => setOpenMobile(true)} />
    </HeaderPill>
  )
}

const EmbeddedContext = createContext(false)

/** Whether the shell is on a phone's width (under 768), and its drawer; `embedded`: shown inside Clegra, no chrome (and no drawer). */
export function useShell() {
  const { isMobile, setOpenMobile } = useSidebar()
  const embedded = useContext(EmbeddedContext)
  return { phone: isMobile, embedded, openDrawer: () => setOpenMobile(true), closeDrawer: () => setOpenMobile(false) }
}
