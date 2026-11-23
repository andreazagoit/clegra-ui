import * as L from "lucide-react-native"
import type { ComponentType } from "react"

import { wrapIcon, type IconProps } from "@clegra/ui/native/icons"

const icon = (name: "PlusIcon" | "SearchIcon" | "InboxIcon" | "BuildingIcon" | "FileTextIcon") => wrapIcon(name, L[name] as unknown as ComponentType<IconProps>)

/** The gallery's icons drawn with react-native-svg, reading className as the web's. */
export const icons = { Plus: icon("PlusIcon"), Search: icon("SearchIcon"), Inbox: icon("InboxIcon"), Building: icon("BuildingIcon"), FileText: icon("FileTextIcon") }
