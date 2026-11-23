"use client"

import { cn } from "cn"

import { Avatar, AvatarFallback, AvatarImage } from "../components/avatar"
import { initials } from "./model"

/**
 * A person's face: the photo when there is one, else the initials. One circle
 * (the avatar's own shape, its edge included); `tile`: the rail's rounded
 * square instead (`--rail-tile-radius`, the apps' tiles' shape), the photo or
 * the initials filling it, edged by the app icons' hairline.
 */
export function Face({
  name,
  email,
  src,
  tile = false,
  className = "size-8",
  fallbackClassName,
}: {
  name: string
  email: string
  src?: string | null
  tile?: boolean
  className?: string
  /** The initials' ground and type. */
  fallbackClassName?: string
}) {
  const shape = tile && "rounded-(--rail-tile-radius)"
  return (
    <Avatar className={cn(className, shape, tile && "after:rounded-(--rail-tile-radius) after:border-0 after:shadow-[inset_0_0_0_1px_rgb(0_0_0/0.07)] dark:after:shadow-[inset_0_0_0_1px_rgb(255_255_255/0.08)]")}>
      {src && <AvatarImage src={src} alt="" className={cn(shape)} />}
      <AvatarFallback className={cn(shape, fallbackClassName)}>{initials(name, email)}</AvatarFallback>
    </Avatar>
  )
}
