"use client"

import { ArrowUpRightIcon } from "lucide-react"
import { cn } from "cn"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from "../components/sidebar"
import { Tooltip, TooltipContent, TooltipTrigger } from "../components/tooltip"
import { CountBadge } from "./badge"
import { Keys } from "./keys"
import { useShellLink } from "./link"
import { railGroupsShown } from "./model"
import type { RailGroup, RailItem, RailReorder, RailSlot, ShellIcon, ShellUser } from "./types"
import { UserButton } from "./user"

/**
 * A rail item's link (the apps, a surface, the account): a 48 place
 * (`--rail-target`), 2 around the 44 tile, its focus ring concentric with the
 * tile. `group/app`: the tile inside takes its hover from it.
 */
export const RAIL_LINK =
  "group/app relative flex size-(--rail-target) items-center justify-center rounded-[calc(var(--rail-tile-radius)+2px)] outline-none focus-visible:ring-2 focus-visible:ring-ring"

/** The open rail item: a bar at the rail panel's left edge, as Slack's and Discord's (the link sits --rail-inset − 2 in). The same for an app and the account. */
export function RailActiveBar({ active }: { active: boolean }) {
  return <span aria-hidden className={cn("absolute top-1/2 left-[calc(2px-var(--rail-inset))] w-[3px] -translate-y-1/2 rounded-full bg-sidebar-active transition-all", active ? "h-4.5" : "h-0")} />
}

/**
 * A quiet tile for an item without an icon of its own (Panoramica,
 * Amministrazione, an account's areas): a rounded square on `--fill`, the
 * glyph in it; open, the strong fill and the link colour, while the bar at the
 * rail's edge marks it as it marks every app. `size`: «rail» (44) or «row» (24,
 * the drawer).
 */
export function RailTile({
  icon: Icon,
  active = false,
  size = "rail",
  className,
  ...props
}: { icon: ShellIcon; active?: boolean; size?: "rail" | "row"; className?: string } & { [key: `data-${string}`]: string | undefined }) {
  return (
    <span
      aria-hidden
      {...props}
      className={cn(
        "inline-flex shrink-0 items-center justify-center transition-colors",
        size === "rail" ? "size-(--rail-tile) rounded-(--rail-tile-radius) [&_svg]:size-6" : "size-6 rounded-[6px] [&_svg]:size-3.5",
        active ? "bg-(--fill-strong) text-link" : "bg-(--fill) text-sidebar-foreground group-hover/app:bg-(--fill-strong)",
        className
      )}
    >
      <Icon />
    </span>
  )
}

const slot = (value: RailSlot | undefined, rail: boolean) => (typeof value === "function" ? value({ rail }) : value)

/** The marks every rail item carries: what it is, whether it is open, what is new. */
function marks(item: RailItem) {
  return {
    "aria-current": item.active ? ("page" as const) : undefined,
    "aria-description": item.description,
    "data-app": item.id,
    "data-app-kind": item.kind,
    "data-app-state": item.state,
    "data-testid": item.testId,
    ...item.data,
  }
}

/**
 * One item of the rail. The rail (from tablet width): its tile only, the name
 * in a tooltip (with its keys) and as the link's name, the counter a badge on
 * the tile, the open one marked by its tile and a bar at the rail's edge. The
 * phone's drawer: the small tile beside the name.
 */
function RailEntry({ item, onNavigate, reorder, rail }: { item: RailItem; onNavigate?: () => void; reorder?: RailReorder; rail: boolean }) {
  const Link = useShellLink()
  // An item of a sortable group is dragged up and down (`reorder`'s item: the pointer must move first, so a click still opens it).
  const Wrap = reorder ? reorder.Item : StillItem
  const active = Boolean(item.active)
  const tile = (size: "rail" | "row") => (item.tile ? item.tile({ active, size }) : <RailTile icon={item.icon} active={active} size={size} />)
  const target = item.external ? { target: "_blank", rel: "noreferrer" } : {}
  const anchor = (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) =>
    item.external ? <a href={item.href} {...target} {...props} /> : <Link href={item.href} {...props} />
  return (
    <Wrap id={item.id} className={cn(rail && "flex justify-center")}>
      {rail ? (
        <Tooltip>
          <TooltipTrigger render={anchor({ draggable: false, "aria-label": item.label, ...marks(item), className: RAIL_LINK })}>
            <RailActiveBar active={active} />
            {tile("rail")}
            <span className="sr-only">{item.label}</span>
            {item.badge ? <CountBadge count={item.badge} tone="accent" className="absolute -top-0.5 -right-0.5 ring-2 ring-sidebar" /> : null}
          </TooltipTrigger>
          <TooltipContent side="right">
            {item.label}
            {item.shortcut && <Keys keys={item.shortcut} />}
          </TooltipContent>
        </Tooltip>
      ) : (
        <SidebarMenuButton render={anchor({ onClick: onNavigate, draggable: false })} isActive={active} {...marks(item)}>
          <span className="relative inline-flex">
            {tile("row")}
            {item.badge ? <CountBadge count={item.badge} tone="accent" className="absolute -top-1 -right-1.5" /> : null}
          </span>
          <span>{item.label}</span>
          {item.external && <ArrowUpRightIcon aria-hidden className="ml-auto size-4 text-sidebar-foreground/60" />}
        </SidebarMenuButton>
      )}
    </Wrap>
  )
}

/** An item that is not dragged. */
function StillItem({ className, children }: { id: string; className?: string; children: React.ReactNode }) {
  return <SidebarMenuItem className={className}>{children}</SidebarMenuItem>
}

/** A group of the rail; its label is said, and shown in the phone's drawer only; `onOrder` set: its items can be dragged into the person's order. */
function RailGroupView({ group, onNavigate, rail, reorder }: { group: RailGroup; onNavigate?: () => void; rail: boolean; reorder?: RailReorder }) {
  // On a phone's drawer the order is read, not changed: a drag there scrolls.
  const onOrder = rail ? group.onOrder : undefined
  if (onOrder && !reorder) throw new Error(`ShellRail: the group "${group.id}" has onOrder: pass reorder={railReorder} from @clegra/ui/shell/reorder (it needs @dnd-kit/core, @dnd-kit/sortable and @dnd-kit/utilities)`)
  const sorter = onOrder ? reorder : undefined
  const ids = group.items.map((item) => item.id)
  const items = group.items.map((item) => <RailEntry key={item.id} item={item} onNavigate={onNavigate} reorder={sorter} rail={rail} />)
  return (
    <SidebarGroup data-rail-group={group.id} {...group.data} className={cn(rail && "p-0")}>
      {group.label && <SidebarGroupLabel className={cn(rail && "sr-only")}>{group.label}</SidebarGroupLabel>}
      <SidebarGroupContent>
        <SidebarMenu className={cn(rail && "items-center gap-[calc(var(--rail-gap)-4px)]")}>
          {sorter && onOrder ? (
            <sorter.Group ids={ids} onOrder={onOrder} hint={group.reorderHint}>
              {items}
            </sorter.Group>
          ) : (
            items
          )}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

/**
 * THE RAIL (the app shell design §1, the design system §5): a narrow column of
 * tiles inside the floating panel, as Slack's, Teams' or Discord's. From the
 * top: whose it is (`brand`), `search`, the `groups` with a thin line between
 * them (the last group is the one pinned last, as the client's store), then at
 * the bottom, fixed, the `footer` items (Amministrazione) and the person's
 * face (`user`). On a phone (under 768) the same things are the drawer
 * (shadcn's Sidebar as a sheet): each small tile beside its name, the groups'
 * labels shown, the face with name and email; picking one closes it.
 * A group with `onOrder` is dragged into the person's order with `reorder`
 * (`railReorder` from `@clegra/ui/shell/reorder`, on @dnd-kit: an app that
 * never reorders imports none of it).
 */
export function ShellRail({
  brand,
  search,
  groups,
  footer = [],
  user,
  reorder,
}: {
  brand?: RailSlot
  search?: RailSlot
  groups: RailGroup[]
  /** Fixed at the bottom, above the face (never dragged). */
  footer?: RailItem[]
  user?: ShellUser
  /** How a group with `onOrder` is dragged: `railReorder` from `@clegra/ui/shell/reorder`. */
  reorder?: RailReorder
}) {
  const { isMobile, setOpenMobile } = useSidebar()
  const rail = !isMobile
  const close = isMobile ? () => setOpenMobile(false) : undefined
  // In the rail a thin line between the groups stands for their labels.
  const shown = railGroupsShown(groups)
  const content = shown.map(({ group, line }) => (
    <RailGroupLine key={group.id} line={line && rail}>
      <RailGroupView group={group} onNavigate={close} rail={rail} reorder={reorder} />
    </RailGroupLine>
  ))
  const bottom = (
    <>
      {footer.length > 0 && (
        <SidebarMenu className={cn(rail && "items-center")}>
          {footer.map((item) => (
            <RailEntry key={item.id} item={item} onNavigate={close} rail={rail} />
          ))}
        </SidebarMenu>
      )}
      {user && <UserButton user={user} rail={rail} onNavigate={close} />}
    </>
  )

  if (isMobile)
    return (
      <Sidebar>
        <div className="flex h-full w-full flex-col">
          <SidebarHeader className="gap-3">
            {slot(brand, false)}
            {slot(search, false)}
          </SidebarHeader>
          <SidebarContent className="gap-0">{content}</SidebarContent>
          <SidebarFooter>{bottom}</SidebarFooter>
        </div>
      </Sidebar>
    )

  return (
    <Sidebar collapsible="none" className="h-full w-(--shell-rail)! shrink-0 bg-(--rail-tint)">
      {/* The rail's grid (theme.css --rail-*): every tile at the inset from the panel's edges, --rail-gap apart. */}
      <SidebarHeader className="items-center gap-(--rail-gap) px-0 pt-(--rail-inset) pb-[calc(var(--rail-gap)-2px)]">
        {slot(brand, true)}
        {slot(search, true)}
      </SidebarHeader>
      <SidebarContent className="gap-[calc(var(--rail-gap)-2px)] overflow-x-hidden">{content}</SidebarContent>
      <SidebarFooter className="items-center gap-[calc(var(--rail-gap)-4px)] px-0 pt-[calc(var(--rail-gap)-2px)] pb-[calc(var(--rail-inset)-2px)]">{bottom}</SidebarFooter>
    </Sidebar>
  )
}

/** A group, with the rail's thin line before it when it is not the first. */
function RailGroupLine({ line, children }: { line: boolean; children: React.ReactNode }) {
  return (
    <>
      {line && <SidebarSeparator className="mx-auto my-0 w-10!" />}
      {children}
    </>
  )
}
