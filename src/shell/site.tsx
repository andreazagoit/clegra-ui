"use client"

import { MenuIcon } from "lucide-react"
import { useEffect, useId, useState } from "react"
import { cn } from "cn"

import type { AppAccentName } from "../brand/accents"
import { AppAccentContext, appAccentProps } from "../clegra/app-accent"
import { Button } from "../components/button"
import { Sheet, SheetContent, SheetTrigger } from "../components/sheet"
import { useIsMobile } from "../hooks/use-mobile"
import { AppIconImage, type AppIconImageSource } from "./app-icon"
import { ShellLinkProvider, useShellLink, type ShellLinkComponent } from "./link"
import { NavBar, NavLink, NavSections } from "./nav"
import type { NavItem, NavSection, ShellIcon } from "./types"

/** Whose site it is, at the top of the sidebar (and in the phone's top bar): the app's tile and name. */
export type SiteBrand = {
  name: string
  /** Where the name goes (the site's home). None: the name is not a link. */
  href?: string
  /** Drawn in a 28 tile on the app's accent. */
  icon?: ShellIcon
  /** The app's own icon image (Apple's format, masked by `AppIconImage`), in place of `icon`. */
  image?: AppIconImageSource
}

/** The brand's tile and name; a link to `href` when there is one. */
function SiteBrandMark({ brand, onNavigate }: { brand: SiteBrand; onNavigate?: () => void }) {
  const Link = useShellLink()
  const Icon = brand.icon
  const content = (
    <>
      {brand.image ? (
        <AppIconImage image={brand.image} className="size-7" />
      ) : Icon ? (
        <span aria-hidden className="inline-flex size-7 shrink-0 items-center justify-center rounded-[8px] bg-app-accent text-app-accent-foreground [&_svg]:size-4">
          <Icon />
        </span>
      ) : null}
      <span className="min-w-0 truncate">{brand.name}</span>
    </>
  )
  const look = "flex min-w-0 items-center gap-2.5 rounded-nav text-[0.9375rem] font-semibold text-sidebar-foreground outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
  if (!brand.href) return <span data-site-brand="" className={look}>{content}</span>
  return (
    <Link href={brand.href} data-site-brand="" onClick={() => onNavigate?.()} className={look}>
      {content}
    </Link>
  )
}

/**
 * AN APP'S OWN WEBSITE'S FRAME (owner, 2026-11-22): the inner bar of Clegra's
 * apps (`NavBar` + `NavSections`) as the site's left sidebar, flush to the
 * page's top, bottom and left (no panel, no radius, no glass; a hairline on its
 * right), 240 wide on `bg-sidebar`; the band of 56 with the app's tile and
 * name, the `sections` (the open one marked by its `active`), the `footer`
 * items (the app's settings) and `footerExtra` (the signed-in person, sign
 * out) pinned at the bottom. Then the page (`children`), on `bg-background`,
 * scrolling on its own at the window's full height.
 *
 * Under 768 (the shell's phone width) the sidebar folds into a slim flush top
 * bar (☰ and the app's name) and opens as a drawer from the left (a sheet:
 * a pick, Esc or a click outside closes it, focus is kept inside while open).
 * The layout is CSS only (`md:`), so the first HTML has no flash.
 *
 * The same frame inside Clegra (its client shows the site in a card and draws
 * nothing around it) and on its own in a browser tab. Presentational: the
 * app's link component is `link`, every word is a prop. Needs only
 * `@clegra/ui/styles.css` (no glass).
 */
export function SiteShell({
  link,
  accent,
  brand,
  label,
  sections,
  footer = [],
  footerExtra,
  menuLabel,
  closeLabel,
  id = "site",
  className,
  children,
}: {
  /** The app's link component (`next/link`): every internal link of the frame. */
  link?: ShellLinkComponent
  /** The app's accent (src/brand/accents.ts): the whole site takes it (`data-app-accent`). None: Clegra's blue. */
  accent?: AppAccentName
  brand: SiteBrand
  /** The sidebar's landmark name («Invoices sections»), for the `aside` and its `nav`. */
  label: string
  sections: NavSection[]
  /** Pinned at the bottom: the app's settings. */
  footer?: NavItem[]
  /** Under the footer's items: the signed-in person and sign out (outside Clegra), a version line. */
  footerExtra?: React.ReactNode
  /** The phone's ☰ («Open menu»). */
  menuLabel: string
  /** The drawer's ✕ («Close»). */
  closeLabel: string
  /** `data-app-bar` on the sidebar (default «site»). */
  id?: string
  className?: string
  /** The page. */
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const phone = useIsMobile()
  const drawerId = useId()
  // Widened past the phone's width with the drawer open: the docked sidebar is back, the drawer goes.
  useEffect(() => {
    if (!phone) setOpen(false)
  }, [phone])
  const tint = accent ? appAccentProps(accent) : {}
  const close = () => setOpen(false)

  const bar = (place: "docked" | "sheet") => {
    const onNavigate = place === "sheet" ? close : undefined
    return (
      <NavBar
        id={id}
        name={brand.name}
        label={label}
        place={place}
        band={<SiteBrandMark brand={brand} onNavigate={onNavigate} />}
        onClose={place === "sheet" ? close : undefined}
        closeLabel={closeLabel}
        footer={
          footer.length > 0 || footerExtra ? (
            <>
              {footer.length > 0 && (
                <ul className="flex flex-col gap-0.5">
                  {footer.map((item) => (
                    <li key={item.id}>
                      <NavLink item={item} onNavigate={onNavigate} />
                    </li>
                  ))}
                </ul>
              )}
              {footerExtra}
            </>
          ) : undefined
        }
      >
        <NavSections label={label} sections={sections} onNavigate={onNavigate} />
      </NavBar>
    )
  }

  const frame = (
    <Sheet open={open} onOpenChange={setOpen}>
      <div data-site-shell="" {...tint} className={cn("flex h-svh w-full flex-col overflow-hidden bg-background text-foreground md:flex-row", className)}>
        {/* The phone's top bar: flush, a hairline under it. */}
        <div data-site-bar="" className="flex h-12 shrink-0 items-center gap-1.5 border-b border-sidebar-border bg-sidebar px-2 text-sidebar-foreground md:hidden">
          <SheetTrigger
            render={<Button size="icon-sm" variant="ghost" aria-label={menuLabel} title={menuLabel} aria-controls={drawerId} aria-expanded={open} data-site-menu="" />}
          >
            <MenuIcon />
          </SheetTrigger>
          <SiteBrandMark brand={brand} />
        </div>
        {/* The docked sidebar: flush to the top, bottom and left, a hairline on its right. */}
        <div data-site-sidebar="" className="hidden w-(--shell-nav) shrink-0 flex-col border-r border-sidebar-border bg-sidebar md:flex">
          {bar("docked")}
        </div>
        <div data-site-main="" className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto overscroll-contain">
          {children}
        </div>
      </div>
      <SheetContent
        side="left"
        showCloseButton={false}
        id={drawerId}
        aria-label={label}
        data-site-drawer=""
        {...tint}
        className="flex flex-col gap-0 border-sidebar-border bg-sidebar p-0 text-sidebar-foreground data-[side=left]:w-(--shell-nav) data-[side=left]:max-w-[85vw]"
      >
        {bar("sheet")}
      </SheetContent>
    </Sheet>
  )

  return <ShellLinkProvider link={link}>{accent ? <AppAccentContext accent={accent}>{frame}</AppAccentContext> : frame}</ShellLinkProvider>
}
