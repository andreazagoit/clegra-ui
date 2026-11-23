"use client"

import { cloneElement } from "react"
import { cn } from "cn"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/dropdown-menu"
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "../components/sidebar"
import { Tooltip, TooltipContent, TooltipTrigger } from "../components/tooltip"
import { Face } from "./face"
import { useShellLink } from "./link"
import { RAIL_LINK, RailActiveBar } from "./rail"
import type { ShellUser, UserMenuEntry } from "./types"

/** The menu the face opens when the app gives one: who is signed in, then the app's rows. */
function UserMenuContent({ user, rail }: { user: ShellUser; rail: boolean }) {
  const Link = useShellLink()
  const row = (entry: UserMenuEntry) => {
    if (entry.kind === "separator") return <DropdownMenuSeparator key={entry.id} />
    if (entry.kind === "choice")
      return (
        <DropdownMenuGroup key={entry.id}>
          <DropdownMenuLabel>{entry.label}</DropdownMenuLabel>
          <DropdownMenuRadioGroup value={entry.value} onValueChange={(value) => value !== entry.value && entry.onChange(String(value))}>
            {entry.options.map((option) => (
              <DropdownMenuRadioItem key={option.value} value={option.value} disabled={entry.disabled} lang={option.lang}>
                {option.label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
      )
    const Icon = entry.icon
    const body = (
      <>
        {Icon && <Icon aria-hidden />}
        {entry.label}
      </>
    )
    const common = { "data-testid": entry.testId, variant: entry.destructive ? ("destructive" as const) : ("default" as const), onClick: entry.onSelect }
    if (entry.href)
      return (
        <DropdownMenuItem key={entry.id} {...common} render={entry.external ? <a href={entry.href} target="_blank" rel="noreferrer" /> : <Link href={entry.href} />}>
          {body}
        </DropdownMenuItem>
      )
    return (
      <DropdownMenuItem key={entry.id} {...common}>
        {body}
      </DropdownMenuItem>
    )
  }
  return (
    <DropdownMenuContent side={rail ? "right" : "top"} align="end" sideOffset={8} className="w-72" data-testid="account-menu-content">
      <div className="flex min-w-0 items-center gap-3 px-3 py-2.5">
        <Face name={user.name} email={user.email} src={user.image} className="size-10" />
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold">{user.name || user.email}</div>
          {user.name && <div className="truncate text-xs text-muted-foreground">{user.email}</div>}
        </div>
      </div>
      <DropdownMenuSeparator />
      {(user.menu ?? []).map(row)}
    </DropdownMenuContent>
  )
}

/**
 * THE ACCOUNT at the foot of the rail (owner, 2026-11-12/13): the person's
 * face, a tile like the apps' (44, their radius, the photo or the initials
 * filling it; open, the same bar at the rail's edge); in the phone's drawer
 * the face with name and email. One click goes to `href` (or `onSelect`); with
 * a `menu` the same face opens it, in the same place and look.
 */
export function UserButton({ user, rail, onNavigate }: { user: ShellUser; rail: boolean; onNavigate?: () => void }) {
  const Link = useShellLink()
  const active = Boolean(user.active)
  const label = user.label ?? (user.name ? `${user.name}, ${user.email}` : user.email)
  const menu = Boolean(user.menu?.length)
  const testId = user.testId ?? "account-button"
  const go = () => {
    user.onSelect?.()
    onNavigate?.()
  }
  // The rail: the face as a tile like the apps'; the initials' ground takes the quiet tiles' hover and open fill.
  const face = rail ? (
    <>
      <RailActiveBar active={active} />
      <Face
        name={user.name}
        email={user.email}
        src={user.image}
        tile
        className="size-(--rail-tile)"
        fallbackClassName={cn(
          "text-base font-medium transition-colors",
          active ? "selected" : "bg-(--fill) text-sidebar-foreground group-hover/app:bg-(--fill-strong)"
        )}
      />
    </>
  ) : (
    <>
      <Face name={user.name} email={user.email} src={user.image} />
      <span className="grid min-w-0 flex-1 text-left text-sm leading-tight">
        {user.name && <span className="truncate font-medium">{user.name}</span>}
        <span className="truncate text-xs text-muted-foreground">{user.email}</span>
      </span>
    </>
  )
  const props = { "aria-current": active ? ("page" as const) : undefined, "aria-label": label, "data-testid": testId }
  // What the face is: a menu's trigger, a link to the person's page, or a button.
  const className = rail ? RAIL_LINK : undefined
  const element = menu ? (
    <button type="button" {...props} className={className} />
  ) : user.href ? (
    <Link href={user.href} onClick={go} {...props} className={className} />
  ) : (
    <button type="button" onClick={go} {...props} className={className} />
  )
  const trigger = menu ? <DropdownMenuTrigger render={element} /> : element
  const button = rail ? (
    cloneElement(trigger, undefined, face)
  ) : (
    <SidebarMenuButton size="lg" isActive={active} className="min-w-0" render={trigger}>
      {face}
    </SidebarMenuButton>
  )
  const placed = rail ? (
    <Tooltip>
      <TooltipTrigger render={button} />
      <TooltipContent side="right">{user.tooltip ?? (user.name || user.email)}</TooltipContent>
    </Tooltip>
  ) : (
    button
  )
  return (
    <SidebarMenu>
      <SidebarMenuItem className={cn(rail && "flex justify-center")}>
        {menu ? (
          <DropdownMenu>
            {placed}
            <UserMenuContent user={user} rail={rail} />
          </DropdownMenu>
        ) : (
          placed
        )}
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
