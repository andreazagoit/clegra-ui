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
  useSidebar,
} from "../components/sidebar"
import { FloatingPanel } from "../clegra/surface"
import { Tooltip, TooltipContent, TooltipTrigger } from "../components/tooltip"
import { CountBadge } from "./badge"
import { Keys } from "./keys"
import { useShellLink } from "./link"
import { railBlocks } from "./model"
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
 * glyph in it; open, the selected state (the glass fill in Clegra's blue), while the bar at the
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
        active ? "selected" : "bg-(--fill) text-sidebar-foreground group-hover/app:bg-(--fill-strong)",
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

/** A group of the rail (in its block, no line: the blocks part the groups); its label is said, and shown in the phone's drawer only; `onOrder` set: its items can be dragged into the person's order. */
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
 * One block of the rail: its own glass pill (the frame's floating panels'
 * glass, its radius concentric with its tiles, --rail-radius), the rail's
 * tint over it, its tiles in a column at the rail's grid (--rail-*: every
 * tile at the inset from the pill's edges, --rail-gap apart). It scrolls
 * inside when the window is too short for it, never below one tile
 * (`grow`: the block that gives up its height first; then the others).
 */
function RailBlock({ id, grow = false, children }: { id: string | null; grow?: boolean; children: React.ReactNode }) {
  // The account block (id null) keeps its height: the blocks above give theirs up.
  // A block of groups is marked by its first group's id; the account block by `data-rail-account` (a group may be called «account»).
  const mark = id === null ? { "data-rail-account": "" } : { "data-rail-block": id }
  return (
    <FloatingPanel {...mark} className={cn("min-h-(--shell-rail) w-full flex-col rounded-(--rail-radius)!", id === null ? "shrink-0" : grow ? "shrink-[1000]" : "shrink")}>
      <div className="flex min-h-0 flex-1 flex-col items-center gap-[calc(var(--rail-gap)-4px)] overflow-x-hidden overflow-y-auto overscroll-contain bg-(--rail-tint) py-[calc(var(--rail-inset)-2px)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {children}
      </div>
    </FloatingPanel>
  )
}

/**
 * THE RAIL (the app shell design §1, the design system §5): a narrow column
 * of tiles, as Slack's, Teams' or Discord's, in BLOCKS (owner, 2026-11-23):
 * each its own glass pill, stacked --shell-inset apart, the window's ground
 * between them. From the top: whose it is (`brand`) and `search` in the
 * first block with the first group, then a block for each further group (a
 * group with `joinPrevious` goes on in the block before it: the client's
 * store after the installed apps); the last of these gives up its height
 * first and scrolls inside. Detached at the bottom, aligned to the window's
 * bottom edge, the ACCOUNT block (`data-rail-account`): the app's
 * own controls (`controls`: the client's approvals and notifications), the
 * `footer` items (the account's or the system's places: Amministrazione,
 * «Chiavi», «Impostazioni») and the person's face (`user`). On a phone
 * (under 768) the same things are the drawer (shadcn's Sidebar as a sheet):
 * each small tile beside its name, the groups' labels shown, the face with
 * name and email; picking one closes it. A group with `onOrder` is dragged
 * into the person's order with `reorder` (`railReorder` from
 * `@clegra/ui/shell/reorder`, on @dnd-kit: an app that never reorders
 * imports none of it).
 */
export function ShellRail({
  brand,
  search,
  groups,
  controls,
  footer = [],
  user,
  reorder,
}: {
  brand?: RailSlot
  search?: RailSlot
  groups: RailGroup[]
  /** The app's own controls at the top of the account block (the client's approvals and notifications), as rail tiles (`RAIL_LINK`, `RailTile`). */
  controls?: RailSlot
  /** In the account block, under `controls` and above the face (never dragged): the account's or the system's places. */
  footer?: RailItem[]
  user?: ShellUser
  /** How a group with `onOrder` is dragged: `railReorder` from `@clegra/ui/shell/reorder`. */
  reorder?: RailReorder
}) {
  const { isMobile, setOpenMobile } = useSidebar()
  const rail = !isMobile
  const close = isMobile ? () => setOpenMobile(false) : undefined
  const blocks = railBlocks(groups)
  const view = (group: RailGroup) => <RailGroupView key={group.id} group={group} onNavigate={close} rail={rail} reorder={reorder} />
  const items = (
    <>
      {footer.length > 0 && (
        <SidebarMenu className={cn(rail && "items-center gap-[calc(var(--rail-gap)-4px)]")}>
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
          <SidebarContent className="gap-0">{blocks.flat().map(view)}</SidebarContent>
          <SidebarFooter>
            {slot(controls, false)}
            {items}
          </SidebarFooter>
        </div>
      </Sidebar>
    )

  const head = brand || search ? (
    // The brand and the search are 44 tiles, not 48 links: 2 more on each side keeps them on the grid.
    <div className="flex shrink-0 flex-col items-center gap-(--rail-gap) py-0.5">
      {slot(brand, true)}
      {slot(search, true)}
    </div>
  ) : null
  const tops = blocks.length > 0 ? blocks : head ? [[]] : []
  const control = slot(controls, true)
  const account = Boolean(control) || footer.length > 0 || Boolean(user)
  return (
    <Sidebar collapsible="none" className="h-full w-(--shell-rail)! shrink-0 justify-between gap-(--shell-inset) bg-transparent">
      {/* No scroller and no background here: the ground shows between the blocks, and nothing clips their shadows. Each block scrolls inside itself. */}
      <div data-rail-blocks="" className="flex min-h-0 flex-col gap-(--shell-inset)">
        {tops.map((block, i) => (
          <RailBlock key={block[0]?.id ?? "brand"} id={block[0]?.id ?? "brand"} grow={i === tops.length - 1}>
            {i === 0 && head}
            {block.map(view)}
          </RailBlock>
        ))}
      </div>
      {account && (
        <RailBlock id={null}>
          {control}
          {items}
        </RailBlock>
      )}
    </Sidebar>
  )
}
