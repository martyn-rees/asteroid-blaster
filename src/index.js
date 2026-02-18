import Rock from "./modules/rock.js";
import Ship from "./modules/ship.js";
import Bullet from "./modules/bullet.js";
import GameScreen from "./modules/gamescreen.js";
import { renderScreen } from "./render.js";
import { doCirclesCollide } from "./helper.js";
import { asteroidsSVG, shipSVG } from "./graphics.js";
import { bulletSpecs, shipSpecs, gunSpec, rockType } from "./gamedata.js";

var animationId;
let isGamePlaying = false;
var ACTIONS = {
  shipThrust: false,
  shoot: false,
  shipLeft: false,
  shipRight: false,
};

let gameScreen = new GameScreen("gameScreen", 800, 400);
let score = { bonus: 0, damage: 0 };

let ship;
let rockList = [];
let bulletList = [];

// ----  Rock code ----
function initRocks(amount) {
  for (let i = 0; i < amount; i++) {
    initRock("LARGE", gameScreen.getRandomEdgePosition());
  }
}

function getRandomNumber(min, max) {
  return min + Math.random() * (max - min);
}

const getAsteroidGraphic = () => {
  const n = Math.floor(Math.random() * 3);
  return asteroidsSVG[n]();
};

function createNewAsteroid(size, initialPosition) {
  let rockProps = rockType[size];
  let speed = getRandomNumber(rockProps.minSpeed, rockProps.maxSpeed);
  let r = getRandomNumber(rockProps.minRadius, rockProps.maxRadius);
  let radians = getRandomNumber(0, Math.PI * 2);
  let rotationRate = getRandomNumber(-2, 2);
  let velocity = { speed: speed, directionOfTravel: radians };
  const rock = new Rock(initialPosition, r, velocity, size, rotationRate);
  return rock;
}

// this function does several things - creates a rock with random properties, adds it to the rock list, creates a game element for the rock and adds it to the game screen
function initRock(size, pos) {
  // create rock with random properties
  const rock = createNewAsteroid(size, pos);

  // add rock to rocklist
  rockList[rock.id] = rock;

  // create game element for rock
  let rockStyle = `height:${2 * rock.r}px; width:${2 * rock.r}px; margin-left:-${rock.r}px; margin-top:-${rock.r}px;`;
  const el = gameScreen.createGameElement(
    rock.id,
    "rock",
    rockStyle,
    getAsteroidGraphic(),
  );
  // add game element to screen
  gameScreen.addToGameWindow(el);
}
// end of Rock code

// ---- Ship code ----
function initShip() {
  const pos = gameScreen.getScreenCentre();
  ship = new Ship(pos, "ship", shipSpecs);
  ship.attachGun(gunSpec);
}
// end of Ship code

function updateScore(value) {
  score.bonus += value;
  document.getElementById("gameScore").innerHTML = "SCORE: " + score.bonus;
}

function updateDamage(value) {
  score.damage += value;
  document.getElementById("gameScoreDamage").innerHTML =
    "DAMAGE :" + score.damage;
}

// events code
function keyEvent(ev, isKeyDown) {
  var keyCode = ev == null ? window.ev.keyCode : ev.keyCode;

  if (keyCode == 37) {
    ACTIONS.shipLeft = isKeyDown;
  }
  if (keyCode == 39) {
    ACTIONS.shipRight = isKeyDown;
  }
  if (keyCode == 38) {
    ACTIONS.shipThrust = isKeyDown;
  }
  if (keyCode == 83) {
    ACTIONS.shoot = isKeyDown;
  }
}

function addEvents() {
  window.addEventListener("resize", function (event) {
    gameScreen.resizeGameScreenSize();
  });

  window.addEventListener("keydown", function (ev) {
    keyEvent(ev, true);
  });

  window.addEventListener("keyup", function (ev) {
    keyEvent(ev, false);
  });

  document.getElementById("startButton").addEventListener("click", function () {
    isGamePlaying = true;
    startGame();
  });

  document.getElementById("pause").addEventListener("click", function () {
    isGamePlaying = false;
    cancelAnimationFrame(animationId);
  });
}
// end of events code

// GAME loop code
function step(timestamp) {
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
  if (ACTIONS.shoot == true && ship.isGunLoaded()) {
    // create new bullet - needs ship position, rotation and speed to calculate bullet velocity and position
    const gunPosition = ship.getGunPosition();
    const bulletVelocity = ship.getBulletVelocity();
    const newBullet = new Bullet(gunPosition, bulletVelocity, bulletSpecs);
    // add bullet to list of bullets
    bulletList[newBullet.id] = newBullet;
    // TODO: replace above line with this-->  gameElements.bullets.push(newBullet);
    // create game element for bullet
    const el = gameScreen.createGameElement(newBullet.id, "bullet", null, null);
    gameScreen.addToGameWindow(el);
    // reload ships gun
    ship.reloadGun();
    playSound("shoot");
  }
  // update ship position
  ship.update(gameScreen.width, gameScreen.height);

  // remove dead bullets
  for (var bullet in bulletList) {
    if (bulletList[bullet].bulletPower == 0) {
      // remove bullet from gameScreen
      const nodeId = bulletList[bullet].id;
      gameScreen.removeNode(nodeId);
      // remove bullet from list
      delete bulletList[bullet];
    }
  }

  // test rocks to ship collision
  for (var rock in rockList) {
    rockList[rock].update(gameScreen.width, gameScreen.height);
    if (doCirclesCollide(rockList[rock], ship)) {
      updateDamage(4 * rockType[rockList[rock].size].value);
      const nodeId = rock;
      gameScreen.removeNode(nodeId);
      delete rockList[rock];
    }
  }

  // test rocks to bullets collision
  for (var rock in rockList) {
    let haveCollision = false;
    for (var bullet in bulletList) {
      if (!haveCollision) {
        const thisBullet = bulletList[bullet];
        const bulletPosition = {
          x: thisBullet.position.x,
          y: thisBullet.position.y,
          r: thisBullet.r,
        };
        if (doCirclesCollide(rockList[rock], bulletPosition)) {
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

          console.dir(rockList);
          haveCollision = true;
          updateScore(rockType[rockList[rock].size].value);

          gameScreen.removeNode(rockList[rock].id);
          delete rockList[rock];
          gameScreen.removeNode(bulletList[bullet].id);
          delete bulletList[bullet];
        }
      }
    }
  }

  renderScreen(ship, rockList, bulletList, gameScreen);

  animationId = window.requestAnimationFrame(step);
}

function playSound(soundDescription) {
  let soundurl;
  if (soundDescription == "shoot") {
    soundurl = "/sounds/shoot.wav";
  } else if (soundDescription == "explosion") {
    soundurl = "/sounds/explosion.wav";
  } else {
    console.error(`sound description ${soundDescription} not recognised`);
    return;
  }
  const sound = new Audio(soundurl);
  sound.load();
  sound.play();
}

function hideStartButton() {
  document.getElementById("startButton").style.display = "none";
}

function startGame() {
  hideStartButton();
  initShip();
  startLevel(1);
  cancelAnimationFrame(animationId);
  animationId = requestAnimationFrame(step);
}

function startLevel(level) {
  const shipEl = gameScreen.createGameElement("ship", "ship", null, shipSVG());
  gameScreen.addToGameWindow(shipEl);
  setTimeout(() => initRocks(4), 1000);
}

function init() {
  addEvents();
  gameScreen.resizeGameScreenSize();
  updateScore(0);
  updateDamage(0);
}

init();
// end of GAME loop code
