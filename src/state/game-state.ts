import Rock from "../entities/rock.ts";
import Ship from "../entities/ship.ts";
import Bullet from "../entities/bullet.ts";
import {
  removeShipControlEvents,
  addShipControlEvents,
  ShipActions,
} from "../input/ship-actions.ts";
import { GamePhase } from "../types.ts";

export interface Rocks {
  [index: string]: Rock;
}

export interface Bullets {
  [index: string]: Bullet;
}

export type GameState = {
  state: GamePhase | "";
  previousState: GamePhase | "";
  score: number;
  hiScore: number;
  ship: Ship | undefined;
  rocks: Rocks;
  bullets: Bullets;
};

export let gameState: GameState = {
  state: "",
  previousState: "",
  score: 0,
  hiScore: 0,
  ship: undefined,
  rocks: {},
  bullets: {},
};

// Audit trail of all state changes for debugging and replaying
type StateChange = {
  action: string;
  payload?: unknown;
  timestamp: number;
};

const MAX_HISTORY = 10000;
const stateHistory: StateChange[] = [];

// Discriminated union ensures each action carries the correct payload type with no casts.
type GameStateAction =
  | { action: "state"; payload: GamePhase }
  | { action: "ship actions"; payload: ShipActions }
  | { action: "add ship"; payload: Ship }
  | { action: "delete ship" }
  | { action: "add rock"; payload: Rock }
  | { action: "delete rock"; payload: Rock }
  | { action: "add bullet"; payload: Bullet }
  | { action: "delete bullet"; payload: Bullet }
  | { action: "score"; payload: number }
  | { action: "update hi-score" }
  | { action: "reset game" };

// Do not destructure to ({ action, payload }) — it severs the link between them
// and breaks type narrowing, requiring manual casts in each case.
export function changeGameState(change: GameStateAction) {
  const timestamp = performance.now();

  // Log state change to history before applying it
  stateHistory.push({
    action: change.action,
    payload: (change as any).payload,
    timestamp,
  });

  // Keep history bounded to prevent memory bloat
  if (stateHistory.length > MAX_HISTORY) {
    stateHistory.shift();
  }

  switch (change.action) {
    case "state":
      gameState = {
        ...gameState,
        previousState: gameState.state,
        state: change.payload,
      };
      break;

    case "ship actions":
      gameState.ship!.setInput(change.payload);
      break;

    case "add ship":
      addShipControlEvents();
      gameState = { ...gameState, ship: change.payload };
      break;

    case "delete ship":
      gameState.ship?.explode();
      removeShipControlEvents();
      break;

    case "add rock":
      const updatedRocks = {
        ...gameState.rocks,
        [change.payload.id]: change.payload,
      };
      gameState = { ...gameState, rocks: updatedRocks };
      break;

    case "delete rock":
      const { [change.payload.id]: _, ...remainingRocks } = gameState.rocks;
      gameState = { ...gameState, rocks: remainingRocks };
      break;

    case "add bullet":
      const updatedBullets = {
        ...gameState.bullets,
        [change.payload.id]: change.payload,
      };
      gameState = { ...gameState, bullets: updatedBullets };
      break;

    case "delete bullet":
      const { [change.payload.id]: __, ...remainingBullets } =
        gameState.bullets;
      gameState = { ...gameState, bullets: remainingBullets };
      break;

    case "score":
      gameState = { ...gameState, score: gameState.score + change.payload };
      break;

    case "update hi-score":
      gameState = {
        ...gameState,
        hiScore: Math.max(gameState.hiScore, gameState.score),
      };
      break;

    case "reset game":
      clearStateHistory();
      gameState = {
        state: "",
        previousState: "",
        score: 0,
        hiScore: gameState.hiScore,
        ship: undefined,
        rocks: {},
        bullets: {},
      };
      break;
  }
}

/**
 * Debug utility: Returns the full state change history for this session.
 * Useful for debugging state transitions. Limited to last 10k entries.
 */
export function getStateHistory() {
  return stateHistory;
}

// Debug utility: clear history (useful for resetting between games)
export function clearStateHistory() {
  stateHistory.length = 0;
}
