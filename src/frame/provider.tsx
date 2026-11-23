"use client"

import * as React from "react"

import { DEFAULT_THEME, MCP_APPS_PROTOCOL_VERSION, themeOfHostContext, type ClegraMode, type ClegraTheme, type HostContextLike } from "./protocol"
import { applyClegraTheme, hostContextFor, variablesToApply, type HostContextOptions } from "./theme"

/**
 * <ClegraProvider>: makes an application's own view look like the Clegra it
 * is shown in. It asks the host for its context over the MCP Apps bridge
 * (`ui/initialize`), applies the look (light or dark, the tokens, the person's text size, the locale) to the document, follows
 * every change, and tells the host the content's size so the frame fits it.
 *
 *   import { ClegraProvider } from "@clegra/ui/frame"
 *   createRoot(el).render(<ClegraProvider appInfo={{ name: "acme-map", version: "1.0.0" }}><Map /></ClegraProvider>)
 *
 * Three ways to run:
 * - by itself (default): it speaks the few messages it needs;
 * - with the official client (`@modelcontextprotocol/ext-apps`): pass its
 *   host context as `hostContext`; the provider then sends nothing (one
 *   client per view) and only applies the look;
 * - outside a host (`preview`, or a page opened directly): no messages, the
 *   look you ask for, for development and Storybook.
 */

type RpcId = number | string
type Pending = { resolve: (value: unknown) => void; reject: (error: Error) => void }

export type ClegraHost = {
  /** True once the host answered `ui/initialize`. */
  connected: boolean
  /** A JSON-RPC request to the host (`tools/call`, `resources/read`, `ui/open-link`…): the result, or a rejection with the host's message. */
  request: (method: string, params?: Record<string, unknown>) => Promise<unknown>
  /** A JSON-RPC notification to the host. */
  notify: (method: string, params?: Record<string, unknown>) => void
}

const noHost: ClegraHost = {
  connected: false,
  request: () => Promise.reject(new Error("No host: this view is not shown inside an MCP Apps host.")),
  notify: () => {},
}

const ThemeContext = React.createContext<ClegraTheme>(DEFAULT_THEME)
const HostContext = React.createContext<ClegraHost>(noHost)

/** The look in use: mode, text size, locale, platform. */
export const useClegraTheme = () => React.useContext(ThemeContext)
/** The host bridge of the nearest provider. */
export const useClegraHost = () => React.useContext(HostContext)

export type ClegraProviderProps = {
  children: React.ReactNode
  /** Who the view is, for `ui/initialize`. */
  appInfo?: { name: string; version: string }
  /** The host context, when another MCP Apps client owns the bridge: the provider only applies it. */
  hostContext?: HostContextLike | null
  /** No host: this look. `true` follows the system's light or dark. */
  preview?: boolean | (Partial<HostContextOptions> & { mode?: ClegraMode })
  /** Report the content's size to the host as it changes. Default: true when the provider owns the bridge. */
  autoResize?: boolean
  /** Apply the look to a wrapper element instead of the document (several looks on one page: a preview, Storybook). */
  scoped?: boolean
  className?: string
  /** Shown until the host answered, instead of a flash in the wrong colours. Default: nothing. */
  fallback?: React.ReactNode
}

const systemMode = (): ClegraMode => (typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light")

function previewTheme(preview: ClegraProviderProps["preview"]): ClegraTheme {
  const options = typeof preview === "object" ? preview : {}
  return themeOfHostContext(hostContextFor({ ...options, mode: options.mode ?? systemMode() }))
}

const inFrame = () => typeof window !== "undefined" && window.parent !== window

export function ClegraProvider({ children, appInfo, hostContext, preview, autoResize, scoped, className, fallback = null }: ClegraProviderProps) {
  const controlled = hostContext !== undefined
  const previewKey = preview === undefined ? "" : JSON.stringify(preview)
  // The bridge is the provider's only inside a frame, and only when nobody else owns it.
  const bridged = !controlled && !preview && inFrame()
  const [bridgeTheme, setBridgeTheme] = React.useState<ClegraTheme | null>(null)
  const pending = React.useRef(new Map<RpcId, Pending>())
  const nextId = React.useRef(1)

  const send = React.useCallback((message: Record<string, unknown>) => {
    // The host's origin is not known to a sandboxed view: nothing secret is ever sent from here.
    window.parent.postMessage({ jsonrpc: "2.0", ...message }, "*")
  }, [])

  const host = React.useMemo<ClegraHost>(() => {
    if (!bridged) return noHost
    return {
      connected: bridgeTheme !== null,
      request: (method, params) =>
        new Promise((resolve, reject) => {
          const id = nextId.current++
          pending.current.set(id, { resolve, reject })
          send({ id, method, ...(params ? { params } : {}) })
        }),
      notify: (method, params) => send({ method, ...(params ? { params } : {}) }),
    }
  }, [bridged, bridgeTheme, send])

  React.useEffect(() => {
    if (!bridged) return
    const waiting = pending.current
    const initId = `init-${nextId.current++}`
    const onMessage = (event: MessageEvent) => {
      if (event.source !== window.parent) return
      const data = event.data as { jsonrpc?: unknown; id?: RpcId; method?: unknown; params?: unknown; result?: unknown; error?: { message?: unknown } } | null
      if (!data || typeof data !== "object" || data.jsonrpc !== "2.0") return
      if (typeof data.method === "string") {
        if (data.method === "ui/notifications/host-context-changed") setBridgeTheme((current) => themeOfHostContext(data.params, current ?? DEFAULT_THEME))
        // A request of the host's (it has an id): answered, so the host never waits on this view.
        else if (data.id !== undefined && (data.method === "ping" || data.method === "ui/resource-teardown")) send({ id: data.id, result: {} })
        return
      }
      if (data.id === initId) {
        if (data.error) return
        const result = data.result as { hostContext?: unknown } | undefined
        setBridgeTheme(themeOfHostContext(result?.hostContext))
        send({ method: "ui/notifications/initialized" })
        return
      }
      const call = data.id === undefined ? undefined : waiting.get(data.id)
      if (!call) return
      waiting.delete(data.id!)
      if (data.error) call.reject(new Error(typeof data.error.message === "string" ? data.error.message : "The host refused the request."))
      else call.resolve(data.result)
    }
    window.addEventListener("message", onMessage)
    send({ id: initId, method: "ui/initialize", params: { protocolVersion: MCP_APPS_PROTOCOL_VERSION, appInfo: appInfo ?? { name: "clegra-ui-view", version: "0.0.0" }, appCapabilities: {} } })
    return () => {
      window.removeEventListener("message", onMessage)
      for (const call of waiting.values()) call.reject(new Error("The view was closed."))
      waiting.clear()
    }
    // appInfo is read once, at the handshake.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bridged, send])

  const theme = React.useMemo<ClegraTheme | null>(() => {
    if (controlled) return hostContext ? themeOfHostContext(hostContext) : null
    if (bridged) return bridgeTheme
    return previewTheme(preview)
    // previewKey stands for `preview` (an object literal on every render).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [controlled, hostContext, bridged, bridgeTheme, previewKey])

  const scope = React.useRef<HTMLDivElement>(null)
  React.useLayoutEffect(() => {
    if (theme && !scoped) applyClegraTheme(theme)
  }, [theme, scoped])

  // The content's size, to the host: the frame grows and shrinks with what it shows.
  const resize = autoResize ?? bridged
  React.useEffect(() => {
    if (!resize || !bridged || !theme || typeof ResizeObserver === "undefined") return
    let last = ""
    let frame = 0
    const report = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const root = document.documentElement
        const width = Math.ceil(root.scrollWidth)
        const height = Math.ceil(root.getBoundingClientRect().height)
        const key = `${width}x${height}`
        if (key === last) return
        last = key
        send({ method: "ui/notifications/size-changed", params: { width, height } })
      })
    }
    const observer = new ResizeObserver(report)
    observer.observe(document.documentElement)
    if (document.body) observer.observe(document.body)
    report()
    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
    }
  }, [resize, bridged, theme, send])

  if (!theme) return <>{fallback}</>
  const content = (
    <ThemeContext.Provider value={theme}>
      <HostContext.Provider value={host}>{children}</HostContext.Provider>
    </ThemeContext.Provider>
  )
  if (!scoped) return content
  return (
    <div
      ref={scope}
      lang={theme.locale}
      data-theme={theme.mode}
      className={[theme.mode === "dark" ? "dark" : "", "bg-background text-foreground", className ?? ""].filter(Boolean).join(" ")}
      style={{ ...(variablesToApply(theme) as React.CSSProperties), colorScheme: theme.mode }}
    >
      {content}
    </div>
  )
}
