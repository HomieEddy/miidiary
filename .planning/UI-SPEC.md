# UI/Theme/Styling Specification — Dear Diary

**Defined:** 2026-05-17
**Source:** Sleek project `qdW4O1gNnjG` — exported from `ui-export-react/`

## 1. Design Philosophy

Playful, tactile, scrapbook-casual. Every element feels physical — thick borders, paper-shadow offsets, slight rotations on cards, squidgy corners. The app should feel like a pocket journal you actually enjoy opening.

All animations run on Reanimated's native worklet thread (zero JS thread impact). Rive handles complex vector state machines. Skia powers real-time audio visualization. Haptics are mapped to every spatial transition.

---

## 2. Color System

### 2.1 Base Palette

| Token | Hex | Role |
|-------|-----|------|
| `--background` | `#FDF8F0` | Warm cream page background |
| `--foreground` | `#2A2631` | Deep charcoal text/UI |
| `--primary` | `#FF6B9E` | Vibrant pink — main CTA, active tab, key highlights |
| `--primary-foreground` | `#FFFFFF` | Text on primary |
| `--secondary` | `#FFD166` | Golden yellow — Daily Spark card, emphasis badges |
| `--secondary-foreground` | `#2A2631` | Text on secondary |
| `--accent` | `#06D6A0` | Teal — Note category, confirmations |
| `--accent-foreground` | `#FFFFFF` | Text on accent |
| `--muted` | `#F0E9DF` | Light beige — subtle backgrounds |
| `--muted-foreground` | `#8A828F` | Muted gray-purple — secondary text, timestamps |
| `--destructive` | `#EF476F` | Red — urgent/hot markers |
| `--card` | `#FFFFFF` | White card surface |
| `--card-foreground` | `#2A2631` | Text on cards |
| `--border` | `#2A2631` | Charcoal — ALL borders (thick) |
| `--ring` | `#FF6B9E` | Focus ring — input focus states |

### 2.2 Chart / Digest Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `--chart-1` | `#FF6B9E` | Digest cards, stat highlights |
| `--chart-2` | `#FFD166` | Secondary charting |
| `--chart-3` | `#06D6A0` | Success charting |
| `--chart-4` | `#118AB2` | Blue — Weekly Wrap-up digest card |
| `--chart-5` | `#F77F00` | Orange — Monthly Reflection digest card |

### 2.3 Category Badge Tokens

| Category | Background | Text | Border |
|----------|-----------|------|--------|
| Diary | `--primary` (#FF6B9E) | White | `--border` |
| Task | `--secondary` (#FFD166) | `--foreground` | `--border` |
| Note | `--accent` (#06D6A0) | White | `--border` |

### 2.4 Dark Mode

Not yet defined in Sleek export. Dark mode should invert:
- `--background`: dark warm tone (e.g. `#1A1A1A` or `#2A2631`)
- `--card`: slightly lighter dark
- `--foreground`: light
- `--border`: light/thinner in dark mode
- Squircle shape reduced (`--shape-multiplier: 1`)

---

## 3. Typography

### 3.1 Font Family

| Role | Font | Weight Range | Usage |
|------|------|-------------|-------|
| Body | **Nunito** | 400–900 | All body text, input text, secondary labels |
| Heading | **Fredoka** | 500–700 | Section headers, large titles, tab labels, prompt text |
| Serif accent | **Playfair Display** | 400–700 | Quoted content, special callouts (future) |
| Mono | **JetBrains Mono** | 400–700 | Code display, technical labels |

### 3.2 Type Scale

| Level | Font | Size | Weight | Usage |
|-------|------|------|--------|-------|
| H1 | Fredoka | `text-4xl` | Bold/Bold | Page titles ("My Diary", "To-Doodles") |
| H2 | Fredoka | `text-2xl` | SemiBold | Section headers ("Fresh Thoughts", "Today") |
| H3 | Fredoka | `text-xl` | SemiBold | Card headers, Digest titles |
| H4 | Fredoka | `text-xl` | SemiBold | "Tap to record a thought" prompt |
| Body Large | Nunito | `text-lg` | Medium | Diary entry body text |
| Body Base | Nunito | `text-base` | Bold/Bold | Entry preview, task text |
| Body Small | Nunito | `text-sm` | Bold | Search placeholder, digest labels |
| Caption | Nunito | `text-xs` | Black | Timestamps, metadata |
| Label | Nunito | `text-[10px]` | Black | Category badges, nav labels, urgency tags |

All type uses `tracking-wide` on headings, `tracking-tight` on page titles, `tracking-wider` on badge text.

---

## 4. Shape & Spacing

### 4.1 Corner Shape

- **Default shape**: `squircle` (via `corner-shape: squircle` CSS property)
- **Fallback** (browsers without squircle support): standard `border-radius` with `--radius: 1.5rem`
- **Shape multiplier**: `2.5` when squircle supported, `1` when not
- **Border radius scale** (base: `--radius: 1.5rem` = 24px):

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-xs` | 16px | Tag/chip corners |
| `--radius-sm` | 20px | Small cards |
| `--radius-md` | 22px | Default |
| `--radius-lg` | 24px | Entry cards, buttons |
| `--radius-xl` | 28px | Large cards, modal |
| `--radius-2xl` | 32px | Nav bar |
| `--radius-3xl` | 40px | Digest cards |
| `--radius-4xl` | 48px | Hero sections |

### 4.2 Shadow System

All interactive elements use a hard, physical paper-drop shadow system:

- **Default**: `shadow-[4px_4px_0px_theme(colors.border)]`
- **Small**: `shadow-[2px_2px_0px_theme(colors.border)]` — badges, small buttons
- **Active/Pressed**: `shadow-none` + `translate-y-1 translate-x-1` — simulates pressing paper flat
- **Hover**: `hover:scale-105` — record button
- **Nav**: `shadow-[4px_4px_0px_theme(colors.border)]`

No blur shadows. No elevation or z-depth. Everything is flat offset.

### 4.3 Border Thickness

- **Standard border**: `border-4` — cards, buttons, nav, container frames
- **Small border**: `border-2` — badges, compact UI elements
- **Active tab indicator**: 6px bar (`h-1.5 w-10`)

---

## 5. Component Library

### 5.1 Record Button

- Large circular shape with organic squircle proportions (`rounded-[40%_60%_70%_30%/40%_50%_60%_50%]`)
- Backdrop: ambient animated glowing blobs (primary pink + accent teal) with `blur-xl`
- Mic icon: `solar:microphone-3-bold-duotone` at `text-[5rem]` with `animate-pulse`
- States: idle (pulse), recording (Rive morph to equalizer), processing
- Active: `translate-y-2 translate-x-2` + `shadow-[0px_0px_0px]`

### 5.2 Bottom Navigation

- Fixed to bottom: `fixed bottom-6 left-6 right-6`
- Container: white card, `border-4`, `rounded-3xl`, offset shadow
- 4 tabs: Home, Diary, Tasks, Digests
- Active tab: icon + label turn `--primary`, small underline bar (`w-10 h-1.5 bg-primary rounded-full skew-x-12`)
- Inactive: `--muted-foreground` icon, `text-[10px] font-bold` label
- Icons (all Solar duotone): `home-smile`, `book-bookmark-minimalistic`, `check-square`, `box-minimalistic`

### 5.3 Entry Cards (Home)

- White card (`bg-card`), `border-4`, `rounded-2xl`, offset shadow, `p-4`
- Slight random rotation: `rotate-1`, `-rotate-1`, `rotate-[2deg]`
- Category badge pill: absolute positioned `-top-3 -right-2`, icon + label, `rounded-full`, `border-2`
- Badge colors: pink (Diary), yellow (Task), teal (Note)
- Entry preview text: `font-medium text-base` with `pr-16` (avoid badge overlap)
- Timestamp: `text-xs text-muted-foreground font-bold`

### 5.4 Diary Timeline

- Vertical connector line: `absolute left-10 top-0 bottom-0 w-1 bg-border/20 rounded-full`
- Timeline dot: `bg-primary`, `w-8 h-8`, `rounded-full`, offset shadow
- Section headers: "Today", "Yesterday" with Fredoka heading
- Diary entry cards: `rounded-[2rem]`, larger padding `p-5`, nested under timeline
- Heart button (favorite): `absolute top-4 right-4`, toggles between `text-muted` and `text-primary`
- Tag chips: `text-[10px] font-bold`, colored backgrounds, `rounded-lg`, `border`

### 5.5 Task Cards (Tasks)

- Chat-bubble style: `flex items-center gap-4`, `border-4`, `rounded-2xl`, offset shadow
- Checkbox: 32x32 `rounded-lg`, `border-4` in `--border`, white fill; checked = `bg-accent` + check icon
- Task text: `font-bold text-base leading-tight`
- Hot indicator: `solar:fire-bold-duotone` in `--destructive`
- Due indicator: pulsing red dot (`w-2 h-2 rounded-full bg-primary animate-pulse`)
- Completed tasks: `opacity-70 scale-[0.98]`, `line-through`, `bg-muted/30`, `border-border/50`

### 5.6 Search Input

- Full width, `bg-card`, `border-4`, `rounded-2xl`
- Icon prefix: `absolute left-4 top-1/2 -translate-y-1/2`
- Text: `font-bold text-sm`, `pl-12 pr-4`
- Focus: `outline-none ring-2 ring-primary`
- Shadow: offset shadow on container

### 5.7 Digest Cards

- Horizontal scrollable row: `flex gap-4 overflow-x-auto`, `snap-center`
- Card: `w-64`, rounded `rounded-[2rem]`, offset shadow
- Background colors: `#E3F4F4` (blue-tinted, weekly), `#FFE8D6` (warm peach, monthly)
- Large icon: `text-5xl`
- CTA button: full width, uses chart color as background, `rounded-2xl`, offset shadow

### 5.8 "Daily Spark" Header Card

- Yellow (`bg-secondary`), `border-4`, `rounded-3xl`, offset shadow, `p-6`
- Rotated: `-rotate-2`
- Floating character: absolute positioned `-top-10 -right-4`
- Title: "Daily Spark ✨" in Fredoka
- Prompt quote: italic, `text-sm font-medium`

---

## 6. Motion & Animation Guide

### 6.1 Haptic Map

| Gesture | Haptic Pattern | Component |
|---------|---------------|-----------|
| Tap record → stop | `expo-haptics: impact heavy` | Record button |
| Horizontal swipe category change | `expo-haptics: notification success` | Scrollable tabs |
| Pinch-to-merge completion | `expo-haptics: impact medium` | Digest merge |
| Shake-to-clear buffer | `expo-haptics: impact heavy` | Voice buffer |
| Task check toggle | `expo-haptics: impact light` | Task card |
| Tab switch | `expo-haptics: impact light` | Bottom nav |

### 6.2 Reanimated Worklet Animations

| Animation | Implementation | Element |
|-----------|---------------|---------|
| Record button press | Spring: into keyframe | Record button |
| Thought Shredder transition | Staggered layout animation | Entry cards → categories |
| Card entry appear | Fade + scale spring | Feed cards |
| Tab active indicator | Animated layout shift | Bottom nav bar |
| Skeletal shimmer | NativeWind shimmer utility | Dashboard loading |
| Pull-to-refresh | Spring-based overscroll | Lists |

### 6.3 Rive State Machines

| State Machine | States | Component |
|--------------|--------|-----------|
| Mic → Equalizer | idle → morphing → active → processing → done | Record button |
| Ambient blob orbits | slow-rotate → fast-rotate → settle | Record button glow |

---

## 7. Icon Reference

All icons from Iconify **Solar** set (bold-duotone variants):

| Icon | Usage |
|------|-------|
| `solar:microphone-3-bold-duotone` | Record button |
| `solar:home-smile-bold-duotone` | Home tab |
| `solar:book-bookmark-minimalistic-bold-duotone` | Diary tab (inactive) |
| `solar:book-bookmark-minimalistic-bold` | Diary tab (active) |
| `solar:check-square-bold-duotone` | Tasks tab (inactive) |
| `solar:check-square-bold` | Tasks tab (active) |
| `solar:box-minimalistic-bold-duotone` | Digests tab / section |
| `solar:magnifer-bold-duotone` | Search |
| `solar:filter-bold-duotone` | Filter |
| `solar:pen-new-round-bold-duotone` | New entry |
| `solar:heart-bold` | Favorite (filled on/off) |
| `solar:clock-circle-bold-duotone` | Timestamp |
| `solar:stars-minimalistic-bold-duotone` | Weekly Wrap-up |
| `solar:moon-stars-bold-duotone` | Monthly Reflection |
| `solar:fire-bold-duotone` | Urgent/hot |
| `solar:calendar-bold-duotone` | Due date |
| `solar:check-read-bold` | Completed check |
| `solar:notes-bold` | Note category |
| `solar:book-bookmark-bold` | Diary category |

Implementation in React Native: Use `react-native-svg`'s `SvgXml` component with inline SVGs fetched from Iconify API at build time. Store icons in `src/assets/icons/` as SVG string constants. Do NOT use `@expo/vector-icons` (doesn't support Solar set).

---

## 8. NativeWind v4 Configuration

```js
// tailwind.config.js / nativewind-env.d.ts
// Color tokens map directly to NativeWind utilities:
// bg-background, text-primary, border-border, etc.

// Key utilities used throughout:
bg-background   text-foreground   font-sans
bg-card         text-card-foreground   font-heading
bg-primary      text-primary-foreground
bg-secondary    text-secondary-foreground
bg-accent       text-accent-foreground
bg-muted        text-muted-foreground
bg-destructive  text-destructive

border-border   border-4    border-2
rounded-[2rem]  rounded-3xl  rounded-2xl  rounded-xl
rounded-[40%_60%_70%_30%/40%_50%_60%_50%]

shadow-[4px_4px_0px_theme(colors.border)]
active:translate-y-1 active:translate-x-1 active:shadow-none
```

---

## 9. File Structure

```
src/
  assets/
    icons/          # Solar SVG icon constants (fetched from Iconify)
    images/         # Character illustrations (from ui-export-react/images/)
    fonts/          # Nunito, Fredoka, Playfair Display, JetBrains Mono
  components/
    ui/
      RecorderButton.tsx     # Mic → Rive state machine → Skia waveform
      BottomNav.tsx          # 4-tab navigation bar
      EntryCard.tsx          # Home feed entry card
      DiaryEntryCard.tsx     # Timeline diary entry
      TaskCard.tsx           # Task checklist item
      SearchInput.tsx        # Search with icon prefix
      CategoryBadge.tsx      # Diary / Task / Note pill badge
      DigestCard.tsx        # Weekly/monthly digest card
      DailySparkHeader.tsx  # Prompt quote card
      TimelineDot.tsx       # Timeline connector + dot
      SkeletonCard.tsx      # Skeletal shimmer loading
  screens/
    HomeScreen.tsx
    DiaryScreen.tsx
    TasksScreen.tsx
    DigestsScreen.tsx
  theme/
    colors.ts         # Token constants
    typography.ts     # Font config
    spacing.ts        # Spacing scale
```

---

*Design sourced from Sleek project qdW4O1gNnjG — exported screens: Home, Diary, Tasks*
*Last updated: 2026-05-17*
