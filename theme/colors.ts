export const colors = {
  background: "#FDF8F0",
  foreground: "#2A2631",
  primary: "#FF6B9E",
  primaryForeground: "#2A2631",
  secondary: "#FFD166",
  secondaryForeground: "#2A2631",
  accent: "#06D6A0",
  accentForeground: "#2A2631",
  muted: "#F0E9DF",
  mutedForeground: "#6F6776",
  destructive: "#C2264E",
  destructiveForeground: "#FFFFFF",
  card: "#FFFFFF",
  cardForeground: "#2A2631",
  border: "#2A2631",
  ring: "#FF6B9E",
  chart: {
    1: "#FF6B9E",
    2: "#FFD166",
    3: "#06D6A0",
    4: "#118AB2",
    5: "#F77F00",
  },
  // Dark-mode counterparts for imperative (non-Tailwind) usage such as
  // SVG colors and chart labels. Keep in sync with the .dark CSS vars.
  dark: {
    border: "#7A7280",
    mutedForeground: "#9B93A4",
    destructive: "#F26080",
    destructiveForeground: "#2A2631",
    shadow: "#7A7280",
  },
} as const;

export function mutedForegroundHex(isDark: boolean): string {
  return isDark ? colors.dark.mutedForeground : colors.mutedForeground;
}

export function destructiveHex(isDark: boolean): string {
  return isDark ? colors.dark.destructive : colors.destructive;
}

export function destructiveForegroundHex(isDark: boolean): string {
  return isDark ? colors.dark.destructiveForeground : colors.destructiveForeground;
}

/** Brand colors deepened for text/icon use on light surfaces (WCAG). */
const brandText = {
  light: {
    primary: "#C2377E",
    secondary: "#B7791F",
    accent: "#0B8A72",
  },
  dark: {
    primary: colors.primary,
    secondary: colors.secondary,
    accent: colors.accent,
  },
} as const;

export function primaryTextHex(isDark: boolean): string {
  return isDark ? brandText.dark.primary : brandText.light.primary;
}

export function secondaryTextHex(isDark: boolean): string {
  return isDark ? brandText.dark.secondary : brandText.light.secondary;
}

export function accentTextHex(isDark: boolean): string {
  return isDark ? brandText.dark.accent : brandText.light.accent;
}

/** Chart series colors that meet 3:1 on their surfaces per theme. */
export function chartColorsHex(isDark: boolean): Record<"diary" | "task" | "note", string> {
  return isDark
    ? { diary: colors.primary, task: colors.accent, note: "#118AB2" }
    : { diary: "#D64590", task: "#0E9F85", note: "#118AB2" };
}

export const categoryBadge = {
  diary: { bg: colors.primary, text: colors.primaryForeground },
  task: { bg: colors.secondary, text: colors.secondaryForeground },
  note: { bg: colors.accent, text: colors.accentForeground },
} as const;
