export const colors = {
  background: "#FDF8F0",
  foreground: "#2A2631",
  primary: "#FF6B9E",
  primaryForeground: "#FFFFFF",
  secondary: "#FFD166",
  secondaryForeground: "#2A2631",
  accent: "#06D6A0",
  accentForeground: "#FFFFFF",
  muted: "#F0E9DF",
  mutedForeground: "#8A828F",
  destructive: "#EF476F",
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
} as const;

export const categoryBadge = {
  diary: { bg: colors.primary, text: colors.primaryForeground },
  task: { bg: colors.secondary, text: colors.secondaryForeground },
  note: { bg: colors.accent, text: colors.accentForeground },
} as const;
