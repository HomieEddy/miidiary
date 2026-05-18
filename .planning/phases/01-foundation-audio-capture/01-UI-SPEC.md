## UI-SPEC COMPLETE

# Phase 1: Foundation & Audio Capture — UI Design Contract

**Status:** approved
**Phase:** 1 — Foundation & Audio Capture
**Platform:** React Native (Expo) — native mobile, NOT web
**Design System Reference:** `.planning/UI-SPEC.md` (project-level), `theme/tailwind.config.js`, `theme/colors.ts`, `theme/typography.ts`
**Date:** 2026-05-18

---

## 1. Design System Reference

All color tokens, font families, border radii, shadow system, and icon system from the project-level UI-SPEC.md apply directly to Phase 1. This contract specifies Phase-1-only additions and overrides.

### 1.1 Color Tokens Carried Forward

| Token | Hex | Phase 1 Usage |
|-------|-----|---------------|
| `--background` | `#FDF8F0` | Home screen background |
| `--foreground` | `#2A2631` | All text: prompt, timer, status, transcription |
| `--primary` | `#FF6B9E` | Waveform gradient, equalizer bars, glow ring, active recording theme |
| `--primary-foreground` | `#FFFFFF` | Text on primary (not used in Phase 1 — the button is Rive, no text on it) |
| `--card` | `#FFFFFF` | Future entry cards (Phase 2) |
| `--border` | `#2A2631` | All borders (not heavily used in Phase 1 — recording area is borderless) |
| `--muted` | `#F0E9DF` | Processing state background area |
| `--muted-foreground` | `#8A828F` | Timer text during idle (hidden state), recording elapsed time label |
| `--destructive` | `#EF476F` | Error state icon/banner |
| `--accent` | `#06D6A0` | Success state indicator (brief transcription complete toast) |

### 1.2 Font Families Carried Forward

| Role | Font | Phase 1 Usage |
|------|------|---------------|
| Body | **Nunito** | Timer digits, processing text, transcription result, error text |
| Heading | **Fredoka** | "Tap to record a thought" prompt text |

---

## 2. Spacing Scale

All spacing follows the project 4-point grid (NativeWind default). Phase 1 uses these specific values:

| Value | Token | Usage |
|-------|-------|-------|
| 4 | `p-1` | Timer padding, error banner inner padding |
| 8 | `p-2` | Processing state container padding |
| 16 | `p-4` | Screen edge padding (via `px-6` = 24px in reference) |
| 24 | `p-6` / `gap-6` | Space between recording button and prompt text |
| 32 | `gap-8` | Space between prompt text and waveform canvas |
| 48 | `py-12` | Vertical centering padding above/below recording section |
| 64 | `pb-16` | Bottom safe area padding above nav |

**Exceptions for this phase:**
- Recording button tappable area: 144×144px — exceeds minimum 44×44pt touch target
- Waveform canvas: ~60% screen width, computed at runtime via `Dimensions.get('window').width * 0.6`

---

## 3. Typography for Phase 1

### 3.1 Font Sizes (NativeWind scale)

| Element | Font | Size (rem/pt) | Weight | Line Height |
|---------|------|---------------|--------|-------------|
| "Tap to record a thought" prompt | Fredoka | `text-xl` (20px) | Bold (700) | 1.2 |
| Timer (mm:ss) during recording | Nunito | `text-4xl` (36px) | Bold (700) | 1.2 |
| Timer label ("Recording...") | Nunito | `text-xs` (12px) | Bold (700) | 1.2 |
| "Processing transcription..." | Nunito | `text-base` (16px) | Medium (500) | 1.5 |
| Placeholder transcription result | Nunito | `text-base` (16px) | Medium (500) | 1.5 |
| Error banner text | Nunito | `text-xs` (12px) | Bold (700) | 1.4 |
| "Tap to retry" recovery text | Nunito | `text-xs` (12px) | Medium (500) | 1.4 |

### 3.2 Font Weights Used

Only **2 weights** active in Phase 1:
- **Medium (500):** processing text, placeholder result, recovery text
- **Bold (700):** prompt text, timer digits, timer label, error text

Note: Fredoka Bold = 700 weight. Nunito Bold = 700 weight. Both are pre-loaded via `expo-font`.

---

## 4. Color Allocation for Phase 1 (60/30/10)

| Proportion | Color | Hex | Elements |
|------------|-------|-----|----------|
| **60% Dominant** | Background cream | `#FDF8F0` | Full screen background, recording area backdrop |
| **30% Secondary** | Card white + Muted beige | `#FFFFFF` / `#F0E9DF` | Processing state background, transcription result area, error banner |
| **10% Accent** | Primary pink | `#FF6B9E` | **Reserved exclusively for:** waveform gradient fill, equalizer bars, glow ring, interruption markers on waveform |

**Second semantic color:** `--destructive` (`#EF476F`) — reserved exclusively for error state banner and error icon.

---

## 5. Component Hierarchy

```
HomeScreen.tsx
├── DailySparkHeader (from Phase 0 / reference UI)
├── RecordingSection
│   ├── GlowRing (Reanimated animated circle behind button)
│   │   └── Ambient blobs in idle / solid pulse in recording
│   ├── RecorderButton (Rive + Reanimated spring scale)
│   │   ├── Idle: mic icon + ambient blobs (Rive state machine)
│   │   └── Recording: 3-5 equalizer bars (Rive state machine)
│   ├── RecordingTimer (mm:ss format, visible only during recording)
│   ├── PromptText ("Tap to record a thought", visible only in idle)
│   ├── WaveformCanvas (Skia path with gradient fill)
│   ├── ProcessingState (spinner + text, visible during stub)
│   ├── TranscriptionResult (placeholder text, brief display)
│   └── ErrorBanner (destructive-colored toast, auto-dismiss)
└── BottomNav (from Phase 0)
```

---

## 6. Screen Layout

### HomeScreen Layout Stack (top → bottom)

```
┌─────────────────────────────────────┐
│  [header]                            │
│  Daily Spark card (from Phase 0)     │
│  -or- StatusBar + top padding        │
├─────────────────────────────────────┤
│                                     │
│          ▲ 48px padding             │
│                                     │
│         ┌─────────────┐             │
│         │  Glow Ring  │             │
│         │  (behind)   │             │
│         │             │             │
│         │ ┌─────────┐│             │
│         │ │  Rive   ││             │
│         │ │ 144x144 ││             │
│         │ │  Mic →  ││             │
│         │ │ Equalizer││             │
│         │ └─────────┘│             │
│         └─────────────┘             │
│                                     │
│        ◄── 24px gap ──►             │
│                                     │
│   "Tap to record a thought"         │
│    Fredoka, text-xl, Bold           │
│     (hidden during recording)       │
│                                     │
│        ◄── 32px gap ──►             │
│                                     │
│         ┌─────────────────┐         │
│         │  Timer: 02:34   │         │
│         │  Nunito text-4xl│         │
│         │  (recording only)│         │
│         └─────────────────┘         │
│                                     │
│        ◄── 16px gap ──►             │
│                                     │
│  ┌────────────────────────────────┐ │
│  │       Waveform Canvas          │ │
│  │  (60% screen width, 80px h)   │ │
│  │  Skia Path + LinearGradient    │ │
│  │  #FF6B9E → rgba(#FF6B9E, 0.3) │ │
│  └────────────────────────────────┘ │
│                                     │
│        ◄── 16px gap ──►             │
│                                     │
│   [Processing State — shown when    │
│    transcription stub is running]   │
│   ┌─────────────────────────────┐   │
│   │  ⟳ Processing transcription │   │
│   └─────────────────────────────┘   │
│                                     │
│   [Transcription Result — brief     │
│    display after stub completes]    │
│   ┌─────────────────────────────┐   │
│   │  "This is a simulated..."   │   │
│   ├── Category badge             │   │
│   │  "Tap to record another"     │   │
│   └─────────────────────────────┘   │
│                                     │
│   [Error Banner — auto-dismiss]     │
│   ┌───┬─────────────────────────┐   │
│   │ ⚠ │ Recording failed        │   │
│   │   │ Tap to try again        │   │
│   └───┴─────────────────────────┘   │
│                                     │
│          ▼ flex: 1 (grow)           │
├─────────────────────────────────────┤
│  Bottom Navigation (from Phase 0)   │
│  fixed at bottom                    │
└─────────────────────────────────────┘
```

### Positioning Rules

- **Recording button:** Centered horizontally (`items-center justify-center` in parent), with `py-12` vertical padding from header
- **Waveform:** Centered horizontally, ~60% screen width (`Dimensions.get('window').width * 0.6`), 80px height
- **Timer:** Centered horizontally, directly between prompt-text area and waveform
- **Processing state:** Below waveform, centered, with `bg-muted/50` background pill container
- **Error banner:** Below waveform (replaces processing area), `bg-destructive/10` + `border-l-4 border-destructive` pill, auto-dismiss after 3s
- **Transcription result:** Below waveform (replaces processing area), styled as a `bg-card` pill with brief shadow

---

## 7. Component Specs

### 7.1 GlowRing

| Property | Value |
|----------|-------|
| **Type** | Reanimated `Animated.View` circle behind RecorderButton |
| **Dimensions** | 180×180px (larger than button to create glow halo) |
| **Border radius** | `rounded-full` (90px) |
| **Idle state** | Not visible (opacity 0) — Rive handles idle ambient visual |
| **Recording state** | Opacity: 0.3 → 1.0 pulsing via `withRepeat(withSequence(withTiming(...)))` |
| **Recording pulse cycle** | 1.6s period (0.8s rise, 0.8s fall), `Easing.inOut(Easing.sin)`, infinite reverse |
| **Color** | `rgba(255, 107, 158, 0.25)` — subtle pink glow |
| **Transition out** | `withTiming(0, { duration: 300 })` on stop |
| **Implementation** | `Animated.View` with `useAnimatedStyle` returning `opacity` + `transform: [{ scale }]` |
| **NativeWind classes** | `absolute rounded-full bg-primary/25` (base opacity via className, animated via Reanimated) |

### 7.2 RecorderButton

| Property | Value |
|----------|-------|
| **Type** | `Pressable` wrapping `Animated.View` wrapping `Rive` component |
| **Tappable area** | 144×144px (centered) |
| **Rive canvas** | 144×144px, `resizeMode: "contain"` |
| **Spring scale (start)** | `withSpring(1.15, { mass: 0.5, stiffness: 200, damping: 12 })` → settles at 1.0 |
| **Spring scale (stop)** | Brief 1.05 pulse → settles at 1.0 |
| **Spring duration** | ~400ms to settle |
| **Haptic ordering** | Haptic fires FIRST (D-05), then spring animation starts ~10ms later |
| **Rive resource** | `"mic-to-equalizer"` (.riv file in `src/assets/`) |
| **State machine** | `"MicStateMachine"` |
| **State machine inputs** | `isRecording: boolean` — true = morph to equalizer, false = revert to mic+blobs |
| **Tap handler** | `onPress` triggers: haptic → Rive input change → Reanimated spring → recording store toggle |
| **Accessibility label** | Idle: `"Record audio"` / Recording: `"Stop recording"` — set via `accessibilityLabel` prop |
| **Accessibility hint** | `"Double tap to start recording a voice entry"` (idle) / `"Double tap to stop recording"` (recording) — set via `accessibilityHint` prop |
| **Pointer events** | `activeOpacity: 1` (no opacity change), use Reanimated scale for press feedback |
| **Busy guard** | Disabled during `isProcessing` state — no taps accepted while stub is running |
| **Implementation** | See RESEARCH.md Pattern 3 for spring code, Pattern for Rive integration |

### 7.3 WaveformCanvas

| Property | Value |
|----------|-------|
| **Type** | `@shopify/react-native-skia` `<Canvas>` with `<Path>` and `<LinearGradient>` |
| **Width** | `Dimensions.get('window').width * 0.6` (~225pt on iPhone 14, ~234pt on Pixel 7) |
| **Height** | 80px |
| **Horizontal center** | Achieved via `mx-auto` or `className="self-center"` |
| **Path style** | Smooth filled path — closed shape from left edge → amplitude curve → right edge → baseline |
| **Gradient** | Top: `#FF6B9E` (opacity 1.0) → Bottom: `#FF6B9E` (opacity 0.3) |
| **Gradient direction** | `start: vec(0, 0)`, `end: vec(0, height)` — vertical top→bottom |
| **Amplitude scale** | Values mapped to 80% of canvas height (`midY * 0.8`), centered vertically |
| **Amplitude smoothing** | Exponential moving average (alpha 0.3) applied before pushing to SharedValue |
| **Update frequency** | Per frame at 60fps target — driven by Reanimated `useFrameCallback` or `useDerivedValue` |
| **Metering source** | `recordingStore.metering` (Zustand) → Reanimated `SharedValue` |
| **Amplitude buffer** | `SharedValue<number[]>` — last ~120 samples (2s at 60fps) displayed as window |
| **Empty/zero state** | Flat line at center (midY) — no amplitude yet at recording start |
| **Interruption markers** | Vertical line at interruption x-position: `strokeWidth: 2`, color `rgba(239, 71, 111, 0.6)` |
| **Background** | Transparent — no canvas background, let the cream background show through |
| **NativeWind wrapper** | `<View className="self-center">` around the Canvas |
| **Implementation** | See RESEARCH.md Pattern 2 for full Skia code |

### 7.4 RecordingTimer

| Property | Value |
|----------|-------|
| **Type** | Regular `<Text>` component (NativeWind styled) |
| **Format** | `mm:ss` — minutes zero-padded, seconds zero-padded |
| **Visibility** | `opacity-0` when idle, `opacity-100` when recording |
| **Transition** | Fade in: `withTiming(1, { duration: 200 })`, fade out: `withTiming(0, { duration: 200 })` |
| **Font** | Nunito, `text-4xl` (36px), Bold (700) |
| **Color** | `text-foreground` (`#2A2631`) |
| **Alignment** | `text-center` |
| **Label** | Small "REC" dot + "Recording" label above the timer, `text-xs font-bold text-primary` |
| **Position** | Centered below prompt area, above waveform |
| **Source** | `recordingStore.duration` (milliseconds → mm:ss conversion in component) |
| **Update** | Updated every 100ms via `setInterval` (or via Reanimated timer worklet) |

### 7.5 ProcessingState

| Property | Value |
|----------|-------|
| **Type** | View container with ActivityIndicator + Text |
| **Container** | `<View className="bg-muted/50 rounded-2xl px-6 py-4 self-center">` |
| **Spinner** | React Native `<ActivityIndicator size="small" color={colors.primary} />` |
| **Text** | "Processing transcription..." — Nunito, `text-base`, Medium (500), `text-muted-foreground` |
| **Layout** | Horizontal row: Spinner + 12px gap + Text, centered |
| **Visibility** | Visible only during `isProcessing === true` (1-3s simulated) |
| **Entrance** | Fade in: `withTiming(1, { duration: 150 })` |
| **Exit** | Fade out + scale down: `withTiming(0, { duration: 200 })` → show TranscriptionResult |
| **Position** | Below waveform canvas, 16px gap |

### 7.6 TranscriptionResult

| Property | Value |
|----------|-------|
| **Type** | View container with placeholder text + category badge + recovery prompt |
| **Container** | `<View className="bg-card rounded-2xl border-2 border-border/30 px-5 py-4 mx-8 shadow-[2px_2px_0px_theme(colors.border)]">` |
| **Body text** | "This is a simulated transcription. Actual STT arrives in Phase 3." — Nunito, `text-base`, Medium (500), `text-foreground` |
| **Category badge** | Auto-classified as "Note" (hardcoded for Phase 1) — `bg-accent text-accent-foreground text-xs font-bold px-2 py-0.5 rounded-full` |
| **Recovery prompt** | "Tap to record another thought" — Nunito, `text-xs`, Medium (500), `text-primary`, centered below body |
| **Visibility** | Shown for 4 seconds after stub completes, then auto-hides and returns to idle |
| **Entrance** | Fade + slide up: spring with 200ms duration |
| **Exit** | Fade out: 300ms → return to idle state |
| **Position** | Below waveform canvas (replaces ProcessingState) |

### 7.7 ErrorBanner

| Property | Value |
|----------|-------|
| **Type** | View container with icon + text + recovery text |
| **Container** | `<View className="bg-destructive/10 border-l-4 border-destructive rounded-xl px-4 py-3 mx-8 flex-row items-center gap-3">` |
| **Icon** | Warning icon from Solar set — `solar:danger-triangle-bold-duotone` (or use a simple Text "⚠") |
| **Primary text** | "Recording failed" — Nunito, `text-xs`, Bold (700), `text-destructive` |
| **Recovery text** | "Tap to try again" — Nunito, `text-xs`, Medium (500), `text-destructive/80` |
| **Visibility** | Auto-dismiss after 3 seconds via `withTiming(0, { duration: 500 })` |
| **Trigger** | Recording permission denied, audio session error, recorder init failure |
| **Haptic** | `Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)` on trigger |
| **Position** | Below waveform canvas (replaces ProcessingState) |

### 7.8 PromptText

| Property | Value |
|----------|-------|
| **Type** | `<Text>` component |
| **Text** | "Tap to record a thought" |
| **Font** | Fredoka, `text-xl` (20px), Bold (700) |
| **Color** | `text-foreground/80` (`rgba(42, 38, 49, 0.8)`) |
| **Letter spacing** | `tracking-wide` |
| **Visibility** | Visible during idle, hidden during recording and processing |
| **Exit** | Fade out: `withTiming(0, { duration: 150 })` on recording start |
| **Entrance** | Fade in: `withTiming(1, { duration: 300 })` on return to idle |
| **Position** | Below recording button, 24px gap |

---

## 8. Interaction States

### State Machine

```
                      ┌─────────────────────────────────────────┐
                      │              IDLE                        │
                      │  Prompt text visible                     │
                      │  Rive: mic + ambient blobs               │
                      │  Waveform: hidden/empty                  │
                      │  Timer: hidden                           │
                      │  Glow ring: off                          │
                      └─────────────┬───────────────────────────┘
                                    │ tap
                                    ▼
                      ┌─────────────────────────────────────────┐
                      │           RECORDING                      │
                      │  Haptic: Medium impact                   │
                      │  Rive: morph to 3-5 equalizer bars       │
                      │  Reanimated: spring 1.0→1.15→settle     │
                      │  Glow ring: pulse 0.3↔1.0                │
                      │  Waveform: active, receiving metering    │
                      │  Timer: visible, counting mm:ss          │
                      │  Prompt: hidden                          │
                      └──────┬──────────────┬───────────────────┘
                             │              │
                   tap       │              │ interruption (call)
                             │              │
                             ▼              ▼
              ┌──────────────────────┐  ┌───────────────────────────┐
              │     PROCESSING       │  │        CALL_PAUSED        │
              │  Haptic: Success      │  │  Rive: hold state         │
              │  Rive: morph to idle  │  │  Timer: paused           │
              │  Spinner + text shown │  │  Label: "Call in progress"│
              │  Waveform: frozen     │  │  Waveform: dimmed         │
              │  1-3s stub           │  └─────────────┬─────────────┘
              └──────────┬───────────┘                │ call ends
                         │ stub done                  │
                         ▼                            ▼
              ┌──────────────────────┐  ┌───────────────────────────┐
              │   SHOW_TRANSCRIPT    │  │   RESUME → RECORDING       │
              │  Placeholder text    │  │  Rive: back to equalizer   │
              │  "Note" badge shown  │  │  Timer: resumes            │
              │  4s auto-dismiss     │  │  Waveform: resumes         │
              └──────────┬───────────┘  └───────────────────────────┘
                         │ auto
                         ▼
              ┌──────────────────────┐
              │       IDLE           │
              └──────────────────────┘

    Any state → ERROR (on failure)
    ┌──────────────────────────────┐
    │  Haptic: Warning              │
    │  ErrorBanner visible 3s       │
    │  Auto-return to IDLE          │
    └──────────────────────────────┘
```

### State Transitions Detail

| From | To | Trigger | Visual | Haptic | Duration |
|------|----|---------|--------|--------|----------|
| IDLE | RECORDING | Tap | Rive morphs mic→equalizer (300ms), spring scale, glow starts | Medium impact | ~400ms to settle |
| RECORDING | PROCESSING | Tap stop | Spring pulse, Rive morphs equalizer→idle (300ms), waveform fades | Success notification | ~500ms to settle |
| PROCESSING | SHOW_TRANSCRIPT | Stub completes (1-3s random) | Spinner → transcription card slides up | — | 200ms entrance |
| SHOW_TRANSCRIPT | IDLE | 4s timeout | Card fades + slides down | — | 300ms exit |
| RECORDING | CALL_PAUSED | Incoming call (AppState → inactive) | Waveform dimmed 50%, timer pauses, label shows "Call in progress" | — | Instant |
| CALL_PAUSED | RECORDING | Call ends (AppState → active) | Waveform restored, timer resumes, label hidden | — | Instant |
| Any | ERROR | Permission denied / recorder init fail | ErrorBanner slides in, 3s auto-dismiss | Warning notification | 300ms entrance, 3s visible, 500ms exit |

### State Color Map

| State | Primary Screen | Rive State | Glow Ring | Timer Color | Waveform Opacity |
|-------|---------------|------------|-----------|-------------|-----------------|
| IDLE | Background cream | Mic + ambient blobs | Off | Hidden | Hidden |
| RECORDING | Background cream | 3-5 equalizer bars | Pulsing pink | Foreground | 100% |
| PROCESSING | Background cream | Morphing to idle | Fading out | Frozen at final time | 50% → 0% |
| SHOW_TRANSCRIPT | Background cream | Idle mic | Off | Hidden | Hidden |
| CALL_PAUSED | Background cream | Frozen state | Paused at current | Dimmed 50% | Dimmed 50% |
| ERROR | Background cream | Idle (reset) | Off | Hidden | Hidden |

---

## 9. Motion Design

### 9.1 Spring Configurations

| Animation | Config | Duration |
|-----------|--------|----------|
| Button press (idle → active) | `{ mass: 0.5, stiffness: 200, damping: 12 }` | ~400ms settle |
| Button release (active → idle) | `{ mass: 0.5, stiffness: 150, damping: 15 }` | ~350ms settle |
| Transcription card entrance | `{ mass: 0.8, stiffness: 180, damping: 18 }` | ~300ms settle |
| Glow ring pulse | `withSequence(withTiming(0.3, 800ms), withTiming(1.0, 800ms))` | 1.6s cycle |

### 9.2 Timing Configurations

| Animation | Method | Duration | Easing |
|-----------|--------|----------|--------|
| Prompt text fade out | `withTiming` | 150ms | `Easing.out(Easing.ease)` |
| Prompt text fade in | `withTiming` | 300ms | `Easing.out(Easing.ease)` |
| Timer fade in | `withTiming` | 200ms | `Easing.out(Easing.ease)` |
| Timer fade out | `withTiming` | 200ms | `Easing.out(Easing.ease)` |
| Processing state entrance | `withTiming` | 150ms | `Easing.out(Easing.ease)` |
| Processing state exit | `withTiming` | 200ms | `Easing.in(Easing.ease)` |
| Error banner entrance | `withTiming` | 300ms | `Easing.out(Easing.back(1.5))` |
| Error banner exit | `withTiming` | 500ms | `Easing.in(Easing.ease)` |
| Glow ring on | `withTiming` | 200ms | `Easing.out(Easing.ease)` |
| Glow ring off | `withTiming` | 300ms | `Easing.in(Easing.ease)` |
| Waveform amplitude update | Per frame | ~16ms | — |

### 9.3 Rive Morph Sequence

| Transition | Rive State Machine | Duration | Notes |
|------------|-------------------|----------|-------|
| Idle → morphing | `isRecording: true` | 300ms | Mic shrinks, blobs flow inward |
| Morphing → active | Auto-transition | 200ms | Blobs → 3-5 bars, stabilized |
| Active → morphing | `isRecording: false` | 300ms | Bars collapse, dot expands |
| Morphing → idle | Auto-transition | 200ms | Mic returns, ambient blobs resume |

### 9.4 Haptic Map (Phase 1)

| Action | Haptic Pattern | API Call | Timing |
|--------|---------------|----------|--------|
| Start recording | Medium impact | `Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)` | Before spring animation |
| Stop recording | Success notification | `Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)` | Immediate on tap |
| Recording error | Warning notification | `Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)` | On error trigger |
| Interruption marker | Light impact | `Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)` | At interruption point |

---

## 10. Copywriting

### 10.1 All Text Strings

| Context | String | Font | Weight | Purpose |
|---------|--------|------|--------|---------|
| Prompt | "Tap to record a thought" | Fredoka | Bold (700) | Primary CTA — visible during idle |
| Timer label | "REC ● Recording" | Nunito | Bold (700) | Small label above timer during recording |
| Processing | "Processing transcription..." | Nunito | Medium (500) | Shown during 1-3s stub |
| Placeholder result | "This is a simulated transcription. Actual STT arrives in Phase 3." | Nunito | Medium (500) | Stub output text |
| Recovery prompt | "Tap to record another thought" | Nunito | Medium (500) | Below transcription result |
| Error title | "Recording failed" | Nunito | Bold (700) | Error banner primary text |
| Error subtitle | "Tap to try again" | Nunito | Medium (500) | Error banner recovery text |
| Call pause | "Call in progress — recording paused" | Nunito | Bold (700) | Shown during call interruption |
| Category badge | "Note" | Nunito | Bold (700) | Hardcoded phase 1 category |

### 10.2 No Destructive Actions

Phase 1 has no destructive actions. Audio is ephemeral — recording stop is intentional, not destructive.

---

## 11. Accessibility & Touch Targets

| Element | Min Touch Area | Accessibility Label | Notes |
|---------|---------------|-------------------|-------|
| RecorderButton | 144×144px | `"Record audio"` / `"Stop recording"` | `accessibilityHint`: `"Double tap to start recording a voice entry"` / `"Double tap to stop recording"` |
| Error banner tap target | 44×44pt min | — | Entire banner tappable for retry |
| All interactive elements | 44×44pt min | — | NativeWind ensures via `min-w-[44] min-h-[44]` where needed |

### Color Contrast

| Pair | Ratio | Passes AA? | Notes |
|------|-------|-----------|-------|
| `#2A2631` on `#FDF8F0` | ~12.5:1 | ✓ AA/AAA | Body text on background |
| `#FF6B9E` on `#FDF8F0` | ~3.0:1 | ✗ | Primary pink used decoratively only — no essential text in primary pink |
| `#FFFFFF` on `#FF6B9E` | ~3.9:1 | ✗ AA (4.5:1) | Not used for Phase 1 text |
| `#8A828F` on `#FDF8F0` | ~3.5:1 | ✓ AA large text | Timer elapsed label (text-xs, bold — qualifies as large text) |

---

## 12. Implementation Constraints

### 12.1 Must Use NativeWind Only
No `StyleSheet.create`, no inline `style={{}}` objects. All visual properties via className.

### 12.2 State Management
- `recordingStore.ts` (Zustand): `isRecording`, `duration`, `metering`, `status` (`idle | recording | processing | call-paused | error`)
- `entriesStore.ts` (Zustand): in-memory array for Phase 1
- Recording metering: uses Reanimated `SharedValue<number>` for real-time UI thread access

### 12.3 Reanimated Worklets
All animations must run on UI thread via worklets. No JS thread `.value` access in animation contexts.

### 12.4 Audio Cleanup
Raw audio file at `recorder.uri` must be deleted immediately after transcription stub completes.

### 12.5 Rive File
The `.riv` file (`mic-to-equalizer.riv`) must be created (designer) with:
- State machine: `MicStateMachine`
- Boolean input: `isRecording`
- 3 states: idle (mic + ambient blobs), morphing (transition), active (3-5 equalizer bars)
- Idle state must loop continuously when `isRecording === false`

---

## 13. Pending Approvals

The following items use **sensible defaults** not yet explicitly confirmed by the user:

| Item | Default Value | Source |
|------|--------------|--------|
| Error state copy | "Recording failed" / "Tap to try again" | Default (agent discretion) |
| Waveform canvas height | 80px | Default (agent discretion) |
| Timer display format | `mm:ss` | Default (agent discretion) |
| Waveform update frequency | 60fps (per frame) | Default (agent discretion) |
| Auto-dismiss timings | Error: 3s, Transcript: 4s | Default (agent discretion) |
| Call pause label | "Call in progress — recording paused" | Default (agent discretion) |

---

## 14. Phase 2 Compatibility Notes

The Phase 1 UI is designed to cleanly extend into Phase 2:

- **Entry feed** slots below the waveform/transcript area — no layout conflict
- **RecorderButton** state machine gets `isProcessing` input in Phase 2 (no API change)
- **WaveformCanvas** props accept `interruptionMarkers` from Phase 1, but full use comes in Phase 2
- **entriesStore** in-memory bridge enables Phase 2 Realm swap without UI changes

---

*Contract generated: 2026-05-18*
*Phase: 1-Foundation & Audio Capture*
*Status: draft — awaiting design system checker approval*
