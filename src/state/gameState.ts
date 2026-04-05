import Rock from "../modules/rock.js";
import Ship from "../modules/ship.js";
import Bullet from "../modules/bullet.js";
import { getShipActions, removeShipControlEvents } from "../actions/actions.js";

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

type gameStateChanger = {
  action: string;
  payload?: Rock | Ship | Bullet | number | string;
};

export function changeGameState({ action, payload }: gameStateChanger) {
  switch (action) {
    case "state":
      const state = payload as string;
      gameState.previousState = gameState.state;
      gameState.state = state;
      break;
    case "ship actions":
      const shipActions = getShipActions();
      gameState.ship!.updateActions(shipActions);
      break;
    case "add ship":
      const ship = payload as Ship;
      gameState.ship = ship;
      break;
    case "delete ship":
      //const oldShip = payload as Ship;
      //gameState.ship = undefined;
      removeShipControlEvents();
      break;
    case "add rock":
      const rock = payload as Rock;
      gameState.rocks[rock.id] = rock;
      break;
    case "delete rock":
      const oldRock = payload as Rock;
      delete gameState.rocks[oldRock.id];
      break;
    case "add bullet":
      const newBullet = payload as Bullet;
      gameState.bullets[newBullet.id] = newBullet;
      break;
    case "delete bullet":
      const oldBullet = payload as Bullet;
      delete gameState.bullets[oldBullet.id];
      break;
    case "score":
      const value = payload as number;
      gameState.score += value;
      break;
  }
}
