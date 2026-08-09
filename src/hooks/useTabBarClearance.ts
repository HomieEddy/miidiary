import { useSafeAreaInsets } from "react-native-safe-area-context";

/** Flat bottom nav geometry (mirrors PaperTabBar): 56px bar height +
 *  16px breathing room. The bar's own bottom inset is added separately. */
const TAB_BAR_CLEARANCE_BASE = 72;

/**
 * Bottom clearance scroll content needs so the floating tab bar never
 * covers the last row, including the device's gesture/navigation inset.
 */
export function useTabBarClearance(): number {
  const insets = useSafeAreaInsets();
  return TAB_BAR_CLEARANCE_BASE + insets.bottom;
}
