"use client"

import { createContext, forwardRef, useContext, type AnchorHTMLAttributes, type ComponentType, type Ref } from "react"

/**
 * The app's link component (Next's `next/link`, the client's own `Link`), given
 * once to `AppShell` (`link`) and used for every internal link of the shell:
 * the library imports no router. Without one, a plain `<a>`.
 */
export type ShellLinkComponent = ComponentType<{ href: string; ref?: Ref<HTMLAnchorElement> } & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href">>

const PlainLink = forwardRef<HTMLAnchorElement, { href: string } & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href">>(function PlainLink(props, ref) {
  return <a ref={ref} {...props} />
})

const LinkContext = createContext<ShellLinkComponent>(PlainLink as ShellLinkComponent)

/** Gives the shell's parts the app's link component (AppShell does it with its `link` prop). */
export function ShellLinkProvider({ link, children }: { link?: ShellLinkComponent; children: React.ReactNode }) {
  return <LinkContext.Provider value={link ?? (PlainLink as ShellLinkComponent)}>{children}</LinkContext.Provider>
}

/** The link component in use. */
export const useShellLink = () => useContext(LinkContext)
