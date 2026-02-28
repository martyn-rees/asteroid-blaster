import Rock from "./modules/rock.js";
import Ship from "./modules/ship.js";
import Gun from "./modules/gun.js";
import Bullet from "./modules/bullet.js";
import GameScreen from "./modules/gamescreen.js";
import {
  addElement,
  deleteElement,
  createElement,
  updateElement,
  renderThrust,
} from "./render.js";
import { doCirclesCollide } from "./helper.js";
import { asteroidsSVG, shipSVG } from "./graphics.js";
import {
  bulletSpecs,
  shipSpecs,
  gunSpec,
  rockType,
  RockSpec,
  keyBindings,
} from "./gamedata.js";

var animationId: number;
let isGamePlaying = false;
var ACTIONS = {
  shipThrust: false,
  shoot: false,
  shipLeft: false,
  shipRight: false,
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

// ----  Rock code ----
function initRocks(amount: number) {
  for (let i = 0; i < amount; i++) {
    const borders = ["top", "right", "bottom", "left"];
    const edge = borders[Math.floor(Math.random() * 4)];
    const startPosition = gameScreen.getRandomEdgePosition(edge);
    initRock("LARGE", startPosition);
  }
}

function getRandomNumber(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

const getAsteroidGraphic = (): string => {
  const n = Math.floor(Math.random() * asteroidsSVG.length);
  return asteroidsSVG[n];
};

function createNewAsteroid(
  size: string,
  initialPosition: { x: number; y: number },
): Rock {
  let rockProps: RockSpec = rockType[size];
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
    size,
    r,
    rotationRate,
  };
  const rock = new Rock(initialPosition, velocity, rockSpecs);
  return rock;
}

// this function does several things - creates a rock with random properties, adds it to the rock list, creates a game element for the rock and adds it to the game screen
function initRock(size: string, pos: { x: number; y: number }) {
  // create rock with random properties
  const rock: Rock = createNewAsteroid(size, pos);

  // add rock to rocklist
  rockList[rock.id] = rock;

  // create game element for rock
  let rockStyle = `height:${2 * rock.r}px; width:${2 * rock.r}px; margin-left:-${rock.r}px; margin-top:-${rock.r}px;`;
  const asteroidSVG = getAsteroidGraphic();
  const el = createElement(rock.id, "rock", rockStyle, asteroidSVG);
  // add game element to screen
  addElement(el, gameScreen.id);
}
// end of Rock code

// ---- Ship code ----
function initShip() {
  const pos = gameScreen.getScreenCentre();
  ship = new Ship(pos, "ship", shipSpecs);
  const gun = new Gun(gunSpec);
  ship.attachGun(gun);
}
// end of Ship code

function updateScore(value: number) {
  score += value;
  document.getElementById("gameScore")!.innerHTML = "SCORE: " + score;
}

// events code
function keyEvent(ev: KeyboardEvent, isKeyDown: boolean) {
  var key = ev.code;
  if (key == keyBindings.rotateLeft) {
    ACTIONS.shipLeft = isKeyDown;
  }
  if (key == keyBindings.rotateRight) {
    ACTIONS.shipRight = isKeyDown;
  }
  if (key == keyBindings.thrust) {
    ACTIONS.shipThrust = isKeyDown;
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
  window.addEventListener("resize", function (event) {
    resizeGameScreenSize(gameScreen);
  });

  window.addEventListener("keydown", function (ev) {
    keyEvent(ev, true);
  });

  window.addEventListener("keyup", function (ev) {
    keyEvent(ev, false);
  });

  // TODO: create a start button component and add this
  document
    .getElementById("startButton")!
    .addEventListener("click", function () {
      isGamePlaying = true;
      startGame();
    });

  // TODO: create a pause button component and add this
  document.getElementById("pause")!.addEventListener("click", function () {
    isGamePlaying = false;
    cancelAnimationFrame(animationId);
  });
}
// end of events code

// GAME loop code
function step(timestamp: number) {
  gameLoop();
}

// rendering
// add gamelements (id, pos, rotation) to rendering list
// map through rendering list. Add ID to previous list
// if ID is not in previous list then create element
// if ID is in previous list then update element position and rotation
// if ID is not in current list but is in previous list then remove element
function gameLoop() {
  // test controls for ship
  ship.updateShipActions(
    ACTIONS.shipThrust,
    ACTIONS.shipLeft,
    ACTIONS.shipRight,
  );

  // test if bullet fired
  // test if SHOOT KEY is pressed and ship's gun is loaded
  if (ACTIONS.shoot == true && ship.gun !== null && ship.gun.isGunLoaded()) {
    const { bulletPosition, bulletVelocity } = ship.gunFired();
    const newBullet = new Bullet(bulletPosition, bulletVelocity, bulletSpecs);
    // add bullet to list of bullets
    bulletList[newBullet.id] = newBullet;
    // TODO: replace above line with this-->  gameElements.bullets.push(newBullet);
    // create game element for bullet
    const el = createElement(newBullet.id, "bullet", null, null);
    addElement(el, gameScreen.id);
    // reload ships gun
    ship.gun.reloadGun();
    playSound("shoot");
  }
  // update ship position
  ship.update(gameScreen.width, gameScreen.height);

  // remove dead bullets
  for (var bullet in bulletList) {
    const thisBullet = bulletList[bullet];
    if (thisBullet.bulletPower == 0) {
      // remove bullet from gameScreen
      const nodeId = thisBullet.id;
      deleteElement(nodeId);
      // remove bullet from list
      delete bulletList[bullet];
    }
  }

  // test rocks to ship collision
  const shipBoundingArea = { x: ship.x, y: ship.y, r: ship.r };

  for (var rock in rockList) {
    rockList[rock].update(gameScreen.width, gameScreen.height);
    const rockBoundingArea = {
      x: rockList[rock].x,
      y: rockList[rock].y,
      r: rockList[rock].r,
    };
    if (doCirclesCollide(rockBoundingArea, shipBoundingArea)) {
      const nodeId = rock;
      deleteElement(nodeId);
      delete rockList[rock];
    }
  }

  // test rocks to bullets collision
  for (var rock in rockList) {
    let haveCollision = false;
    const rockBoundingArea = {
      x: rockList[rock].x,
      y: rockList[rock].y,
      r: rockList[rock].r,
    };
    for (var bullet in bulletList) {
      if (!haveCollision) {
        const thisBullet = bulletList[bullet];
        const bulletBoundingArea = {
          x: thisBullet.position.x,
          y: thisBullet.position.y,
          r: thisBullet.r,
        };
        if (doCirclesCollide(rockBoundingArea, bulletBoundingArea)) {
          const pos = {
            x: rockList[rock].x,
            y: rockList[rock].y,
          };
          // explode rock in to smaller rocks and remove rock and bullet
          playSound("explosion");
          if (rockList[rock].size == "LARGE") {
            initRock("MEDIUM", pos);
            initRock("MEDIUM", pos);
          } else if (rockList[rock].size == "MEDIUM") {
            initRock("SMALL", pos);
            initRock("SMALL", pos);
            initRock("SMALL", pos);
          }
          haveCollision = true;
          updateScore(rockType[rockList[rock].size].value);

          deleteElement(rockList[rock].id);
          delete rockList[rock];
          deleteElement(bulletList[bullet].id);
          delete bulletList[bullet];
        }
      }
    }
  }

  renderScreen(ship, rockList, bulletList, gameScreen);

  animationId = window.requestAnimationFrame(step);
}

// disply game elements, ship, rocks and bullets
// TODO: pass in gameElelemtns object with single items and arrays which get displayed using generic functions
// TODO - why does ony bullets use the update function
export function renderScreen(
  ship: Ship,
  rockList: Rocks,
  bulletList: Bullets,
  gameScreen: GameScreen,
) {
  ship.render(updateElement, renderThrust); // this calls render method in ship class which calls renderShip above whch calls render
  for (var rock in rockList) {
    rockList[rock].render(updateElement); // this calls render method in rock class which calls render above
  }
  for (var bullet in bulletList) {
    bulletList[bullet].update(gameScreen.width, gameScreen.height);
    bulletList[bullet].render(updateElement);
  }
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

// TODO: create a start button component and add this
function hideStartButton() {
  document.getElementById("startButton")!.style.display = "none";
}

function startGame() {
  hideStartButton();
  updateScore(0);
  initShip();
  startLevel(1);
  cancelAnimationFrame(animationId);
  animationId = requestAnimationFrame(step);
}

function startLevel(level: number) {
  const shipEl = createElement("ship", "ship", null, shipSVG());
  addElement(shipEl, gameScreen.id);
  setTimeout(() => initRocks(8), 1000);
}

function init() {
  addEvents();
  resizeGameScreenSize(gameScreen);
}

init();
// end of GAME loop code
