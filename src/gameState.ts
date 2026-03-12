import Rock from "./modules/rock.js";
import Ship from "./modules/ship.js";
import Bullet from "./modules/bullet.js";
import GameScreen from "./modules/gamescreen.js";

interface Rocks {
  [index: string]: Rock;
}

interface Bullets {
  [index: string]: Bullet;
}
export type GameState = {
  state: string;
  gameScreen: GameScreen;
  score: number;
  ship: Ship | undefined;
  rocks: Rocks;
  oldRocks: string[];
  newRocks: string[];
  bullets: Bullets;
  newBullets: string[];
  oldBullets: string[];
};

let gameScreen = new GameScreen("gameScreen", 800, 400);

export let gameState: GameState = {
  state: "start",
  gameScreen: gameScreen,
  score: 0,
  ship: undefined,
  rocks: {},
  oldRocks: [],
  newRocks: [],
  bullets: {},
  newBullets: [],
  oldBullets: [],
};

type gameStateChanger = {
  action: string;
  gameElement: Rock | Ship | Bullet | number | string;
};

export function changeGameState({ action, gameElement }: gameStateChanger) {
  switch (action) {
    case "add ship":
      const ship = gameElement as Ship;
      gameState.ship = ship;
      break;
    case "add rock":
      const rock = gameElement as Rock;
      gameState.rocks[rock.id] = rock;
      gameState.newRocks.push(rock.id);
      break;
    case "delete rock":
      const oldRock = gameElement as Rock;
      delete gameState.rocks[oldRock.id];
      break;
    case "add bullet":
      const newBullet = gameElement as Bullet;
      gameState.bullets[newBullet.id] = newBullet;
      gameState.newBullets.push(newBullet.id);
      break;
    case "delete bullet":
      const oldBullet = gameElement as Bullet;
      delete gameState.bullets[oldBullet.id];
      gameState.oldBullets.push(oldBullet.id);
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
      break;
  }
}
