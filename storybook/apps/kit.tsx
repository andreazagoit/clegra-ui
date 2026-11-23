/* eslint-disable @typescript-eslint/no-explicit-any -- a kit holds modules of different platforms under the same names (as gallery/case.tsx) */
import * as alert from "@clegra/ui/components/alert"
import * as alertN from "@clegra/ui/drawn/components/alert"
import * as avatar from "@clegra/ui/components/avatar"
import * as avatarN from "@clegra/ui/drawn/components/avatar"
import * as badge from "@clegra/ui/components/badge"
import * as badgeN from "@clegra/ui/drawn/components/badge"
import * as button from "@clegra/ui/components/button"
import * as buttonN from "@clegra/ui/drawn/components/button"
import * as card from "@clegra/ui/components/card"
import * as cardN from "@clegra/ui/drawn/components/card"
import * as chart from "@clegra/ui/components/chart"
import * as chartN from "@clegra/ui/drawn/components/chart"
import * as empty from "@clegra/ui/components/empty"
import * as emptyN from "@clegra/ui/drawn/components/empty"
import * as field from "@clegra/ui/components/field"
import * as fieldN from "@clegra/ui/drawn/components/field"
import * as input from "@clegra/ui/components/input"
import * as inputN from "@clegra/ui/drawn/components/input"
import * as item from "@clegra/ui/components/item"
import * as itemN from "@clegra/ui/drawn/components/item"
import * as progress from "@clegra/ui/components/progress"
import * as progressN from "@clegra/ui/drawn/components/progress"
import * as skeleton from "@clegra/ui/components/skeleton"
import * as skeletonN from "@clegra/ui/drawn/components/skeleton"
import * as spinner from "@clegra/ui/components/spinner"
import * as spinnerN from "@clegra/ui/drawn/components/spinner"
import * as table from "@clegra/ui/components/table"
import * as tableN from "@clegra/ui/drawn/components/table"
import * as textarea from "@clegra/ui/components/textarea"
import * as textareaN from "@clegra/ui/drawn/components/textarea"
import * as recharts from "../gallery/cases/chart-recharts"
import * as rechartsN from "../gallery/cases/chart-recharts.native"
import * as drawnBase from "../gallery/drawn-base"
import * as platformBase from "../gallery/platform-base"
import { useColors } from "@clegra/ui/native/theme"

import type { Tone } from "@clegra/ui/records/derive"

/**
 * THE TWO KITS the catalogue's reference renderings are written against, once:
 * the web's components (shadcn on Base UI) and React Native's (drawn with the
 * same tokens, shown here through react-native-web). Same names, same props.
 */
export type Kit = Record<string, any>

const webTone: Record<Tone, string> = { neutral: "var(--muted-foreground)", info: "var(--link)", success: "var(--success)", warning: "var(--warning)", danger: "var(--destructive)" }

function WebToneDot({ tone }: { tone: Tone }) {
  return <span aria-hidden style={{ display: "inline-block", width: 8, height: 8, borderRadius: 8, flexShrink: 0, background: webTone[tone] }} />
}

function NativeToneDot({ tone }: { tone: Tone }) {
  const c = useColors()
  const color = { neutral: c.mutedForeground, info: c.link, success: c.emerald, warning: c.amber, danger: c.destructive }[tone]
  return <drawnBase.Div style={{ width: 8, height: 8, borderRadius: 8, backgroundColor: color }} />
}

export const webKit: Kit = Object.assign({}, platformBase, alert, avatar, badge, button, card, chart, recharts, empty, field, input, textarea, item, progress, skeleton, spinner, table, { ToneDot: WebToneDot, platform: "web" })
export const nativeKit: Kit = Object.assign({}, drawnBase, alertN, avatarN, badgeN, buttonN, cardN, chartN, rechartsN, emptyN, fieldN, inputN, textareaN, itemN, progressN, skeletonN, spinnerN, tableN, { ToneDot: NativeToneDot, platform: "native" })
