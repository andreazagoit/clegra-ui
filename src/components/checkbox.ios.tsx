/**
 * iOS: drawn (checkbox.native.tsx). SwiftUI has no checkbox on iOS: Toggle's
 * checkbox style isn't available there, and Apple's substitute, a
 * switch, is another control with another meaning and size (Switch is
 * already that). A checkbox that picks rows or accepts terms would read wrong
 * as a switch.
 */
export * from "./checkbox.native"
