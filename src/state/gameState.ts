import Rock from "../entities/rock.js";
import Ship from "../entities/ship.js";
import Bullet from "../entities/bullet.js";
import { removeShipControlEvents, ShipActions } from "../input/ship-actions.js";

export interface Rocks {
  [index: string]: Rock;
}

export interface Bullets {
  [index: string]: Bullet;
}

export type GameState = {
  state: string;
  previousState: string;
  score: number;
  ship: Ship | undefined;
  rocks: Rocks;
  bullets: Bullets;
};

export let gameState: GameState = {
  state: "",
  previousState: "",
  score: 0,
  ship: undefined,
  rocks: {},
  bullets: {},
};

// Discriminated union ensures each action carries the correct payload type with no casts.
type GameStateAction =
  | { action: "state"; payload: string }
  | { action: "ship actions"; payload: ShipActions }
  | { action: "add ship"; payload: Ship }
  | { action: "delete ship" }
  | { action: "add rock"; payload: Rock }
  | { action: "delete rock"; payload: Rock }
  | { action: "add bullet"; payload: Bullet }
  | { action: "delete bullet"; payload: Bullet }
  | { action: "score"; payload: number };

// Do not destructure to ({ action, payload }) — it severs the link between them
// and breaks type narrowing, requiring manual casts in each case.
export function changeGameState(change: GameStateAction) {
  switch (change.action) {
    case "state":
      gameState.previousState = gameState.state;
      gameState.state = change.payload;
      break;
    case "ship actions":
      gameState.ship!.updateActions(change.payload);
      break;
    case "add ship":
      gameState.ship = change.payload;
      break;
    case "delete ship":
      // TODO: will need to remove ship when game ends. maybe add an explosion animation before removing the ship?
      // gameState.ship = undefined;
      removeShipControlEvents();
      break;
    case "add rock":
      gameState.rocks[change.payload.id] = change.payload;
      break;
    case "delete rock":
      delete gameState.rocks[change.payload.id];
      break;
    case "add bullet":
      gameState.bullets[change.payload.id] = change.payload;
      break;
    case "delete bullet":
      delete gameState.bullets[change.payload.id];
      break;
    case "score":
      gameState.score += change.payload;
      break;
  }
}
