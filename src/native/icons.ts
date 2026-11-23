import * as L from "lucide-react-native"
import { createElement, useContext, type ComponentType } from "react"

import { IconContext } from "./icon-context"
import { useColors } from "./theme"
import { useTw } from "./use-tw"

export type IconProps = { className?: string; size?: number; color?: string } & Record<string, unknown>

const wrapped = new Map<string, ComponentType<IconProps>>()

/**
 * A lucide icon drawn with react-native-svg that reads `className` (size-4,
 * text-primary) and the colour and size of what surrounds it, as CSS gives
 * them on the web.
 */
export function wrapIcon(name: string, Icon: ComponentType<IconProps>): ComponentType<IconProps> {
  const hit = wrapped.get(name)
  if (hit) return hit
  const Wrapped = ({ className, size, color, ...props }: IconProps) => {
    const parsed = useTw(className)
    const around = useContext(IconContext)
    const colors = useColors()
    return createElement(Icon, { ...props, size: size ?? parsed.icon?.size ?? around.size ?? 16, color: color ?? parsed.icon?.color ?? around.color ?? colors.foreground })
  }
  Wrapped.displayName = name
  wrapped.set(name, Wrapped)
  return Wrapped
}

const icon = (name: keyof typeof L) => wrapIcon(name, L[name] as unknown as ComponentType<IconProps>)

/** The icons the drawn components use themselves. */
export const CheckIcon = icon("CheckIcon")
export const ChevronDownIcon = icon("ChevronDownIcon")
export const ChevronRightIcon = icon("ChevronRightIcon")
export const CircleCheckIcon = icon("CircleCheckIcon")
export const InfoIcon = icon("InfoIcon")
export const MenuIcon = icon("MenuIcon")
export const MoreHorizontalIcon = icon("MoreHorizontalIcon")
export const OctagonXIcon = icon("OctagonXIcon")
export const TriangleAlertIcon = icon("TriangleAlertIcon")
export const XIcon = icon("XIcon")
