"use client"

import { ArrowUpRightIcon, XIcon } from "lucide-react"
import { cn } from "cn"

import { HeaderPill, PillItem } from "../clegra/pill"
import { Button } from "../components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "../components/dropdown-menu"
import { Tooltip, TooltipContent, TooltipTrigger } from "../components/tooltip"
import { Keys } from "./keys"
import { useShellLink } from "./link"
import type { NavItem, NavSection } from "./types"

const ENTRY =
  "flex h-(--shell-sidebar-row) items-center gap-2.5 rounded-nav px-2.5 text-[0.84375rem] text-sidebar-foreground outline-none hover:bg-(--fill) focus-visible:ring-2 focus-visible:ring-sidebar-ring [&>svg:first-child]:text-muted-foreground"

/**
 * One entry of a nav: `--shell-sidebar-row` (34) high, radius 10, its icon and words; the open one a
 * selected row (the neutral strong fill, its usual words); a count after the label; an external one
 * opens a new tab with ↗. With keys (or a `tooltip`) it has a tooltip that
 * shows them. `onNavigate`: a pick puts a sheet away.
 */
export function NavLink({ item, onNavigate }: { item: NavItem; onNavigate?: () => void }) {
  const Link = useShellLink()
  const Icon = item.icon
  const marks = { "data-app-bar-entry": item.id, "data-testid": item.testId, "aria-description": item.description, ...item.data }
  const link = item.external ? (
    <a href={item.href} target="_blank" rel="noreferrer" {...marks} className={ENTRY}>
      <Icon className="size-4 shrink-0" />
      <span className="min-w-0 flex-1 truncate">{item.label}</span>
      <ArrowUpRightIcon className="size-4 shrink-0 text-sidebar-foreground/60" />
    </a>
  ) : (
    <Link
      href={item.href}
      onClick={() => onNavigate?.()}
      aria-current={item.active ? "page" : undefined}
      {...marks}
      className={cn(ENTRY, item.active && "selected-row font-semibold")}
    >
      <Icon className="size-4 shrink-0" />
      <span className="min-w-0 flex-1 truncate">{item.label}</span>
      {item.badge ? <span className="text-xs text-muted-foreground tabular-nums">{item.badge}</span> : null}
    </Link>
  )
  if (!item.shortcut && !item.tooltip) return link
  return (
    <Tooltip>
      <TooltipTrigger render={link} />
      <TooltipContent side="right">
        {item.tooltip ?? item.label}
        {item.shortcut && <Keys keys={item.shortcut} />}
      </TooltipContent>
    </Tooltip>
  )
}

/** A nav's sections: the first untitled, the others under their label (11 caps). `label`: the landmark's name. */
export function NavSections({ label, sections, onNavigate }: { label: string; sections: NavSection[]; onNavigate?: () => void }) {
  return (
    <nav aria-label={label} className="flex flex-col gap-1 px-(--shell-sidebar-pad) pb-2">
      {sections.map((section) => (
        <div key={section.id} role="group" aria-label={section.label} className="flex flex-col gap-0.5">
          {section.label && <p className="px-2.5 pt-3.5 pb-1.5 text-[0.6875rem] font-semibold tracking-[0.04em] text-(--faint) uppercase">{section.label}</p>}
          <ul className="flex flex-col gap-0.5">
            {section.items.map((item) => (
              <li key={item.id}>
                <NavLink item={item} onNavigate={onNavigate} />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  )
}

/**
 * THE INNER BAR (the app shell design §3): an app's (or an account's) own column,
 * `--shell-sidebar` (320) wide in its floating panel beside the rail (`AppShell` `nav`) or a site's sidebar, or in a
 * sheet when there is no room (the app decides, and gives `onClose` there).
 * A band of `--shell-sidebar-band` (56) with the name (or `band`), the content scrolling, `footer`
 * pinned at the bottom.
 */
export function NavBar({
  id,
  name,
  label,
  band,
  place = "docked",
  onClose,
  closeLabel,
  footer,
  children,
}: {
  /** `data-app-bar`: whose bar it is. */
  id: string
  name: string
  /** The landmark's name («Sezioni di Posta»). */
  label: string
  band?: React.ReactNode
  place?: "docked" | "sheet"
  /** In a sheet: the ✕ that puts it away. */
  onClose?: () => void
  closeLabel?: string
  footer?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <aside aria-label={label} data-app-bar={id} data-app-bar-place={place} className="flex min-h-0 flex-1 flex-col text-sidebar-foreground">
      <div className="flex h-(--shell-sidebar-band) shrink-0 items-center gap-2 px-4">
        <div className="flex min-w-0 flex-1 items-center gap-2 text-[0.9375rem] font-semibold">{band ?? <span className="truncate">{name}</span>}</div>
        {onClose && (
          <Button size="icon-sm" variant="ghost" aria-label={closeLabel} title={closeLabel} onClick={onClose}>
            <XIcon />
          </Button>
        )}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">{children}</div>
      {footer && <div className="flex shrink-0 flex-col gap-0.5 p-(--shell-sidebar-pad)">{footer}</div>}
    </aside>
  )
}

/**
 * The header's sections pill (the design system §3 «App pill»): the
 * place's icon and name with a ▾ that opens its sections as a menu (`onPick`
 * goes there), then `extra` rows. Without sections it is a button (`onOpen`:
 * the bar as a sheet). On when the bar is folded (a narrow window, a phone).
 */
export function SectionsPill({
  id,
  icon,
  label,
  menuLabel,
  name,
  sections,
  onPick,
  onOpen,
  extra,
}: {
  /** `data-app-pill`. */
  id: string
  icon: React.ReactNode
  label: React.ReactNode
  /** The trigger's accessible name («Sezioni di Posta»). */
  menuLabel: string
  /** The first section's heading when it has no label of its own. */
  name: string
  sections: NavSection[]
  onPick: (item: NavItem) => void
  onOpen?: () => void
  /** Rows after the sections (the client's «Fissa la barra dell'app», «Impostazioni dell'app»). */
  extra?: React.ReactNode
}) {
  if (!sections.length)
    return (
      <HeaderPill data-app-pill={id} className="min-w-0 shrink">
        <PillItem icon={icon} label={label} chevron className="min-w-0 shrink pl-1.5 font-semibold" onClick={onOpen} />
      </HeaderPill>
    )
  return (
    <HeaderPill data-app-pill={id} className="min-w-0 shrink">
      <DropdownMenu>
        <DropdownMenuTrigger render={<PillItem icon={icon} label={label} chevron className="min-w-0 shrink pl-1.5 font-semibold" aria-label={menuLabel} />} />
        <DropdownMenuContent align="start" className="w-64">
          {sections.map((section, i) => (
            <DropdownMenuGroup key={section.id}>
              {i > 0 && <DropdownMenuSeparator />}
              <DropdownMenuLabel>{section.label ?? name}</DropdownMenuLabel>
              {section.items.map((item) => (
                <DropdownMenuItem key={item.id} data-active={item.active ? "" : undefined} onClick={() => onPick(item)}>
                  <item.icon />
                  <span className="flex-1">{item.label}</span>
                  {item.badge ? <DropdownMenuShortcut>{item.badge}</DropdownMenuShortcut> : null}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          ))}
          {extra && (
            <>
              <DropdownMenuSeparator />
              {extra}
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </HeaderPill>
  )
}
