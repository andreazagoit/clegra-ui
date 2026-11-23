import { cn } from "cn"

import { Item, ItemMedia } from "../components/item"

/**
 * ROWS INSIDE A CARD (the design system §1.6, §10): a list of shadcn
 * `Item`s as `<ul>`/`<li>`, flush with the card's padding, a hairline between
 * rows and none around them; no hover of their own (a row's action is its
 * button). Sessions, sign-in methods, connected apps. Put `RowIcon` (or `ItemMedia`),
 * `ItemContent`, `ItemActions` inside a `Row`.
 *
 * ```tsx
 * <RowList data-testid="sessions">
 *   <Row><RowIcon><LaptopIcon /></RowIcon><ItemContent>…</ItemContent><ItemActions>…</ItemActions></Row>
 * </RowList>
 * ```
 */
export function RowList({ className, ...props }: React.ComponentProps<"ul">) {
  return <ul data-slot="row-list" className={cn("flex flex-col", className)} {...props} />
}

/** One row of a `RowList`: an `Item` (size `sm`) as an `<li>`. */
export function Row({ className, ...props }: Omit<React.ComponentProps<typeof Item>, "render" | "size" | "variant">) {
  return (
    <Item
      size="sm"
      render={<li />}
      className={cn("rounded-none border-0 border-t border-t-(--hairline) px-0 first:border-t-0 [a]:hover:bg-transparent", className)}
      {...props}
    />
  )
}

/** A row's round icon on the quiet fill (the device, the sign-in method, the app's initial): its `ItemMedia`. */
export function RowIcon({ className, ...props }: React.ComponentProps<typeof ItemMedia>) {
  return (
    <ItemMedia
      aria-hidden
      data-row-icon=""
      className={cn("size-10 rounded-full bg-muted text-foreground [&_svg:not([class*='size-'])]:size-5", className)}
      {...props}
    />
  )
}

/**
 * FACTS INSIDE A CARD: a record's label and value pairs (a company's plan, its server, a version's listing) as a
 * `<dl>` flush with the card's padding, a hairline between rows like `RowList`, never a bordered box of its own.
 * The label is quiet on the left (a column from 560 of room), the value beside it; under 560 they stack.
 *
 * ```tsx
 * <FactList><Fact label="Piano">Business</Fact><Fact label="Server">n-1a2b3c4d.clegra.com</Fact></FactList>
 * ```
 */
export function FactList({ className, ...props }: React.ComponentProps<"dl">) {
  return <dl data-slot="fact-list" className={cn("@container flex flex-col text-sm", className)} {...props} />
}

/** One row of a `FactList`: the label (`dt`) and its value (`dd`). */
export function Fact({ label, children, className, ...props }: Omit<React.ComponentProps<"div">, "children"> & { label: React.ReactNode; children: React.ReactNode }) {
  return (
    <div
      data-slot="fact"
      className={cn("grid gap-x-6 gap-y-0.5 border-t border-t-(--hairline) py-2.5 first:border-t-0 first:pt-0 last:pb-0 @[560px]:grid-cols-[12rem_minmax(0,1fr)]", className)}
      {...props}
    >
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="min-w-0 break-words text-foreground">{children}</dd>
    </div>
  )
}
