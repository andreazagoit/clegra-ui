import type { StorybookConfig } from "@storybook/react-native-web-vite"

/**
 * THE PUBLIC CATALOGUE (npm run build-storybook:public, into
 * storybook-public/): the documentation for application developers, the
 * «Apps» root only. The internal component stories are not in it: they are never loaded, so nothing of them
 * reaches the bundle (scripts/check-storybook.mjs checks the output).
 * The internal catalogue is .storybook/ (everything, never deployed).
 */
const config: StorybookConfig = {
  stories: ["../storybook/stories/apps/*.stories.tsx"],
  addons: ["@storybook/addon-docs"],
  framework: { name: "@storybook/react-native-web-vite", options: {} },
  core: { disableTelemetry: true },
  async viteFinal(config) {
    const { default: tailwindcss } = await import("@tailwindcss/vite")
    config.plugins = [...(config.plugins ?? []), tailwindcss()]
    // react-native-svg's web build imports React Native's asset registry, which no web bundle has.
    const registry = { find: "@react-native/assets-registry/registry", replacement: new URL("../.storybook/assets-registry.ts", import.meta.url).pathname }
    const alias = config.resolve?.alias
    config.resolve = { ...config.resolve, alias: [registry, ...(Array.isArray(alias) ? alias : Object.entries(alias ?? {}).map(([find, replacement]) => ({ find, replacement: replacement as string })))] }
    // react-native-svg's native-only modules (fabric/) import names react-native-web lacks: shimmed, as the build does.
    const deps = config.optimizeDeps ?? {}
    config.optimizeDeps = { ...deps, rolldownOptions: { ...deps.rolldownOptions, shimMissingExports: true } }
    return config
  },
}

export default config
