import { BottomSheet, Button, HStack, RNHostView, Spacer, VStack } from "@expo/ui/swift-ui"
import { buttonStyle, padding, tint } from "@expo/ui/swift-ui/modifiers"
import { useContext } from "react"
import { ScrollView, useWindowDimensions } from "react-native"

import * as D from "../components/dialog.native"
import { Div } from "../primitives.native"
import { iconOnly, ExpoHost } from "./expo-ui-controls"
import type { Modifier } from "./expo-ui-input"

/** The modifiers on the sheet's content (the drag indicator). */
export type SheetLook = { modifiers: Modifier[] }

/**
 * A dialog as the system's sheet (SwiftUI's presentation through Expo UI's
 * BottomSheet), sized to its content, on the system's sheet background, with
 * SwiftUI's close button (grey, as system sheets have it) for
 * `showCloseButton`. It rises from the bottom with the system's swipe to
 * dismiss. The content stays React
 * Native (RNHostView), so DialogClose, forms and buttons inside work as drawn.
 * A side panel (`side` left, right or top, as Sheet passes) stays drawn
 * (dialog.native.tsx).
 */
export function dialogContentFor(look: SheetLook) {
  return function DialogContent(props: Parameters<typeof D.DialogContent>[0]) {
    const dialog = useContext(D.DialogCtx)
    const { height } = useWindowDimensions()
    if (props.side && props.side !== "bottom") return <D.DialogContent {...props} />
    const { showCloseButton = true, className = "", children } = props
    return (
      <ExpoHost matchContents>
        <BottomSheet isPresented={dialog.open} onIsPresentedChange={dialog.setOpen} fitToContents>
          <VStack spacing={0} modifiers={look.modifiers}>
            {showCloseButton ? (
              <HStack modifiers={[padding({ top: 12, trailing: 12 })]}>
                <Spacer />
                <Button label="Chiudi" systemImage="xmark" onPress={() => dialog.setOpen(false)} modifiers={[buttonStyle("bordered"), iconOnly, tint("gray")]} />
              </HStack>
            ) : null}
            <RNHostView matchContents>
              <D.DialogCtx.Provider value={dialog}>
                <ScrollView style={{ maxHeight: height * 0.85 }}>
                  <Div className={`flex flex-col gap-4 p-6 text-sm text-popover-foreground ${showCloseButton ? "pt-2" : ""} ${className}`}>{children}</Div>
                </ScrollView>
              </D.DialogCtx.Provider>
            </RNHostView>
          </VStack>
        </BottomSheet>
      </ExpoHost>
    )
  }
}
