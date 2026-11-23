/**
 * What each case is in an iOS app, shown under its name in the gallery: the
 * Expo UI control, or "drawn" (the React Native version). The full table, with
 * when each one falls back to drawn, is in docs/PLATFORMS.md.
 */
export const nativeStatus: Record<string, string> = {
  button: "Button",
  input: "TextField / SecureField",
  textarea: "TextField (vertical)",
  switch: "Toggle (switch)",
  checkbox: "drawn",
  select: "Picker (menu)",
  "native-select": "Picker (menu)",
  slider: "Slider",
  tabs: "Picker (segmented)",
  "toggle-group": "Picker (segmented)",
  toggle: "Toggle (button)",
  progress: "ProgressView",
  spinner: "ProgressView",
  separator: "Divider",
  "dropdown-menu": "Menu",
  menubar: "Menu",
  "context-menu": "ContextMenu",
  dialog: "BottomSheet",
  sheet: "BottomSheet (bottom side)",
  drawer: "BottomSheet (bottom)",
  "alert-dialog": "Alert",
  popover: "Popover",
  calendar: "DatePicker (graphical)",
  "radio-group": "Picker",
  accordion: "DisclosureGroup",
  chart: "Chart",
}

export const statusLine = (name: string) => `iOS: ${nativeStatus[name] ?? "drawn"}`
