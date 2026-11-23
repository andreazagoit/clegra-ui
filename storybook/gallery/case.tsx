/* eslint-disable @typescript-eslint/no-explicit-any -- a kit holds modules of different platforms under the same names */
import type { ReactNode } from "react"

import * as drawnBase from "./drawn-base"
import * as platformBase from "./platform-base"

/**
 * One component in the gallery, written once against a kit: the same names
 * from this platform's modules (the web's shadcn files in a browser; x.ios
 * or x.native in an app) and from the drawn ones (x.native), beside each
 * other. A case imports both sets of its modules: `import * as button from
 * "../../components/button"` resolves per platform, `.native` is always drawn.
 */
export type Kit = Record<string, any>
export type Case = { name: string; platform: Kit; drawn: Kit; render: (kit: Kit) => ReactNode }

export function defineCase(name: string, platform: object[], drawn: object[], render: (kit: Kit) => ReactNode): Case {
  return { name, platform: Object.assign({}, platformBase, ...platform), drawn: Object.assign({}, drawnBase, ...drawn), render }
}
