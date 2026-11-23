import * as native from "lucide-react-native"
import type { ComponentType } from "react"

import { wrapIcon, type IconProps } from "./icons"

declare const module: { exports: unknown }

/**
 * `lucide-react` for a React Native app: point the bundler's `lucide-react` at
 * `@clegra/ui/native/lucide` (Metro's resolveRequest) and pages keep their web
 * imports. The same names, drawn with react-native-svg, reading `className`.
 */
module.exports = new Proxy(native as Record<string, unknown>, {
  get(target, name) {
    if (typeof name !== "string") return Reflect.get(target, name)
    const icon = target[name]
    if (!icon || !/(^[A-Z])/.test(name) || name === "Icon" || name.endsWith("Provider")) return icon
    return wrapIcon(name, icon as ComponentType<IconProps>)
  },
})
