import { useWindowDimensions } from "react-native"

const MOBILE_BREAKPOINT = 768

/** As use-mobile.ts on the web: below this width the sidebar is a sheet. */
export const useIsMobile = () => useWindowDimensions().width < MOBILE_BREAKPOINT
