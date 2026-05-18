# Architecture: Local-First Voice Capture Diary

**Domain:** Mobile voice-capture diary app — voice → STT → NLP classification → encrypted storage
**Researched:** 2026-05-17
**Overall confidence:** HIGH

## Recommended Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                      PRESENTATION LAYER                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────────────┐  │
│  │ Record   │  │ Entry    │  │ Browse/  │  │ Settings        │  │
│  │ Screen   │  │ Review   │  │ Search   │  │ (model mgmt,    │  │
│  │          │  │ Screen   │  │ Screen   │  │  lang, privacy) │  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────────┬────────┘  │
│       │              │             │                  │           │
│  ┌────▼──────────────▼─────────────▼──────────────────▼────────┐ │
│  │                    React Hooks Layer                         │ │
│  │  useRecording() | useTranscription() | useEntries() | ...   │ │
│  └────────────────────────┬────────────────────────────────────┘ │
├───────────────────────────┼──────────────────────────────────────┤
│                SERVICE LAYER (Business Logic)                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐  ┌─────────────┐ │
│  │ Audio    │  │ STT      │  │ NLP          │  │ Entry       │ │
│  │ Capture  │─▶│ Service  │──│ Classifier   │──│ Service     │ │
│  │ Service  │  │          │  │ Service      │  │             │ │
│  └──────────┘  └──────────┘  └──────────────┘  └──────┬──────┘ │
│                                                        │        │
│  ┌─────────────────────────────────────────────────────┘        │
│  │  ┌──────────────┐  ┌──────────────┐                          │
│  │  │ Model        │  │ Audio File   │                          │
│  │  │ Manager      │  │ Manager      │                          │
│  └──┴──────┬───────┴──┴──────┬───────┘                          │
├────────────┼─────────────────┼──────────────────────────────────┤
│   PERSISTENCE LAYER          │                                  │
│  ┌──────────▼──────────┐  ┌──▼──────────────┐                  │
│  │ expo-sqlite         │  │ expo-file-system │                  │
│  │ (SQLCipher          │  │ (audio files,    │                  │
│  │  encrypted)         │  │  model binaries) │                  │
│  │                     │  │                  │                  │
│  │ Tables: entries,    │  │ Paths:           │                  │
│  │ categories, config  │  │ /audio/{id}.m4a  │                  │
│  └─────────────────────┘  │ /models/{name}/  │                  │
│                           └──────────────────┘                  │
└─────────────────────────────────────────────────────────────────┘
```

## Components & Boundaries

### 1. Audio Capture Service

| Aspect | Detail |
|--------|--------|
| **Responsibility** | Record audio via microphone, manage recording lifecycle, handle background recording |
| **Library** | `expo-audio` (v1.1.0+) — built-in Expo SDK, not Expo Go compatible for background |
| **Boundary** | Takes no input; emits `{uri: string, duration: number, waveform?: any}` on stop |
| **State** | `idle → recording → stopping → idle` |
| **Background** | Requires `enableBackgroundRecording: true` in app.json plugin + `allowsBackgroundRecording: true` at runtime via `setAudioModeAsync()` |

**Key configuration (app.json):**
```json
{
  "expo": {
    "plugins": [
      [
        "expo-audio",
        {
          "microphonePermission": "Allow $(PRODUCT_NAME) to record your voice.",
          "enableBackgroundRecording": true
        }
      ]
    ]
  }
}
```

**Runtime setup:**
```typescript
await Audio.setAudioModeAsync({
  playsInSilentMode: true,
  allowsRecording: true,
  shouldPlayInBackground: true,
  allowsBackgroundRecording: true,
});
```

**Output format:** AAC/M4A (default) — good compression-to-quality ratio for voice.

**Known constraints:**
- Android shows a persistent "Recording audio" notification (OS requirement for foreground service) — cannot be dismissed while recording
- iOS continues seamlessly when backgrounded (system status bar indicator only)
- Background recording impacts battery life — use conservative timeouts

---

### 2. STT Service (Speech-to-Text)

| Aspect | Detail |
|--------|--------|
| **Responsibility** | Transcribe audio files to text using on-device Whisper model |
| **Library** | `whisper.rn` (v0.6.0) — React Native binding for whisper.cpp |
| **Boundary** | Input: audio file URI; Output: `{text: string, segments: Segment[], language: string}` |
| **State** | `unloaded → loading → ready → transcribing → idle` |
| **Source** | [github.com/mybigday/whisper.rn](https://github.com/mybigday/whisper.rn) |

**Model selection:**

| Model | Size | Speed | Bilingual? | Recommended For |
|-------|------|-------|------------|-----------------|
| `tiny` (multilingual) | 75 MB | Fastest | ✅ EN+FR | First launch, quick capture |
| `base` (multilingual) | 142 MB | Fast | ✅ EN+FR | **Default — best balance** |
| `small` (multilingual) | 466 MB | Medium | ✅ EN+FR | Accuracy-critical transcription |

**Must use multilingual** models (`tiny`, `base`, `small`) NOT `.en` variants to support French.

**Realtime transcription** is available via `RealtimeTranscriber` with VAD (Voice Activity Detection) for live streaming, but for a "record and forget" pattern, file-based transcription after recording stop is simpler and more reliable.

**iOS Core ML acceleration:** Use Core ML encoder models for ~2x faster transcription on iOS 15+. Place `.mlmodelc` folder alongside the GGML model file.

**Model loading pattern:**
```typescript
// Download model at first launch (from HuggingFace)
// Cache in app's Documents directory
// Load once, keep context alive for app lifetime
const whisperContext = await initWhisper({
  filePath: modelPath,   // path to ggml-base.bin
  useCoreMLIos: Platform.OS === 'ios',
});
```

---

### 3. NLP Classifier Service

| Aspect | Detail |
|--------|--------|
| **Responsibility** | Classify transcribed text into Diary / Task / Reference Note |
| **Approach** | **Recommended:** Use an LLM with `classify` prompt (most flexible + bilingual) |
| **Boundary** | Input: `string` (transcribed text); Output: `{category: 'diary'|'task'|'note', confidence: number}` |

**Three viable strategies (in order of recommendation):**

**Option A — Small LLM for zero-shot classification (Recommended)**
Use a quantized 1-3B parameter LLM (SmolLM2 1.7B, Llama 3.2 1B, Gemma 3 1B) with a structured prompt:
```
Classify the following diary entry into one of: diary, task, note.
Respond with only the category word.

Entry: {transcribed text}
Category:
```
- **Library:** `react-native-executorch` (Software Mansion) — widest model support
- **Or:** `local-llm-rn` for GGUF models with GPU acceleration
- **Model:** SmolLM2 1.7B Q4_K_M (~1.0 GB) — fast, works on all devices
- **Size impact:** ~1 GB model download on first launch
- **Pro:** Bilingual by default if model supports both languages; easy to tune categories
- **Con:** Model download size, ~1-3s inference time

**Option B — OS-provided foundation model (iOS 26+ only)**
Use Apple Foundation Models / ML Kit classify API:
- **Library:** `expo-ondevice-ai` or `react-native-ai` (Apple provider)
- **API:** `classify(text, { categories: ['diary', 'task', 'note'] })`
- **Pro:** Zero download, instant, tiny bundle size
- **Con:** iOS 26+ only for Apple FM; Android requires Pixel 9+ for Gemini Nano; uneven cross-platform

**Option C — Fine-tuned BERT-style model**
Export a DistilBERT or MiniLM model fine-tuned for 3-class classification to ONNX:
- **Library:** `react-native-executorch` or ONNX Runtime
- **Model:** ~80-100 MB
- **Pro:** Smallest download, fastest inference, fully deterministic
- **Con:** Requires ML expertise to fine-tune; needs bilingual training data; harder to change categories later

**Recommendation for v1:** Start with Option A (small LLM prompt) for maximum flexibility with bilingual support. It's the fastest path to a working bilingual classifier. Profile inference time — if > 3s is unacceptable, add a fast-path fallback using keyword heuristics (words like "remember", "todo", "don't forget" → task).

---

### 4. Model Manager

| Aspect | Detail |
|--------|--------|
| **Responsibility** | Download, cache, version, and lifecycle-manage ML model binaries |
| **Libraries** | `expo-file-system` for download + caching; `expo-secure-store` for HF tokens |
| **Boundary** | Provides model file paths to STT Service and NLP Classifier |

**Download pattern (runtime, not bundled):**
- ML models are 75 MB to 1+ GB — **never bundle** in app binary
- Download on first launch with progress tracking
- Cache in `DocumentDirectory` (persists across app updates)
- Check disk availability before download
- Version models: include model hash in cache key

**Model assets needed:**

| Model | Size | Download Time (est.) | Persistence |
|-------|------|---------------------|-------------|
| Whisper `base` (multilingual) | 142 MB | ~30s (WiFi) | Until deleted |
| SmolLM2 1.7B Q4_K_M | ~1.0 GB | ~3 min (WiFi) | Until deleted |

**Startup sequence:**
1. Check if models exist on disk
2. If missing → show download screen with progress
3. If present → load into memory (Whisper context stays alive; LLM loads on-demand)
4. Cache loaded contexts for app lifetime (avoid reload penalty)

---

### 5. Entry Service (Repository Pattern)

| Aspect | Detail |
|--------|--------|
| **Responsibility** | Orchestrate the capture pipeline: audio → STT → classify → persist |
| **Pattern** | Service layer (orchestrator), not directly tied to UI |
| **Boundary** | Called by hooks/screens; calls STT, NLP, and storage |

**The pipeline (sequential, in a background queue):**
```
1. AudioCaptureService.record() → audio file saved to /audio/{uuid}.m4a
2. STTService.transcribe(audioUri) → {text: "Went for a walk...", segments: [...]}
3. NLPClassifierService.classify(text) → {category: "diary", confidence: 0.92}
4. EntryRepository.create({text, category, audioUri, confidence, duration, createdAt})
```

**Why sequential?** STT output is the input to NLP. These cannot parallelize (data dependency). However, audio capture and processing can overlap if using realtime transcription.

**Key decision — processing timing:**

| Approach | UX | Complexity | Recommendation |
|----------|-----|------------|----------------|
| **Process on stop** | User stops recording → brief spinner → entry appears | Low | **v1 default** |
| Process in background | User stops → entry appears later (notification) | Medium | v2 enhancement |
| Real-time (streaming) | Text appears as user speaks | High | Deferred (adds VAD complexity) |

For v1, **process-on-stop** is the pragmatic choice. The pipeline runs in a background queue, UI shows a progress indicator. Total processing for a 30s clip: ~1-3s transcription + ~0.5-2s classification.

---

### 6. Entry Repository (Data Access)

| Aspect | Detail |
|--------|--------|
| **Responsibility** | CRUD for diary entries in encrypted SQLite |
| **Library** | `expo-sqlite` with SQLCipher + Drizzle ORM |
| **Encryption** | SQLCipher 256-bit AES via `useSQLCipher: true` in config plugin |
| **Key management** | Store derived key in `expo-secure-store` (iOS Keychain / Android Keystore) |

**Schema:**
```sql
CREATE TABLE entries (
  id          TEXT PRIMARY KEY,           -- UUID v4
  text        TEXT NOT NULL,              -- Transcribed + edited text
  category    TEXT NOT NULL CHECK(category IN ('diary', 'task', 'note')),
  confidence  REAL,                       -- NLP classification confidence (0-1)
  audio_uri   TEXT,                       -- Path to audio file
  duration    INTEGER,                    -- Recording duration in seconds
  created_at  INTEGER NOT NULL,           -- Unix timestamp ms
  updated_at  INTEGER NOT NULL,           -- Unix timestamp ms
  is_deleted  INTEGER DEFAULT 0,          -- Soft delete
  sync_status INTEGER DEFAULT 0           -- Reserved for future sync
);

CREATE INDEX idx_entries_category ON entries(category);
CREATE INDEX idx_entries_created ON entries(created_at DESC);
CREATE INDEX idx_entries_text_fts ON entries(text); -- For FTS5 search
```

**Encryption setup:**
```typescript
// 1. Generate or retrieve encryption key
const key = await SecureStore.getItemAsync('db_key');
if (!key) {
  const newKey = generateRandomKey(); // 64-char hex string
  await SecureStore.setItemAsync('db_key', newKey);
}

// 2. Open database with encryption
const db = await SQLite.openDatabaseAsync('diary.db');
await db.execAsync(`PRAGMA key = '${key}'`);
await db.execAsync('PRAGMA cipher_page_size = 4096');
```

**Key management rules:**
- NEVER hardcode the key in source code
- Generate on first launch, store in platform secure storage
- Key rotation: not needed for v1 unless security audit requires it
- If key is lost (app reinstall), data is unrecoverable — inform user

**Drizzle ORM integration** (optional but recommended for type safety):
```typescript
import { drizzle } from 'drizzle-orm/expo-sqlite';
import * as schema from './schema';

const expoDb = openDatabaseSync('diary.db');
const db = drizzle(expoDb, { schema });

// Type-safe queries
const entries = await db
  .select()
  .from(schema.entries)
  .where(eq(schema.entries.category, 'diary'))
  .orderBy(desc(schema.entries.createdAt));
```

---

### 7. Audio File Manager

| Aspect | Detail |
|--------|--------|
| **Responsibility** | Save, retrieve, and clean up audio recording files |
| **Library** | `expo-file-system` |
| **Storage path** | `FileSystem.documentDirectory + 'audio/'` |

**File naming:** `{uuid}.m4a` — UUID prevents collisions, M4A for AAC-encoded audio.

**Cleanup policy:**
- Keep audio files linked from entries
- Orphaned files (from cancelled recordings): delete immediately
- Future: optional "delete audio after X days" setting (text is the primary record)

---

### 8. Boot / Initialization Service

| Aspect | Detail |
|--------|--------|
| **Responsibility** | App startup sequence: permissions → DB → models |
| **Pattern** | Splash screen + sequential initialization with progress |

**Startup order (blocking — app shows splash/loading):**
1. Request microphone permission
2. Open encrypted SQLite database (first-run → generate key)
3. Check ML model presence → download if missing
4. Initialize Whisper context (load model into memory)
5. Initialize NLP model (lazy: load on first classification)
6. App ready → navigate to main screen

**Why sequential?** Each step depends on the previous.
- Cannot open DB without key
- Cannot transcribe without model
- Must have permissions before recording

---

## Data Flow

### Primary Flow: Record → Process → Store

```
┌─────────┐     ┌───────────────┐     ┌────────────┐     ┌──────────────┐
│ User    │     │ Audio Capture │     │ STT        │     │ NLP          │
│ taps    │────▶│ Service       │────▶│ Service    │────▶│ Classifier   │
│ record  │     │ (expo-audio)  │     │(whisper.rn)│     │ Service      │
└─────────┘     └───────┬───────┘     └──────┬─────┘     └──────┬───────┘
                        │                     │                  │
                        ▼                     ▼                  ▼
                  ┌──────────┐         ┌──────────┐      ┌──────────────┐
                  │ /audio/  │         │  text    │      │ category +   │
                  │ {id}.m4a │         │ string   │      │ confidence   │
                  └──────────┘         └──────────┘      └──────┬───────┘
                                                                 │
                        ┌────────────────────────────────────────┘
                        ▼
                  ┌──────────────┐
                  │ Entry        │
                  │ Repository   │
                  │ (SQLCipher)  │
                  └──────┬───────┘
                         │
                         ▼
                  ┌──────────────┐
                  │ SQLite DB    │
                  │ (encrypted)  │
                  └──────────────┘
```

### Secondary Flow: Browse / Search / Edit

```
┌──────────┐     ┌──────────────┐     ┌──────────┐     ┌──────────┐
│ Screen   │────▶│ Entry        │────▶│ SQLite   │     │ Updated  │
│ (UI)     │     │ Repository   │     │ (read)   │────▶│ State →  │
│          │◀────│ (hooks)      │◀────│          │     │ Re-render│
└──────────┘     └──────────────┘     └──────────┘     └──────────┘
```

### Error Flow: Failed Processing

```
Audio Capture succeeds, STT fails:
  1. Save error entry { text: null, category: 'unknown', audioUri: valid }
  2. User can replay audio and manually type text
  3. Background retry on next app launch

NLP Classification fails:
  1. Default to 'note' category (safe default)
  2. User can reclassify manually
  3. Retry classification in background
```

---

## Component Diagram (Directory Structure)

```
src/
├── app/                        # Expo Router (file-based)
│   ├── _layout.tsx             # Root: providers, init
│   ├── index.tsx               # Main record screen
│   ├── review/
│   │   └── [id].tsx            # Entry review/edit screen
│   ├── browse/
│   │   └── index.tsx           # Browse/search screen
│   └── settings/
│       └── index.tsx           # Settings (model mgmt, language)
│
├── services/                   # Business logic (no UI deps)
│   ├── audio/
│   │   └── AudioCaptureService.ts    # expo-audio wrapper
│   ├── stt/
│   │   └── STTService.ts            # whisper.rn wrapper
│   ├── nlp/
│   │   └── NLPClassifierService.ts  # Classification logic
│   ├── model/
│   │   └── ModelManager.ts          # Download + lifecycle
│   ├── entry/
│   │   └── EntryService.ts          # Pipeline orchestrator
│   └── init/
│       └── AppInitializer.ts        # Boot sequence
│
├── database/                   # Data layer
│   ├── schema.ts               # Drizzle schema + types
│   ├── migrations/             # Generated migrations
│   ├── repository/
│   │   └── EntryRepository.ts  # CRUD operations
│   └── encryption.ts           # Key generation + management
│
├── hooks/                      # React hooks (bridge UI ↔ services)
│   ├── useRecording.ts         # Recording state + controls
│   ├── useTranscription.ts     # STT progress + result
│   ├── useEntries.ts           # Entry list + CRUD
│   ├── useEntry.ts             # Single entry
│   └── useAppInit.ts           # Boot progress + state
│
├── components/                 # Reusable UI
│   ├── RecordButton.tsx        # Main capture button
│   ├── RecordingProgress.tsx   # Waveform + duration
│   ├── CategoryBadge.tsx       # Diary/Task/Note pill
│   ├── EntryCard.tsx           # List item
│   └── InitProgress.tsx        # Startup loading screen
│
├── utils/
│   ├── timing.ts               # Debounce, throttle, delays
│   └── audio.ts                # Audio format helpers
│
└── types/
    ├── entry.ts                # Entry, Category, Segment
    ├── recording.ts            # RecordingState
    └── ml.ts                   # ModelState, ClassificationResult
```

---

## Patterns to Follow

### Pattern 1: Service as Singleton with Event Emitter
Audio Capture, STT, and NLP services should be singletons initialized at boot. They communicate via events/callbacks, not direct coupling.

```typescript
class AudioCaptureService {
  private static instance: AudioCaptureService;
  private recorder: AudioRecorder | null = null;

  static getInstance(): AudioCaptureService {
    if (!AudioCaptureService.instance) {
      AudioCaptureService.instance = new AudioCaptureService();
    }
    return AudioCaptureService.instance;
  }

  async startRecording(): Promise<void> { /* ... */ }
  async stopRecording(): Promise<RecordingResult> { /* ... */ }
}
```

### Pattern 2: Repository Pattern for Data Access
All database operations go through a repository, never direct SQL in components.

```typescript
class EntryRepository {
  async create(data: CreateEntryInput): Promise<Entry> { /* ... */ }
  async findById(id: string): Promise<Entry | null> { /* ... */ }
  async findByCategory(category: Category, limit?: number): Promise<Entry[]> { /* ... */ }
  async update(id: string, data: UpdateEntryInput): Promise<Entry> { /* ... */ }
  async softDelete(id: string): Promise<void> { /* ... */ }
  async search(query: string): Promise<Entry[]> { /* FTS5 search */ }
}
```

### Pattern 3: Pipeline Orchestration with Error Isolation
The capture → STT → NLP pipeline should isolate failures so one stage failing doesn't lose data already captured.

```typescript
class EntryService {
  async processRecording(audioUri: string): Promise<EntryResult> {
    // Stage 1: Transcribe (can fail independently)
    let text: string | null = null;
    try {
      const result = await STTService.getInstance().transcribe(audioUri);
      text = result.text;
    } catch (error) {
      // Audio saved, transcription failed — user can type manually
      Logger.error('STT failed', error);
    }

    // Stage 2: Classify (only if we have text)
    let category: Category = 'note'; // safe default
    let confidence: number = 0;
    if (text) {
      try {
        const result = await NLPClassifierService.getInstance().classify(text);
        category = result.category;
        confidence = result.confidence;
      } catch (error) {
        Logger.error('Classification failed', error);
      }
    }

    // Stage 3: Persist (always succeeds if DB is available)
    return EntryRepository.getInstance().create({
      text,
      category,
      confidence,
      audioUri,
      // ...
    });
  }
}
```

### Pattern 4: Model Weak Reference Cache
Keep loaded ML models referenced for app lifetime. Never load/unload repeatedly — that's the #1 performance killer.

```typescript
class ModelManager {
  private whisperContext: WhisperContext | null = null;
  private llmModel: LlmModel | null = null;

  async getWhisperContext(): Promise<WhisperContext> {
    if (!this.whisperContext) {
      this.whisperContext = await initWhisper({ filePath: this.getModelPath('whisper') });
    }
    return this.whisperContext;
  }
}
```

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: Bundle ML Models in the App Binary
**Why bad:** Whisper `base` is 142 MB, a small LLM is 1+ GB. Apple App Store has a 4 GB download limit (cellular), and Play Store has similar restrictions. Large binaries increase install failure rates.

**Instead:** Download models on first launch from HuggingFace with progress indicators. Cache permanently.

### Anti-Pattern 2: Cloud API Fallback for STT or NLP
**Why bad:** PROJECT.md explicitly requires zero cloud dependency. Even a "fallback to cloud when offline" pattern violates privacy constraints. On-device processing is a feature worth building correctly.

**Instead:** Accept that on-device models have lower accuracy than cloud. Design UX around it — allow manual correction. Prioritize model quality (use `base` over `tiny` for STT, use a capable small LLM for classification).

### Anti-Pattern 3: Real-Time Streaming for v1
**Why bad:** Realtime transcription with VAD adds enormous complexity: audio stream management, buffer handling, partial result UI, VAD tuning, memory management for long sessions. The "record and forget" pattern does not need it.

**Instead:** Record entire utterance → process when user stops. Simple, robust, and the expected UX for a voice diary app.

### Anti-Pattern 4: Direct Database Access from Components
**Why bad:** Coupling UI to SQL makes refactoring impossible, breaks when you need to add logic (encryption, migrations, validation), and prevents testing.

**Instead:** Always go through Repository + Service layers. Components call hooks → hooks call services → services call repositories.

### Anti-Pattern 5: Loading Models on Every Use
**Why bad:** Loading a Whisper model takes 1-5 seconds. Loading an LLM takes 3-15 seconds. Doing this per-recording would make the app unusable.

**Instead:** Load models once at boot (or lazily before first use), keep them in memory for the app's lifetime. Profile memory impact — Whisper `base` ~400 MB RAM, SmolLM2 1.7B ~700 MB RAM — these are significant but manageable on modern devices.

---

## Scalability Considerations

| Concern | At Boot | Per Recording | At 1000 Entries |
|---------|---------|---------------|-----------------|
| **ML Model Loading** | 3-15s (both models) | 0s (already loaded) | 0s |
| **STT (30s clip)** | — | ~1-3s (base model) | — |
| **NLP Classification** | — | ~0.5-2s (1.7B LLM) | — |
| **DB Query (all entries)** | — | — | < 50ms (indexed) |
| **FTS5 Search** | — | — | < 100ms |
| **Disk Usage (entries)** | — | ~150 KB per entry (audio 144k + text 1k) | ~150 MB |
| **RAM (models loaded)** | ~1.1 GB | ~1.1 GB | ~1.1 GB |

**RAM is the binding constraint.** On a 4 GB device, the OS may terminate the app if RAM pressure is high. Mitigations:
- Load NLP model lazily (only when classification is needed, not at boot)
- Unload Whisper model after transcription if memory pressure detected
- Consider using tiny STT model on low-RAM devices
- Test on iPhone 11 (4 GB) and Pixel 5 (6 GB) as baseline targets

---

## Build Order (Dependency-Aware Phases)

| Phase | Components | Depends On | Rationale |
|-------|-----------|------------|-----------|
| 1 | Project scaffolding, Expo Router, basic navigation | Nothing | Foundation first |
| 2 | Audio Capture Service + Record screen | Phase 1 | Core loop — record audio |
| 3 | Audio review/playback + audio file management | Phase 2 | User must hear what they recorded |
| 4 | Encrypted SQLite setup + Entry Repository | Phase 1 | Storage needed before we can save anything |
| 5 | STT Service (whisper.rn) — file-based transcription | Phase 2 | Transcribe audio to text |
| 6 | NLP Classifier Service | Phase 5 | Classify transcribed text |
| 7 | Entry Service (pipeline orchestrator) | Phase 3, 4, 5, 6 | Wire recording→STT→NLP→storage |
| 8 | Browse/search screen with FTS5 | Phase 4, 7 | Browse saved entries |
| 9 | Entry review/edit screen | Phase 7 | Edit transcribed text, recategorize |
| 10 | Settings screen (model mgmt, language toggle) | Phase 5, 6 | Manage models, preferences |
| 11 | Model Manager + first-launch download screen | Phase 5, 6, 10 | Production model lifecycle |
| 12 | Background recording + persistent notification | Phase 2 | Background recording support |
| 13 | Motion animations, haptic feedback, polish | Phase 7 | Delight layer |

**Key dependency insight:** You can build and test audio recording (Phase 2) and database (Phase 4) independently before any ML is integrated. STT (Phase 5) and NLP (Phase 6) can also be developed in parallel since they're separate model runtimes.

---

## Sources

- **Expo Audio docs** — `expo-audio` background recording support, config plugins ([docs.expo.dev](https://docs.expo.dev/versions/unversioned/sdk/audio)) — HIGH confidence
- **Expo SQLite with SQLCipher** — encryption support via config plugin ([docs.expo.dev](https://docs.expo.dev/versions/latest/sdk/sqlite)) — HIGH confidence
- **Expo local-first guide** — architecture patterns for local-first apps ([docs.expo.dev/guides/local-first/](https://docs.expo.dev/guides/local-first/)) — HIGH confidence
- **whisper.rn** — React Native binding for whisper.cpp, real-time transcription, Core ML support ([github.com/mybigday/whisper.rn](https://github.com/mybigday/whisper.rn)) — HIGH confidence
- **react-native-executorch** — on-device LLM inference via ExecuTorch, hooks-based API ([expo.dev/blog](https://expo.dev/blog/how-to-run-ai-models-with-react-native-executorch)) — HIGH confidence
- **local-llm-rn** — GPU-accelerated LLM inference for RN, device-aware model selection ([github.com/hilum-labs/local-llm-rn](https://github.com/hilum-labs/local-llm-rn)) — MEDIUM confidence (newer library)
- **react-native-ai** — Callstack's on-device AI SDK with Vercel AI SDK compatibility ([github.com/callstackincubator/ai](https://github.com/szymonrybczak/react-native-ai)) — HIGH confidence
- **Variant Systems blog** — Production background audio recording with expo-audio ([variantsystems.io](https://variantsystems.io/blog/react-native-audio-recording-ai-pipeline)) — MEDIUM confidence (blog)
- **OP-SQLite docs** — SQLCipher integration, compilation flags ([op-engineering.github.io](https://op-engineering.github.io/op-sqlite/docs/installation/)) — MEDIUM confidence
