/** What every case gets on the web, beside its own modules: HTML elements, lucide icons, sonner. */
import { BuildingIcon, FileTextIcon, InboxIcon, PlusIcon, SearchIcon } from "lucide-react"

export * from "@clegra/ui/primitives"
export { toast } from "sonner"
export { Toaster } from "@clegra/ui/components/sonner"

export const icons = { Plus: PlusIcon, Search: SearchIcon, Inbox: InboxIcon, Building: BuildingIcon, FileText: FileTextIcon }

/** The web's dark mode is the `dark` class on <html>. */
export function applyTheme(dark: boolean) {
  document.documentElement.classList.toggle("dark", dark)
}

export const platformName = "Web (shadcn on Base UI)"
