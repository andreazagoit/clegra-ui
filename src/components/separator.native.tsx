import { Div } from "../primitives.native"

export function Separator({ orientation = "horizontal", className = "" }: { orientation?: "horizontal" | "vertical"; className?: string }) {
  return <Div role="separator" className={`bg-border shrink-0 ${orientation === "horizontal" ? "h-px w-full" : "w-px self-stretch"} ${className}`} />
}
