# Asteroid Blaster

A browser-based Asteroids game built with TypeScript and Vite. Shoot rocks, avoid collisions, and beat your hi-score.

## History

- **2002** — Originally written in Macromedia Director and published as a Shockwave web game.
- **2017** — Adobe Director was discontinued. The game was ported to JavaScript to preserve it.
- **2026** — Complete rewrite. Everything prior to 2026 is superseded. The codebase is now TypeScript with a clean architecture, unit tests, and an immutable state management layer.

## Controls

| Key | Action |
|---|---|
| `←` `→` | Rotate |
| `↑` | Thrust |
| `S` | Shoot |

## Getting started

### Prerequisites

- Node.js

### Install dependencies

```bash
npm install
```

### Run in development

```bash
npm run dev
```

Opens the game at `http://localhost:5173`.

### Run tests

```bash
npm test
```

### Build for production

```bash
npm run build
```

Output is written to `dist/`. The build is configured for deployment at the `/asteroids/` base path.

### Preview the production build

```bash
npm run preview
```

## Project structure

```
src/
├── assets/        # Game data — entity specs, key bindings, graphics
├── entities/      # Ship, Rock, Bullet, Gun classes and factory functions
├── events/        # Screen lifecycle — onEnter, onExit, level setup
├── input/         # Keyboard input and ship action mapping
├── render/        # DOM rendering — game loop render and dom utilities
├── state/         # GameState, changeGameState, state history
├── styles/        # Component-level CSS
├── ui/            # Screen components — start screen, end screen, buttons
├── update/        # Game loop update — physics, collision, bullet lifecycle
└── utils/         # Maths, FPS tracking, rock randomiser
```

## Tech

- **TypeScript** — strict typing throughout
- **Vite** — dev server and production builds
- **Vitest** — unit tests with coverage
