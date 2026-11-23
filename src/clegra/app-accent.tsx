"use client"

import * as React from "react"

import { DEFAULT_APP_ACCENT, type AppAccentName } from "../brand/accents"

/**
 * <AppAccent>: an app's area in the app's own tint (src/brand/accents.ts, owner 2026-11-20: a limited palette by
 * name, like Apple's apps). It marks its element `data-app-accent="<name>"`, which the stylesheet
 * (@clegra/ui/styles.css, src/brand/accents.css) turns into --app-accent, --app-accent-foreground and
 * --app-accent-text and into the theme's roles of the app's own controls (--primary, --link, --ring,
 * --sidebar-active; every selected state is --primary as the glass fill): shadcn's components inside follow it untouched. Clegra's chrome stays outside
 * it (an app shell's `accent` marks only the app's bar and content).
 *
 *   <AppAccent accent="red" className="flex flex-1 flex-col">…the app's page…</AppAccent>
 *
 * `useAppAccent()` says the accent in force (the default, blue, outside any). `appAccentProps(name)` gives the
 * attribute for an element of your own.
 *
 * An overlay portalled out of the area (a popover, a menu, a select's list, a dialog, a sheet, a drawer, a tooltip)
 * is rendered under <body>, outside the element that carries the attribute; its Portal takes
 * `useAppAccentProps()` (the accent in force where it is opened, from React's context, which crosses the portal), so
 * a date picker opened in Calendar is Calendar's red, one opened in Clegra's chrome stays blue.
 */
const AccentContext = React.createContext<AppAccentName | null>(null)

/** The attribute that puts an element and what is inside it in an accent. */
export const appAccentProps = (accent: AppAccentName) => ({ "data-app-accent": accent }) as const

export function AppAccent({ accent, children, ...props }: React.ComponentProps<"div"> & { accent: AppAccentName }) {
  return (
    <AccentContext value={accent}>
      <div {...props} {...appAccentProps(accent)}>
        {children}
      </div>
    </AccentContext>
  )
}

/** For a part of the tree marked by its own element (the shell's panels): the context only, no element. */
export function AppAccentContext({ accent, children }: { accent: AppAccentName; children: React.ReactNode }) {
  return <AccentContext value={accent}>{children}</AccentContext>
}

/** The accent in force here: the nearest <AppAccent>'s, else the default (Clegra's blue). */
export const useAppAccent = (): AppAccentName => React.useContext(AccentContext) ?? DEFAULT_APP_ACCENT

/** The attribute of the accent in force, for an overlay's portal (above); none outside every app's area. */
export function useAppAccentProps(): ReturnType<typeof appAccentProps> | Record<string, never> {
  const accent = React.useContext(AccentContext)
  return accent ? appAccentProps(accent) : {}
}
