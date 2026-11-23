import type { StorybookConfig } from "@storybook/react-native-web-vite"

/**
 * The catalogue of @clegra/ui (npm run storybook; dev-only, never in the tarball): every component in its web version (shadcn on Base UI) and its
 * React Native version (x.native.tsx, rendered through react-native-web), side by side too, Clegra's face and the
 * records, examples (storybook/), with the toolbar's theme (light / dark). The brand's pages are not here.
 */

const config: StorybookConfig = {
  stories: ["../storybook/**/*.stories.tsx"],
  addons: ["@storybook/addon-docs"],
  framework: { name: "@storybook/react-native-web-vite", options: {} },
  core: { disableTelemetry: true },
  async viteFinal(config) {
    const { default: tailwindcss } = await import("@tailwindcss/vite")
    config.plugins = [...(config.plugins ?? []), tailwindcss()]
    // react-native-svg's web build imports React Native's asset registry, which no web bundle has.
    const registry = { find: "@react-native/assets-registry/registry", replacement: new URL("./assets-registry.ts", import.meta.url).pathname }
    const alias = config.resolve?.alias
    config.resolve = { ...config.resolve, alias: [registry, ...(Array.isArray(alias) ? alias : Object.entries(alias ?? {}).map(([find, replacement]) => ({ find, replacement: replacement as string })))] }
    // react-native-svg's native-only modules (fabric/) import names react-native-web lacks: shimmed, as the build does.
    const deps = config.optimizeDeps ?? {}
    config.optimizeDeps = { ...deps, rolldownOptions: { ...deps.rolldownOptions, shimMissingExports: true } }
    return config
  },
}

export default config
