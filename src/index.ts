import Rock from "./modules/rock.js";
import Ship, { ShipActions } from "./modules/ship.js";
import Gun from "./modules/gun.js";
import Bullet from "./modules/bullet.js";
import GameScreen from "./modules/gamescreen.js";
import {
  addToScreen,
  removeFromScreen,
  createElement,
  updateElement,
  renderThrust,
} from "./render.js";
import { testCollision } from "./helper.js";
import { asteroidsSVG, shipSVG } from "./graphics.js";
import {
  bulletSpecs,
  shipSpecs,
  gunSpec,
  rockType,
  RockSpec,
  keyBindings,
} from "./gamedata.js";
import { createStartButton } from "./ui/startbutton.js";
import { createPauseButton } from "./ui/pauseButton.js";
import { createResumeButton } from "./ui/resumeButton.js";

// TODO: Location and Velocity types should be shared across modules
type Location = {
  x: number;
  y: number;
};

type Velocity = {
  speed: number;
  direction: number;
};

var animationId: number;
let isGamePlaying = false;
let ACTIONS: ShipActions = {
  thrust: false,
  shoot: false,
  rotateClockwise: false,
  rotateCounterClockwise: false,
};

interface Rocks {
  [index: string]: Rock;
}

interface Bullets {
  [index: string]: Bullet;
}

let gameScreen = new GameScreen("gameScreen", 800, 400);
let score = 0;
let ship: Ship;
let rockList: Rocks = {};
let bulletList: Bullets = {};

function getStartPosition(screen: GameScreen): { x: number; y: number } {
  const borders = ["top", "right", "bottom", "left"];
  const edge = borders[Math.floor(Math.random() * 4)];
  const startPosition = screen.getRandomEdgePosition(edge);
  return startPosition;
}

/* get random valus for new asteroids */
function getRandomNumber(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function getRandomAsteroidProps(rockProps: RockSpec): {
  velocity: { speed: number; direction: number };
  rockSpecs: { size: string; r: number; rotationRate: number };
} {
  let speed = getRandomNumber(rockProps.speed.min, rockProps.speed.max);
  let r = getRandomNumber(rockProps.radius.min, rockProps.radius.max);
  let direction = getRandomNumber(0, 360);
  let rotationRate = getRandomNumber(
    rockProps.rotationRate.min,
    rockProps.rotationRate.max,
  );
  rotationRate = Math.random() > 0.5 ? rotationRate : -rotationRate;
  let velocity = { speed, direction };
  const rockSpecs = {
    size: rockProps.description,
    r,
    rotationRate,
  };
  return { velocity, rockSpecs };
}
/* end of random values for new asteroids */

// ----  Rock code ----
function createNewAsteroid(
  size: string,
  initialPosition: { x: number; y: number },
): Rock {
  let rockProps: RockSpec = rockType[size];
  const { velocity, rockSpecs } = getRandomAsteroidProps(rockProps);
  const rock = new Rock(initialPosition, velocity, rockSpecs);
  return rock;
}

// this function does several things - creates a rock with random properties, adds it to the rock list, creates a game element for the rock and adds it to the game screen
function initRock(size: string, pos: { x: number; y: number }) {
  // create rock with random properties
  const rock: Rock = createNewAsteroid(size, pos);
  addRock(rock);
  //TODO: move this to render section
  // look through rockList for new rocks and add to screen
  addRockToScreen(rock);
}

// TODO: needs gamescreen to get random edge start position
function createRocksForNewLevel({ rockAmount }: { rockAmount: number }) {
  for (let i = 0; i < rockAmount; i++) {
    const initialPosition = getStartPosition(gameScreen);
    initRock("large", initialPosition);
  }
}
// end of Rock code

// ---- Ship code ----
function initShip(pos: { x: number; y: number }) {
  ship = new Ship(pos, "ship", shipSpecs);
  const gun = new Gun(gunSpec);
  ship.attachGun(gun);
}
// end of Ship code

/* Bullet code */
type GunProps = {
  position: Location;
  velocity: { speed: number; direction: number };
  rotation: number;
};
function createNewBullet(
  gun: Gun,
  gunProps: GunProps,
  bulletSpecs: any,
): Bullet {
  const gunPropsWithLocation = {
    location: gunProps.position,
    velocity: gunProps.velocity,
    rotation: gunProps.rotation,
  };
  const { bulletPosition, bulletVelocity } =
    gun.getNewBullet(gunPropsWithLocation);
  const newBullet = new Bullet(bulletPosition, bulletVelocity, bulletSpecs);
  return newBullet;
}

function addBullet(bullet: Bullet) {
  bulletList[bullet.id] = bullet;
}
function deleteBullet(bullet: string) {
  delete bulletList[bullet];
}
/* end of bullet code */

function addRock(rock: Rock) {
  rockList[rock.id] = rock;
}

function explodeRock(rock: string) {
  const pos = {
    x: rockList[rock].x,
    y: rockList[rock].y,
  };
  // explode rock in to smaller rocks and remove rock and bullet
  if (rockList[rock].size == "large") {
    initRock("medium", pos);
    initRock("medium", pos);
  } else if (rockList[rock].size == "medium") {
    initRock("small", pos);
    initRock("small", pos);
    initRock("small", pos);
  }

  delete rockList[rock];
}

function updateScore(value: number) {
  score += value;
}

// GAME loop code
function step(timestamp: number) {
  gameLoop();
}

function gameLoopUpdate() {
  let newBullet: Bullet | null = null;
  let oldBullets: string[] = [];
  let oldRocks: string[] = [];

  // update ship position
  ship.update(gameScreen.width, gameScreen.height, ACTIONS);

  // update bulllet list
  // - update positions - position of all bullets in list
  for (var bullet in bulletList) {
    bulletList[bullet].update(gameScreen.width, gameScreen.height);
  }
  // update rock list
  // - update positions - position of all rocks in list
  for (var rock in rockList) {
    rockList[rock].update(gameScreen.width, gameScreen.height);
  }

  // - add new bullets - if ACTION.shoot
  // test if SHOOT KEY is pressed and ship's gun is loaded
  if (ship.gun && ship.gun.state === "firing") {
    // get location of gun attached to ship
    const { shipLocation, shipVelocity, shipRotation } = ship.getShipState();
    const gunProps: GunProps = {
      position: { x: shipLocation.x, y: shipLocation.y },
      velocity: shipVelocity,
      rotation: shipRotation,
    };
    newBullet = createNewBullet(ship.gun, gunProps, bulletSpecs);
    addBullet(newBullet);
  }

  // - remove dead rocks -
  // - add new rocks

  // - remove dead bullets - if power <= 0
  for (var bulletId in bulletList) {
    const thisBullet = bulletList[bulletId];
    if (thisBullet.bulletPower == 0) {
      deleteBullet(bulletId);
      oldBullets.push(bulletId);
    }
  }

  // test each rock for collision
  // first test each rock against each bullet - if collision then remove bullet and rock, add score and add smaller rocks if needed
  // if no bullet collision then test rock against ship - if collision then remove rock and ship
  for (var rockId in rockList) {
    let hasRockCollided: boolean = false;
    const thisRock = rockList[rockId];
    // test rock against each bullet until collision is found - if collision then remove bullet and rock, add score and add smaller rocks if needed
    for (var bulletId in bulletList) {
      const thisBullet = bulletList[bulletId];
      hasRockCollided = testCollision(
        thisRock.boundary(),
        thisBullet.boundary(),
      );
      if (hasRockCollided) {
        deleteBullet(bulletId);
        oldBullets.push(bulletId);
        break;
      }
    }
    // if the rock has not collided with a bullet then check if it has collided with the ship
    if (!hasRockCollided) {
      hasRockCollided = testCollision(thisRock.boundary(), ship.boundary());
      if (hasRockCollided) {
        // explodeShip(); or reduceShields() - or use one of the automaticshields that gives invincibility for a few seconds
      }
    }
    // if collision with bullet or ship then remove rock, add score and add smaller rocks if needed
    if (hasRockCollided) {
      const valueOfRock = rockType[rockList[rockId].size].value;
      updateScore(valueOfRock);
      explodeRock(rockId);
      oldRocks.push(rockId);
    }
  }
  return { newBullet, oldBullets, oldRocks };
}

// rendering
// add gamelements (id, pos, rotation) to rendering list
// map through rendering list. Add ID to previous list
// if ID is not in previous list then create element
// if ID is in previous list then update element position and rotation
// if ID is not in current list but is in previous list then remove element
function gameLoop() {
  const { newBullet, oldBullets, oldRocks } = gameLoopUpdate();
  // DOM rendering
  gameLoopRender(
    ship,
    rockList,
    bulletList,
    oldBullets,
    oldRocks,
    score,
    newBullet,
    gameScreen,
  );

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
  updateScore(0);
  const pos = gameScreen.getScreenCentre();
  initShip(pos);
  startLevel(1);
  cancelAnimationFrame(animationId);
  animationId = requestAnimationFrame(step);
}

function setUpEndScreen() {}

// TODO: uses GameScreen instance
function init() {
  window.addEventListener("resize", function (event) {
    resizeGameScreenSize(gameScreen);
  });
  resizeGameScreenSize(gameScreen);
  setUpStartScreen();
}
/* end of set up game */

init();
// end of GAME loop code

/* RENDER CODEE */
// disply game elements, ship, rocks and bullets
// TODO: pass in gameElelemtns object with single items and arrays which get displayed using generic functions
// TODO - keep a copy of rockList and bullewtList from previous frame and compare to current list to decide which elements to add, update and remove
// can then remove oldBullets, oldRocks and newBullet
export function gameLoopRender(
  ship: Ship,
  rockList: Rocks,
  bulletList: Bullets,
  oldBullets: string[],
  oldRocks: string[],
  score: number,
  newBullet: Bullet | null,
  gameScreen: GameScreen,
) {
  //TODO: if addNewBullet is moved to end of this function then get an error that new bullet is not rendered on first frame. Why?
  if (newBullet !== null) {
    addNewBulletToScreen(newBullet.id);
    playSound("shoot");
  }
  ship.render(updateElement, renderThrust); // this calls render method in ship class which calls renderShip above whch calls render
  for (var rockId in rockList) {
    rockList[rockId].render(updateElement); // this calls render method in rock class which calls render above
  }
  for (var bulletId in bulletList) {
    bulletList[bulletId].render(updateElement);
  }
  // remove dead bullets
  oldBullets.forEach((bulletId) => {
    removeFromScreen(bulletId);
  });
  // remove dead rocks
  oldRocks.forEach((rockId) => {
    removeFromScreen(rockId);
    playSound("explosion");
  });
  displayScore(score);
}

function playSound(soundDescription: string) {
  let soundurl;
  if (soundDescription == "shoot") {
    soundurl = "./sounds/shoot.wav";
  } else if (soundDescription == "explosion") {
    soundurl = "./sounds/explosion.wav";
  } else {
    console.error(`sound description ${soundDescription} not recognised`);
    return;
  }
  const sound = new Audio(soundurl);
  sound.volume = 0.1;
  sound.load();
  sound.play();
}

function addNewBulletToScreen(id: string) {
  // create game element for bullet
  const el = createElement(id, "bullet", null, null);
  addToScreen(el, gameScreen.id);
}

const getAsteroidGraphic = (): string => {
  const n = Math.floor(Math.random() * asteroidsSVG.length);
  return asteroidsSVG[n];
};

function addRockToScreen(rock: Rock) {
  let rockStyle = `height:${2 * rock.r}px; width:${2 * rock.r}px; margin-left:-${rock.r}px; margin-top:-${rock.r}px;`;
  const asteroidSVG = getAsteroidGraphic();
  const el = createElement(rock.id, "rock", rockStyle, asteroidSVG);
  // add game element to screen
  addToScreen(el, gameScreen.id);
}

function displayScore(score: number) {
  document.getElementById("gameScore")!.innerHTML = "SCORE: " + score;
}
/* end of RENDER DOCE */

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
export function resizeGameScreenSize(screen: GameScreen) {
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
