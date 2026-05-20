# Asteroid Blaster

An Asteroids-inspired browser game built with TypeScript and Vite — architected with React and Redux patterns, with no framework involved.

**[Play the game →](https://www.supercube.co.uk/asteroids)**

---

## The Game

Pilot a ship through waves of asteroids. Shoot to destroy them — large rocks split into medium, medium into small. Survive as long as you can and beat your hi-score.

| Key     | Action |
| ------- | ------ |
| `←` `→` | Rotate |
| `↑`     | Thrust |
| `S`     | Shoot  |

Rocks spawn in increasing numbers each level. The game ends when your ship is destroyed.

---

## Why This Project

React's virtual DOM reconciler was directly inspired by game engine architecture — the idea that you separate _computing what changed_ from _applying those changes to the screen_. This project reverses that inspiration: a browser game intentionally architected with React and Redux patterns.

It began as a JavaScript port of an earlier Shockwave game. This TypeScript version is a complete rewrite — nothing remains of the original code — built as an opportunity to apply modern architecture patterns to a familiar problem.

---

## Architecture

### Unidirectional Data Flow

```
User Input
    │
    ▼
changeGameState(action)     ← Redux-like pure dispatcher
    │
    ▼
gameState                   ← single immutable state object
    │
    ├──▶ gameLoopUpdate()   ← physics, collisions, level logic
    │
    └──▶ gameLoopRender()   ← DOM diff and reconciliation
              │
              ▼
             DOM
```

State never flows backwards. The renderer reads state but never writes it.

---

### Redux-Like State Management

`changeGameState` in [`src/state/game-state.ts`](src/state/game-state.ts) is modelled directly on a Redux reducer:

- **Discriminated union actions** — each action carries a typed payload; TypeScript narrows the type in each `case` with no casts required
- **Immutable updates** — every mutation replaces `gameState` with a spread copy; objects are never mutated in place
- **Pure dispatcher** — no DOM manipulation, no timers, no audio; side effects belong in callers
- **Audit log** — every dispatched action is appended to `stateHistory[]` (capped at 10,000 entries), mirroring Redux DevTools time-travel debugging

```typescript
// Discriminated union — TypeScript narrows payload type per action
type GameStateAction =
  | { action: "state"; payload: GamePhase }
  | { action: "add rock"; payload: Rock }
  | { action: "score"; payload: number }
  | { action: "reset game" }
  // ...

// Immutable update — same pattern as a Redux reducer
case "add rock":
  gameState = { ...gameState, rocks: { ...gameState.rocks, [change.payload.id]: change.payload } };
  break;
```

---

### React-Like Virtual DOM Diffing

`gameLoopRender` in [`src/render/gameloop-render.ts`](src/render/gameloop-render.ts) implements the same reconciliation algorithm React uses:

1. **Diff** — compare the current set of entity IDs against the previous frame's set
2. **Mount** — create and insert a DOM element for each newly added entity
3. **Update** — reposition existing elements via `style.left / top / transform`
4. **Unmount** — remove DOM elements for entities that no longer exist

```typescript
// previousRender is the equivalent of React's previous virtual DOM tree
const { added: newRockIds, removed: oldRockIds } = diffSets(
  currentRockIds,
  previousRender.rockIds,
);

displayNewRocks(newRockIds, screenId, rocks); // mount
redrawRocks(rocks); // update
removeOldRocks(oldRockIds); // unmount
```

The renderer also skips unchanged values — score is only written to the DOM when it differs from the previous frame, the same principle as React bailing out of a re-render when props haven't changed.

The update and render phases are fully decoupled. Physics runs every frame; rendering can be throttled independently via `renderConfig.frameSkip` without affecting game logic — the same separation React maintains between its reconciler and the commit phase.

---

### Lifecycle Hooks

State transitions are managed through `onEnter` / `onExit` hooks in [`src/events/events.ts`](src/events/events.ts), which map directly to React's component lifecycle:

| React                                        | This project                                     |
| -------------------------------------------- | ------------------------------------------------ |
| `componentDidMount` / `useEffect` setup      | `onEnter(phase)` — mounts UI, attaches listeners |
| `componentWillUnmount` / `useEffect` cleanup | `onExit(phase)` — removes UI, detaches listeners |

Each `GamePhase` (`start` → `playing` → `paused` → `gameover`) triggers `onExit` for the previous phase and `onEnter` for the next. Screen components are created once on transition, not on every frame.

---

### Designed for Extension

The separation between state, update, and render also makes the codebase straightforward to extend. New entity types — enemies, power-ups, shields — follow the same patterns: dispatch actions through `changeGameState`, add update logic to `gameLoopUpdate`, and the renderer picks them up automatically through the existing diff logic. The architecture isn't overhead for a game of this size; it's what makes the codebase maintainable as it grows.

This repo serves as the foundation for an extended version currently in private development, which adds enemy ships with behaviour AI, upgradeable weapons, and a shield power-up system.

---

### State Reading: Two Intentional Patterns

There are two ways state is read across the codebase — this is deliberate, not an inconsistency:

- **`getState: () => GameState` callback** — used in `update/` functions. State mutates mid-frame (bullets are deleted during collision iteration), so each read must be fresh. The callback also makes these functions testable in isolation.
- **Direct `gameState` import** — used in `events.ts`. Lifecycle hooks run once per transition, not in a hot loop, so a module-level reference is correct and simpler.

---

## Tech Stack

| Tool           | Purpose                                                                      |
| -------------- | ---------------------------------------------------------------------------- |
| **TypeScript** | Strict typing throughout; discriminated unions drive state and action safety |
| **Vite**       | Dev server and production builds                                             |
| **Vitest**     | Unit tests with v8 coverage                                                  |
| **happy-dom**  | Lightweight DOM environment for tests                                        |

No runtime dependencies. No framework.

---

## Project Structure

```
src/
├── config/        # Constants — entity specs, level config, key bindings, frame rate
├── entities/      # Game object classes: Ship, Rock, Bullet, Gun, Viewport
├── events/        # State machine lifecycle hooks: onEnter, onExit, level setup
├── input/         # Keyboard listeners and ship action aggregation
├── render/        # Per-frame DOM diffing — reconciler, score, sound, FPS
├── state/         # GameState object, changeGameState dispatcher, state history
├── types.ts       # Shared types: GamePhase, GameEntity, Position, Velocity
├── ui/            # Screen components: start screen, end screen, buttons
├── update/        # Per-frame physics, collision detection, level progression
└── utils/         # Pure functions: collision maths, motion physics, random generators
```

`render/` handles game-entity rendering (rocks, ship, bullets) every frame.  
`ui/` handles screens and controls — created once on state transitions, not per frame.

---

## Getting Started

### Prerequisites

- Node.js

### Install

```bash
npm install
```

### Develop

```bash
npm run dev
```

Opens the game at `http://localhost:5173`.

### Test

```bash
npm test
```

Runs all unit tests with coverage via Vitest.

### Build

```bash
npm run build
```

Output is written to `dist/`. Configured for deployment at the `/asteroids/` base path.

### Preview production build

```bash
npm run preview
```
