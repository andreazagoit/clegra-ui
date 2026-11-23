/**
 * Clegra's theme (src/styles.css, which brings in src/brand's colors.css
 * and theme.css) as plain values for platforms with no CSS: the colours worked
 * out for each role, light and dark (the neutral base with Blu and Arancio,
 * the same for every account, a company's or a personal one), the radii and the type sizes. tokens.test.ts checks them against the stylesheets. The
 * list of what differs from the web is in docs/ui.md.
 */
export const light = {
  background: "#FFFFFF",
  foreground: "#0A0A0A",
  card: "#FFFFFF",
  popover: "#FFFFFF",
  primary: "#2D4BEE",
  primaryForeground: "#FFFFFF",
  cardForeground: "#0A0A0A",
  popoverForeground: "#0A0A0A",
  secondary: "#F5F5F5",
  secondaryForeground: "#0A0A0A",
  muted: "#F5F5F5",
  mutedForeground: "#6B6B6B",
  accent: "#F5F5F5",
  destructive: "#C62F3A",
  destructiveSoft: "rgba(198,47,58,0.1)",
  border: "#E5E5E5",
  input: "#D4D4D4",
  ring: "rgba(45,75,238,0.5)",
  sidebar: "#FAFAFA",
  sidebarForeground: "#0A0A0A",
  sidebarAccent: "#F5F5F5",
  sidebarAccentForeground: "#0A0A0A",
  sidebarBorder: "#E5E5E5",
  accentForeground: "#0A0A0A",
  primarySoft: "rgba(45,75,238,0.1)",
  primaryHover: "rgba(45,75,238,0.8)",
  amber: "#9A5B00",
  emerald: "#0F7A4A",
  overlay: "rgba(0,0,0,0.1)",
  yes: "#FF5F1F",
  onYes: "#0A0A0A",
  link: "#2D4BEE",
  /* The sidebar's open item: its words and icon (theme.css, --sidebar-active). */
  sidebarActive: "#2D4BEE",
}

export type Colors = typeof light

export const dark: Colors = {
  background: "#0A0A0A",
  foreground: "#FAFAFA",
  card: "#171717",
  popover: "#171717",
  primary: "#2D4BEE",
  primaryForeground: "#FFFFFF",
  cardForeground: "#FAFAFA",
  popoverForeground: "#FAFAFA",
  secondary: "#262626",
  secondaryForeground: "#FAFAFA",
  muted: "#262626",
  mutedForeground: "#A3A3A3",
  accent: "#262626",
  destructive: "#FF8A8F",
  destructiveSoft: "rgba(255,138,143,0.2)",
  border: "rgba(255,255,255,0.1)",
  input: "rgba(255,255,255,0.16)",
  ring: "rgba(143,162,255,0.5)",
  sidebar: "#1C1C1C",
  sidebarForeground: "#FAFAFA",
  sidebarAccent: "#262626",
  sidebarAccentForeground: "#FAFAFA",
  sidebarBorder: "rgba(255,255,255,0.1)",
  accentForeground: "#FAFAFA",
  primarySoft: "rgba(45,75,238,0.2)",
  primaryHover: "rgba(45,75,238,0.8)",
  amber: "#F2B544",
  emerald: "#4FD69A",
  overlay: "rgba(0,0,0,0.5)",
  yes: "#FF5F1F",
  onYes: "#0A0A0A",
  link: "#8FA2FF",
  sidebarActive: "#8FA2FF",
}

/** The colours of a mode, light or dark. */
export const colorsFor = (mode: "light" | "dark"): Colors => (mode === "dark" ? dark : light)

/** --radius is 0.875rem. */
export const radius = { sm: 8.4, md: 11.2, lg: 14, xl: 19.6, "2xl": 25.2, pill: 36 }

/** Tailwind's text-xs, text-sm, text-lg, text-2xl with their line heights. */
export const type = {
  xs: { fontSize: 12, lineHeight: 16 },
  sm: { fontSize: 14, lineHeight: 20 },
  base: { fontSize: 16, lineHeight: 24 },
  lg: { fontSize: 18, lineHeight: 28 },
  xl: { fontSize: 20, lineHeight: 28 },
  "2xl": { fontSize: 24, lineHeight: 32 },
  "3xl": { fontSize: 30, lineHeight: 36 },
}

/**
 * The brand's own tones that Clegra's face is drawn in (src/brand/colors.css --palette-*), for an SVG with no
 * stylesheet: the face uses the custom properties first and these only as their fallbacks.
 */
export const palette = { blue: "#2D4BEE", cream: "#F7F3EA", white: "#FFFFFF" }
