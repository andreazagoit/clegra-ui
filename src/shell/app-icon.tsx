"use client"

import { cn } from "cn"

/**
 * An app's icon image in Apple's app icon format (the app shell design §3): a
 * 1024 × 1024 square, full-bleed and opaque, no rounded corners of its own,
 * and optionally a dark variant, as an iOS app ships. Whoever draws it applies
 * the mask (`AppIconImage`), so an iOS app's own icon fits unchanged. The
 * client draws its apps with it, the core «Open Clegra» with Clegra's own.
 */
export type AppIconImageSource = { light: string; dark?: string }

/** The continuous-corner mask (a superellipse, n = 5, close to Apple's), as a CSS mask image (an app's tile uses it too). */
export const APP_ICON_MASK = (() => {
  const points: string[] = []
  for (let i = 0; i < 180; i++) {
    const a = (i / 180) * Math.PI * 2
    const c = Math.cos(a)
    const s = Math.sin(a)
    points.push(`${(50 + 50 * Math.sign(c) * Math.abs(c) ** 0.4).toFixed(2)} ${(50 + 50 * Math.sign(s) * Math.abs(s) ** 0.4).toFixed(2)}`)
  }
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><path d='M${points.join("L")}Z'/></svg>`
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}") center / 100% 100% no-repeat`
})()

/**
 * An icon image, masked: the continuous-corner shape at any size, a hairline
 * edge and a faint top light (so a pale icon still has an edge on a white
 * page); the dark variant in the dark theme when there is one. Size it with
 * `className` (`size-8`).
 */
export function AppIconImage({ image, className }: { image: AppIconImageSource; className?: string }) {
  return (
    <span aria-hidden className={cn("relative inline-block shrink-0 overflow-hidden", className)} style={{ mask: APP_ICON_MASK, WebkitMask: APP_ICON_MASK }}>
      <img src={image.light} alt="" draggable={false} className={cn("block size-full", image.dark && "dark:hidden")} />
      {image.dark ? (
        <img src={image.dark} alt="" draggable={false} className="hidden size-full dark:block" />
      ) : null}
      <span className="pointer-events-none absolute inset-0 rounded-[22%] shadow-[inset_0_0_0_1px_rgb(0_0_0/0.07),inset_0_1px_0_rgb(255_255_255/0.3)] dark:shadow-[inset_0_0_0_1px_rgb(255_255_255/0.08),inset_0_1px_0_rgb(255_255_255/0.12)]" />
    </span>
  )
}
