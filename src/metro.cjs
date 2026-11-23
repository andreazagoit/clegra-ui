/**
 * Metro setting for apps that use @clegra/ui/react-native/...: it adds the "ios"
 * export condition, so Metro gives iOS the Expo UI files (x.ios.js). Without
 * it iOS gets the drawn files (x.native.js), as every other platform does.
 *
 *   // metro.config.js
 *   const { getDefaultConfig } = require("expo/metro-config")
 *   const { withClegraUI } = require("@clegra/ui/metro")
 *   module.exports = withClegraUI(getDefaultConfig(__dirname))
 */
function withClegraUI(config) {
  const resolver = config.resolver ?? {}
  const byPlatform = { ...(resolver.unstable_conditionsByPlatform ?? {}) }
  const current = byPlatform.ios ?? ["react-native"]
  byPlatform.ios = [...new Set([...current, "react-native", "ios"])]
  return { ...config, resolver: { ...resolver, unstable_enablePackageExports: true, unstable_conditionsByPlatform: byPlatform } }
}

module.exports = { withClegraUI }
