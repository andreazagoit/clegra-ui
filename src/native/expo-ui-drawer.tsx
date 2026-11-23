import { BottomSheet, Group, RNHostView } from "@expo/ui/swift-ui"
import { useContext } from "react"

import * as D from "../components/drawer.native"
import { Div } from "../primitives.native"
import { ExpoHost } from "./expo-ui-controls"
import type { SheetLook } from "./expo-ui-dialog"

/**
 * A drawer from the bottom as the system's sheet (SwiftUI's presentation
 * through Expo UI's BottomSheet), sized to its content, on the system's sheet
 * background; the drawn content sits inside it. `look` gives the sheet's
 * modifiers from the drawer's handle (the drag indicator). Drawers from the other edges stay drawn
 * (drawer.native.tsx).
 */
export function drawerContentFor(look: (showSwipeHandle: boolean) => SheetLook) {
  return function DrawerContent(props: Parameters<typeof D.DrawerContent>[0]) {
    const drawer = useContext(D.DrawerCtx)
    if (drawer.swipeDirection !== "down") return <D.DrawerContent {...props} />
    const { modifiers } = look(drawer.showSwipeHandle)
    return (
      <ExpoHost matchContents>
        <BottomSheet isPresented={drawer.open} onIsPresentedChange={drawer.setOpen} fitToContents>
          <Group modifiers={modifiers}>
            <RNHostView matchContents>
              <D.DrawerCtx.Provider value={drawer}>
                <Div className={`flex flex-col text-sm text-popover-foreground ${props.className ?? ""}`}>{props.children}</Div>
              </D.DrawerCtx.Provider>
            </RNHostView>
          </Group>
        </BottomSheet>
      </ExpoHost>
    )
  }
}
