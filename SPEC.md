# AI Tamagotchi — Build Spec (4-day MVP)

## Goal

An offline-first, on-device AI virtual pet built in React Native. A pixel-art
creature whose stats change over time; it animates by mood and (from day 3) talks
with a generated personality using a small language model running fully on-device.
No server, no network required at runtime.

Portfolio intent: demonstrate **on-device LLM inside a React Native app**. RN is the
point — do not move logic into a game engine.

## Tech stack (pinned)

- React Native + **Expo SDK 54+**, New Architecture, Hermes, TypeScript
- **Custom dev-build / dev-client required** — Expo Go will NOT work (native modules)
- State: **Zustand**
- Persistence: **expo-sqlite**
- Rendering/animation: **react-native-skia** (sprite sheet), **react-native-reanimated**, **react-native-gesture-handler**
- Notifications: **expo-notifications** (local only, offline)
- Tests: **Jest** (`jest-expo`)
- On-device AI (day 3+): **react-native-executorch** — `useLLM` with a small SLM
  (Qwen 3 0.6–1.5B or Llama 3.2 1B). This single library is the native runtime for
  ALL on-device models (LLM, and later CLIP/Whisper). Do not add a second LLM library.

## Architecture principles (follow strictly)

1. **Deterministic core, AI wrapper.** All game logic (stats, time, mood, actions)
   lives in a pure, framework-agnostic `/core` module with zero React/Native imports.
   The app must be fully functional WITHOUT any AI. The SLM is a layer on top that
   only voices/animates; if the model fails to load, the pet is still alive, just quieter.
2. **Mood is derived, never stored.** Compute mood from stats; do not persist a `mood` field.
3. **Time is the heartbeat.** Stats decay while the app is closed. Never run decay only
   on an in-app timer. On app start and on `AppState` → `active`, compute elapsed time
   since `lastSeenAt` and apply decay in one shot. Guard against clock tampering:
   use `Math.max(0, now - lastSeenAt)`.
4. **Personality is data, generated once.** At "birth", call the SLM once to produce a
   personality card, store it in SQLite, and reuse it forever. Do NOT regenerate
   personality per reply (that causes drift + latency).
5. **Facts via tool use.** Time, days-away, and stats are computed by code and handed to
   the model as ready values. The model phrases them; it never invents numbers.
6. **Stream to mask latency.** On-device generation takes ~5–10s. Show deterministic
   data (stats) instantly + a "thinking" animation; stream reply tokens as they arrive.

## Core contract (implement in /core, pure + unit-tested)

```ts
type Mood = 'happy' | 'neutral' | 'sad' | 'sleepy' | 'hungry';

type PetState = {
  hunger: number;     // 0..100, higher = hungrier
  joy: number;        // 0..100
  energy: number;     // 0..100
  lastSeenAt: number; // epoch ms
  bornAt: number;     // epoch ms
};

clamp(n: number): number;                       // -> 0..100
applyElapsed(s: PetState, now: number): PetState; // time-based decay, clock-safe
deriveMood(s: PetState): Mood;
feed(s: PetState): PetState;
play(s: PetState): PetState;
sleep(s: PetState): PetState;
```

Decay (starting point, tune later): hunger +4/h, energy −3/h, joy −2/h.
Mood priority: energy<20 → sleepy; hunger>75 → hungry; joy>70 → happy; joy<30 → sad; else neutral.

## Visual layer

- Sprite sheet PNG (transparent), one mood = one frame strip. Map `deriveMood(state)`
  → clip → Skia frame player (`drawImageRect`, frame loop on a clock).
- Pixel art must use **nearest-neighbor** upscale (`FilterMode.Nearest`) — no smoothing.
- If real art (PixelLab states: happy/sad/sleepy/hungry/idle) isn't ready, use colored
  placeholder shapes per mood. The `mood → animation` pipeline matters more than the art.

## Navigation & screens

Bottom tab bar with three tabs:

- **Home** — collection / shelf of pets. MVP: shows the single pet only (no creation/switching).
- **Habitat** — the active pet's main screen (the core screen: pet slot, stats, actions, speech). Default tab.
- **Settings** — notifications toggle, privacy ("runs on your device"), reset pet, about/AI info.

The **personality card** opens from the top bar on the Habitat screen (the `card >` affordance next
to the pet name) — it is NOT a tab. The **camera** is a small corner icon on Habitat (future phase),
not a tab and not a primary action.

## SCOPE GUARDRAILS — do NOT build in these 4 days

- Single pet only. Multi-pet collection (creating/switching pets) is post-MVP — the Home tab
  shows the one pet for now. Don't build pet creation/switching, but don't hardcode assumptions
  that would block adding it later (e.g. key the pet by id rather than assuming a lone global).
- No camera / vision / CLIP. No web target. No RAG memory. No daily reflection.
- No personality evolution / mood drift / unlockable traits. (Birth personality only.)
- No voice (Whisper/TTS). No cloud/Claude API fallback. No Supabase.
- Do not build a "real game" engine loop. This is a companion app with an animated sprite.
- Do not polish art at the expense of mechanics. Build incrementally; stop at day boundaries.

---

## Day 1 — Core logic (no device, no art)

- Scaffold Expo (TS) + ESLint/Prettier + Jest + Zustand; run on simulator.
- Implement `/core`: types, decay constants, `clamp`, `applyElapsed`, `deriveMood`, `feed`/`play`/`sleep` as pure functions.
- Unit tests for core: decay over N hours, mood thresholds, clock-tamper guard.
- SQLite (`expo-sqlite`): `pet` table (single row), get/save repo. Bootstrap: read → `applyElapsed` → save → Zustand.
- `AppState` listener: recompute on resume to `active`.
- Throwaway debug UI: stats + mood as text + 3 action buttons.
- **Done:** stats reflect time away; actions persist; survives restart and time changes.

## Day 2 — Visual layer (Phase 1 complete)

- Add `react-native-skia`; create the **first dev-build** (prebuild/dev-client) — schedule this first, it's the day's main time risk. Render a static sprite (placeholder ok).
- Frame player: load sheet, `drawImageRect`, frame loop, nearest-neighbor upscale.
- `mood → clip` mapping; wire actions to animation (feed → stat drop → mood → frames change live).
- Minimal layout: pet centered, stat bars, action buttons. Add the bottom tab shell (Home / Habitat / Settings) — Habitat is the real screen; Home shows the single pet; Settings can be a stub.
- Stretch: `expo-notifications` local "hungry" reminder — schedule time computed from core decay; reschedule on `AppState`; request permissions.
- **Done:** animated pet reacting to stats/actions, survives restart, sends offline reminder. This is a complete, demoable project on its own.

## Day 3 — AI backbone (highest-risk day)

- Goal is deliberately minimal: get ONE token out of an on-device model.
- Add `react-native-executorch`; new dev-build with native module (may take half a day — do it first); download SLM.
- `useLLM` with a hardcoded prompt → text on screen. Prove the pipeline runs.
- Measure on real device: latency + whether the model fits in memory → decide which model to keep.
- Wire up token streaming (needed day 4 to mask latency).
- **Done:** model runs locally and streams text. Ugly, but it's the technical spine.

## Day 4 — Bring it to life (AI in the loop)

- Birth personality (structured output): one SLM call → JSON
  `{ temperament, speech_style, likes_food[], dislikes[], quirk }` → store in SQLite.
  Gotcha: small models produce malformed JSON — keep the schema tiny, parse with validation,
  and **fall back to 2–3 hardcoded templates** if parsing fails. Do not let this block the day.
- Tool use for facts: time, days-away, stats computed by code, passed to the model.
- Runtime reaction: context (stats + time-away + personality card) → in-character reply, streamed to UI.
- Close the loop: reply on start and on actions; while "thinking", play animation and show
  deterministic stats instantly, text catches up via streaming.
- Record an airplane-mode demo clip for portfolio.
- **Done:** pet with a generated character reacts live, facts are honest, fully offline.

## Suggested file layout

```
/core            pure logic (no RN imports) + tests
/db              sqlite schema + repo
/state           zustand store
/render          skia sprite player + mood→clip map
/ai              useLLM wrapper, personality, tool-use facts (day 3+)
/screens         home (pet shelf), habitat (main), settings, debug
/nav             bottom tab bar (Home / Habitat / Settings)
```

## Notes for the agent

- Build day by day; do not jump ahead into guardrail items.
- Keep `/core` pure and fully covered by tests — it is the foundation everything else trusts.
- Two hard time-risks: first Skia dev-build (day 2) and executorch + model (day 3). Surface
  problems early in the day, not at the end.
- After day 2 the project is already shippable; AI days must not break the day-2 result.
