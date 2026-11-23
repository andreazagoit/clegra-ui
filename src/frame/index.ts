/**
 * @clegra/ui/frame: Clegra's look inside an application's own view (an MCP
 * Apps view shown in a sandboxed frame). Web only.
 */
export { ClegraProvider, useClegraHost, useClegraTheme, type ClegraHost, type ClegraProviderProps } from "./provider"
export {
  CLEGRA_STYLE_PREFIX,
  CLEGRA_UI_META_KEY,
  DEFAULT_THEME,
  MCP_APPS_PROTOCOL_VERSION,
  isSafeVariable,
  themeOfHostContext,
  type ClegraMode,
  type ClegraTheme,
  type ClegraUiContext,
  type HostContextLike,
  type SafeAreaInsets,
} from "./protocol"
export { CLEGRA_ROLE_NAMES, applyClegraTheme, clegraStyleVariables, hostContextFor, variablesToApply, type HostContextOptions } from "./theme"
