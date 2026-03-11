import Rock from "./modules/rock.js";
import Ship, { ShipActions } from "./modules/ship.js";
import Gun from "./modules/gun.js";
import Bullet from "./modules/bullet.js";
import GameScreen from "./modules/gamescreen.js";
import { addToScreen, removeFromScreen, createElement } from "./render.js";
import { constrainNumber, testCollision } from "./helper.js";
import { shipSVG } from "./graphics.js";
import {
  bulletSpecs,
  shipSpecs,
  gunSpec,
  keyBindings,
  getRockData,
  getRockValue,
} from "./gamedata.js";
import { createStartButton } from "./ui/startbutton.js";
import { createPauseButton } from "./ui/pauseButton.js";
import { createResumeButton } from "./ui/resumeButton.js";
import { gameLoopRender } from "./gamelooprender.js";
import { gameState, changeGameState } from "./gameState.js";

// TODO: Position and Velocity types should be shared across modules
var animationId: number;
let isGamePlaying = false;
let ACTIONS: ShipActions = {
  thrust: false,
  shoot: false,
  rotateClockwise: false,
  rotateCounterClockwise: false,
};

let gameScreen = new GameScreen("gameScreen", 800, 400);

// ----  Rock code ----

// this function does several things - creates a rock with random properties, adds it to the rock list, creates a game element for the rock and adds it to the game screen
function initRock(size: string, pos: { x: number; y: number }) {
  const { velocity, r, rotationRate } = getRockData(size);
  const rock = new Rock({
    initialPosition: pos,
    initialVelocity: velocity,
    size,
    r,
    rotationRate,
  });
  changeGameState({ action: "add rock", gameElement: rock });
}

// TODO: needs gamescreen to get random edge start position
function createRocksForNewLevel({ rockAmount }: { rockAmount: number }) {
  for (let i = 0; i < rockAmount; i++) {
    const posXY = gameScreen.getRandomEdgePosition();
    initRock("large", posXY);
  }
}

function explodeRock(rock: Rock) {
  const explodedRockLocation = rock.rockPosition;
  const rockSize = rock.size;
  // explode rock in to smaller rocks
  if (rockSize == "large") {
    initRock("medium", explodedRockLocation);
    initRock("medium", explodedRockLocation);
  } else if (rockSize == "medium") {
    initRock("small", explodedRockLocation);
    initRock("small", explodedRockLocation);
    initRock("small", explodedRockLocation);
  }
  changeGameState({ action: "delete rock", gameElement: rock });
}
// end of Rock code

// ---- Ship code ----
function initShip(pos: { x: number; y: number }): Ship {
  const ship = new Ship(pos, "ship", shipSpecs);
  const gun = new Gun(gunSpec);
  ship.attachGun(gun);
  return ship;
}
// end of Ship code

// GAME loop code
function step(timestamp: number) {
  gameLoop();
}

function gameLoopUpdate() {
  // use constrainNumber as a callback in update method of ship, rock and bullet classes instead of passing in gameScreen dimensions
  const warpX = (x: number) => constrainNumber(x, 0, gameScreen.width);
  const warpY = (y: number) => constrainNumber(y, 0, gameScreen.height);

  // update ship position and state based on ACTIONS
  gameState.ship!.update(ACTIONS, warpX, warpY);

  // update position of all bullets
  for (var bulletId in gameState.bulletList) {
    gameState.bulletList[bulletId].update(warpX, warpY);
  }
  // update position of all rocks
  for (var rock in gameState.rockList) {
    const thisRock = gameState.rockList[rock];
    thisRock.update(warpX, warpY);
  }

  // - add new bullets - if ACTION.shoot
  if (gameState.ship!.gun && gameState.ship!.gun.state === "firing") {
    // get position of gun attached to ship as the starting position of new bullet
    const { bulletPosition, bulletDxDy, bulletVelocity } =
      gameState.ship!.gun.getNewBullet();

    const bullet = new Bullet({
      initialPosition: bulletPosition,
      dxdy: bulletDxDy,
      velocity: bulletVelocity,
      bulletSpecs,
    });
    changeGameState({ action: "add bullet", gameElement: bullet });
  }

  // - remove dead bullets - if power <= 0
  // this could be moved to collision function where it loops over bullets to save looping over bullets twice but for now its kept separate for clarity
  for (var bulletId in gameState.bulletList) {
    const thisBullet = gameState.bulletList[bulletId];
    if (thisBullet.bulletPower == 0) {
      changeGameState({ action: "delete bullet", gameElement: thisBullet });
    }
  }

  // test each rock for collision with bullets and ship
  for (var rockId in gameState.rockList) {
    let hasRockCollided: boolean = false;
    const thisRock = gameState.rockList[rockId];
    // test rock against each bullet until collision is found - if collision then remove bullet and record a collision has happened and break out of bullet loop
    for (var bulletId in gameState.bulletList) {
      const thisBullet = gameState.bulletList[bulletId];
      hasRockCollided = testCollision(
        thisRock.boundary(),
        thisBullet.boundary(),
      );
      if (hasRockCollided) {
        changeGameState({ action: "delete bullet", gameElement: thisBullet });
        break;
      }
    }
    // if the rock has not collided with a bullet then check if it has collided with the ship
    if (!hasRockCollided) {
      hasRockCollided = testCollision(
        thisRock.boundary(),
        gameState.ship!.boundary(),
      );
      if (hasRockCollided) {
        // add ship collision code
        // explodeShip(); or reduceShields() - or use one of the automaticshields that gives invincibility for a few seconds
      }
    }
    // if collision with bullet or ship then remove rock, add score and add smaller rocks if needed
    if (hasRockCollided) {
      const valueOfRock = getRockValue(gameState.rockList[rockId].size);
      changeGameState({ action: "score", gameElement: valueOfRock });
      explodeRock(gameState.rockList[rockId]);
      gameState.oldRocks.push(rockId);
    }
  }

  return { gameState };
}

// rendering
// add gamelements (id, pos, rotation) to rendering list
// map through rendering list. Add ID to previous list
// if ID is not in previous list then create element
// if ID is in previous list then update element position and rotation
// if ID is not in current list but is in previous list then remove element
function gameLoop() {
  const { gameState } = gameLoopUpdate();
  // DOM rendering
  gameLoopRender(gameState, gameScreen);
  changeGameState({ action: "reset lists", gameElement: "" });
  animationId = window.requestAnimationFrame(step);
}

/* handlers */
// TODO: uses render methods
function startButtonHandler() {
  isGamePlaying = true;
  setUpGameScreen();
  removeFromScreen("startButton");
}

function pauseButtonHandler() {
  isGamePlaying = false;
  cancelAnimationFrame(animationId);
  removeFromScreen("pauseButton");
  const resumeButton = createResumeButton(resumeButtonHandler);
  addToScreen(resumeButton, gameScreen.id);
}

function resumeButtonHandler() {
  isGamePlaying = true;
  cancelAnimationFrame(animationId);
  animationId = requestAnimationFrame(step);
  removeFromScreen("resumeButton");
  const pauseButton = createPauseButton(pauseButtonHandler);
  addToScreen(pauseButton, gameScreen.id);
}
/* end of handlers */

/* set up game */
//TODO - uses render method
function startLevel(level: number) {
  const shipEl = createElement("ship", "ship", null, shipSVG());
  addToScreen(shipEl, gameScreen.id);
  setTimeout(() => createRocksForNewLevel({ rockAmount: 8 }), 1000);
}

//TODO: uses render method
// add start button, instructions, clear up old events and score
function setUpStartScreen() {
  const startButton = createStartButton(startButtonHandler);
  addToScreen(startButton, gameScreen.id);
}

// TODO: uses render method
function setUpGameScreen() {
  const pauseButton = createPauseButton(pauseButtonHandler);
  addToScreen(pauseButton, gameScreen.id);
  addEvents();
  changeGameState({ action: "score", gameElement: 0 });
  const pos = gameScreen.getScreenCentre();
  gameState.ship = initShip(pos);
  startLevel(1);
  cancelAnimationFrame(animationId);
  animationId = requestAnimationFrame(step);
}

function setUpEndScreen() {}

// TODO: uses GameScreen instance
function init() {
  window.addEventListener("resize", function (event) {
    setGameScreenSize(gameScreen);
  });
  setGameScreenSize(gameScreen);
  setUpStartScreen();
}
/* end of set up game */

init();
// end of GAME loop code

// events code
function keyEvent(ev: KeyboardEvent, isKeyDown: boolean) {
  var key = ev.code;
  if (key == keyBindings.rotateLeft) {
    ACTIONS.rotateCounterClockwise = isKeyDown;
  }
  if (key == keyBindings.rotateRight) {
    ACTIONS.rotateClockwise = isKeyDown;
  }
  if (key == keyBindings.thrust) {
    ACTIONS.thrust = isKeyDown;
  }
  if (key == keyBindings.shoot) {
    ACTIONS.shoot = isKeyDown;
  }
}

// TODO: there are now container size options instead of offsetWidth
export function setGameScreenSize(screen: GameScreen) {
  let screenNode: HTMLElement = document.getElementById(screen.id)!;
  screen.setGameScreenDimensions(
    screenNode.offsetWidth,
    screenNode.offsetHeight,
  );
}

function addEvents() {
  window.addEventListener("keydown", function (ev) {
    keyEvent(ev, true);
  });

  window.addEventListener("keyup", function (ev) {
    keyEvent(ev, false);
  });
}
// end of events code
