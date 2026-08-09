import { Easing, type WithSpringConfig } from "react-native-reanimated";

/**
 * "Paper Playful" motion identity — Dear Diary's signature motion language.
 *
 * Personality: warm, tactile, paper-like. Springs carry a gentle 3-5%
 * overshoot (paper settle), emphasis moments bounce a little more
 * (elastic), and ambient layers breathe slowly.
 *
 * Durations: quick <150ms (micro-feedback), standard 250-350ms (cards),
 * slow 400-600ms (page/hero moments).
 */

export const springs = {
  /** Standard paper settle — gentle overshoot, used for most entrances. */
  paper: { damping: 18, stiffness: 200, mass: 0.9 } satisfies WithSpringConfig,
  /** Playful bounce for emphasis moments (checkmarks, icons, pops). */
  elastic: { damping: 11, stiffness: 160, mass: 0.8 } satisfies WithSpringConfig,
  /** Responsive press feedback — fast, minimal overshoot. */
  snappy: { damping: 24, stiffness: 340, mass: 0.9 } satisfies WithSpringConfig,
} as const;

export const durations = {
  quick: 140,
  standard: 300,
  slow: 500,
} as const;

export const easings = {
  /** Entrance: fast start, gentle landing. */
  entrance: Easing.out(Easing.cubic),
  /** Exit: gentle start, fast departure. */
  exit: Easing.in(Easing.cubic),
  /** Ambient loops: seamless sine. */
  ambient: Easing.inOut(Easing.sin),
  /** Overshoot settle for playful emphasis. */
  playful: Easing.out(Easing.back(1.6)),
} as const;

/** Rise distance for fade-up entrances (px). */
export const entranceRise = 18;

/** Micro-cascade stagger budget: 50ms per item, capped under 400ms total. */
export const staggerMs = 50;

/**
 * Build a fade-up entrance transform shared by animated styles.
 * Respects reduced-motion: position shift is dropped, fade stays.
 */
export function fadeUpStyle(
  progress: number,
  reducedMotion: boolean,
): { opacity: number; transform: { translateY: number }[] } {
  "worklet";
  return {
    opacity: progress,
    transform: reducedMotion
      ? [{ translateY: 0 }]
      : [{ translateY: (1 - progress) * entranceRise }],
  };
}
