import Rock from "../modules/rock.js";
import Ship from "../modules/ship.js";
import Bullet from "../modules/bullet.js";
import {
  getShipActions,
  addShipControlEvents,
  removeShipControlEvents,
} from "../actions/actions.js";

export interface Rocks {
  [index: string]: Rock;
}

export interface Bullets {
  [index: string]: Bullet;
}

export type GameState = {
  state: string;
  score: number;
  ship: Ship | undefined;
  newShips: string[];
  oldShips: string[];
  rocks: Rocks;
  oldRocks: string[];
  newRocks: string[];
  bullets: Bullets;
  newBullets: string[];
  oldBullets: string[];
  oldAndNewRocksInSameRenderLoop: string[];
  oldAndNewBulletsInSameRenderLoop: string[];
};

export let gameState: GameState = {
  state: "start",
  score: 0,
  ship: undefined,
  rocks: {},
  newShips: [],
  oldShips: [],
  oldRocks: [],
  newRocks: [],
  bullets: {},
  newBullets: [],
  oldBullets: [],
  oldAndNewRocksInSameRenderLoop: [],
  oldAndNewBulletsInSameRenderLoop: [],
};

type gameStateChanger = {
  action: string;
  gameElement?: Rock | Ship | Bullet | number | string;
};

export function changeGameState({ action, gameElement }: gameStateChanger) {
  switch (action) {
    case "ship actions":
      const shipActions = getShipActions();
      gameState.ship!.updateActions(shipActions);
      break;
    case "add ship":
      const ship = gameElement as Ship;
      gameState.ship = ship;
      gameState.newShips.push(ship.id);
      addShipControlEvents();
      break;
    case "delete ship":
      //const oldShip = gameElement as Ship;
      //gameState.oldShips.push(oldShip.id);
      //gameState.ship = undefined;
      removeShipControlEvents();
      break;
    case "add rock":
      const rock = gameElement as Rock;
      gameState.rocks[rock.id] = rock;
      gameState.newRocks.push(rock.id);
      break;
    case "delete rock":
      const oldRock = gameElement as Rock;
      // BUGFIX: if renderloop is running slower than updateLoop then there's a possibility that a rock can be created and destroyed between a render
      // element ID would be in both newRocks and oldRocks and the Rock instance[elId] would have been deleted leading to 2 bugs
      // if oldRock.id is also in newRocks then remove from newRocks and add to oldAndNewRocksInSameRenderLoop instead of oldRocks
      // the renderer will then not try to add a rock that doesn't exist or remove one that's never been on screen
      const indexInNewRocks = gameState.newRocks.indexOf(oldRock.id);
      if (indexInNewRocks >= 0) {
        gameState.oldAndNewRocksInSameRenderLoop.push(oldRock.id);
        gameState.newRocks.splice(indexInNewRocks, 1);
      } else {
        gameState.oldRocks.push(oldRock.id);
      }
      delete gameState.rocks[oldRock.id];
      break;
    case "add bullet":
      const newBullet = gameElement as Bullet;
      gameState.bullets[newBullet.id] = newBullet;
      gameState.newBullets.push(newBullet.id);
      break;
    case "delete bullet":
      const oldBullet = gameElement as Bullet;

      // BUGFIX: if renderloop is running slower than updateLoop then there's a possibility that a bullet can be created and destroyed between a render
      // this is the same bugfix as used for deleting rocks
      const indexInNewBullets = gameState.newBullets.indexOf(oldBullet.id);
      if (indexInNewBullets >= 0) {
        gameState.oldAndNewBulletsInSameRenderLoop.push(oldBullet.id);
        gameState.newBullets.splice(indexInNewBullets, 1);
      } else {
        gameState.oldBullets.push(oldBullet.id);
      }
      delete gameState.bullets[oldBullet.id];
      break;
    case "score":
      const value = gameElement as number;
      gameState.score += value;
      break;
    case "reset lists":
      gameState.newRocks = [];
      gameState.newBullets = [];
      gameState.oldBullets = [];
      gameState.oldRocks = [];
      gameState.oldShips = [];
      gameState.newShips = [];
      gameState.oldAndNewRocksInSameRenderLoop = [];
      gameState.oldAndNewBulletsInSameRenderLoop = [];
      break;
  }
}
