import { cn } from "cn"

/**
 * A PAGE'S CONTENT ON THE SHELL (the design system Part 2): the layout's
 * column and the page's heading, the same in every web app (the client's
 * pages, the account, /platform, /developer, the company server's panel).
 *
 * - `PageHeading`: the page's or the record's name (26/700, −2 % tracking),
 *   the record's own tile before it where it has one (a space's), a status chip beside it, one line of context under it, the page's own
 *   controls on the right (a dialog's trigger, «Nuovo progetto»). Content, not
 *   a title band: it scrolls away with the page (Part 1 §3).
 * - `ShellPage`: `contained` (one thing to read, fill in or check: a 960
 *   column centred in the shell's gutters) or `full` (many things compared: no
 *   cap); the heading, then the page's toolbar (search and filters of a list),
 *   then the content, 16 apart. The column is a container (`@container`), so
 *   its cards go two by two from 680 of room (`@[680px]:grid-cols-2`).
 *
 * ```tsx
 * <ShellPage title="Profilo" description="Come ti vedono gli altri.">…cards…</ShellPage>
 * ```
 */
export function PageHeading({
  title,
  media,
  status,
  description,
  actions,
  className,
}: {
  title: React.ReactNode
  /** The record's own tile or picture before the name (a space's tile), top-aligned with it. */
  media?: React.ReactNode
  /** A chip beside the name (a record's state). */
  status?: React.ReactNode
  /** One line of context under the name. */
  description?: React.ReactNode
  /** The page's own controls, on the right (they wrap under the name when room is short). */
  actions?: React.ReactNode
  className?: string
}) {
  return (
    <header data-page-heading="" className={cn("flex flex-wrap items-start gap-x-3 gap-y-2", media && "gap-x-4", className)}>
      {media && <div className="shrink-0">{media}</div>}
      <div className="flex min-w-0 flex-1 basis-72 flex-col gap-1">
        <div className="flex min-w-0 flex-wrap items-center gap-2.5">
          <h1 className="min-w-0 text-[1.625rem] leading-tight font-bold tracking-[-0.02em] text-foreground">{title}</h1>
          {status}
        </div>
        {description && <div className="text-[0.84375rem] text-pretty text-muted-foreground">{description}</div>}
      </div>
      {actions && <div className="flex max-w-full min-w-0 flex-wrap items-center gap-2">{actions}</div>}
    </header>
  )
}

export function ShellPage({
  title,
  media,
  status,
  description,
  actions,
  toolbar,
  layout = "contained",
  className,
  children,
}: {
  title: React.ReactNode
  media?: React.ReactNode
  status?: React.ReactNode
  description?: React.ReactNode
  actions?: React.ReactNode
  /** A list's search and filters, between the heading and the content. */
  toolbar?: React.ReactNode
  /** `contained` (a 960 column, the default) or `full` (the whole width: a table of many things). */
  layout?: "contained" | "full"
  className?: string
  children: React.ReactNode
}) {
  return (
    <div
      data-page-layout={layout}
      className={cn("@container flex w-full min-w-0 flex-col gap-4", layout === "contained" && "mx-auto max-w-(--shell-column)", className)}
    >
      <PageHeading title={title} media={media} status={status} description={description} actions={actions} />
      {toolbar}
      {children}
    </div>
  )
}
