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
  rockList: Rocks;
  oldRocks: string[];
  newRocks: string[];
  bulletList: Bullets;
  newBullets: string[];
  oldBullets: string[];
};

let gameScreen = new GameScreen("gameScreen", 800, 400);

export let gameState: GameState = {
  state: "start",
  gameScreen: gameScreen,
  score: 0,
  ship: undefined,
  rockList: {},
  oldRocks: [],
  newRocks: [],
  bulletList: {},
  newBullets: [],
  oldBullets: [],
};

type gameStateChanger = {
  action: string;
  gameElement: Rock | Ship | Bullet | number | string;
};

export function changeGameState({ action, gameElement }: gameStateChanger) {
  switch (action) {
    case "add rock":
      const rock = gameElement as Rock;
      gameState.rockList[rock.id] = rock;
      gameState.newRocks.push(rock.id);
      break;
    case "delete rock":
      const oldRock = gameElement as Rock;
      delete gameState.rockList[oldRock.id];
      break;
    case "add bullet":
      const newBullet = gameElement as Bullet;
      gameState.bulletList[newBullet.id] = newBullet;
      gameState.newBullets.push(newBullet.id);
      break;
    case "delete bullet":
      const oldBullet = gameElement as Bullet;
      delete gameState.bulletList[oldBullet.id];
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
