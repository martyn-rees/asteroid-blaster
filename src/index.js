import Rock from "./modules/rock.js";
import Ship from "./modules/ship.js";
import Bullet from "./modules/bullet.js";
import GameScreen from "./modules/gamescreen.js";
import { renderScreen } from "./render.js";
import { doCirclesCollide } from "./helper.js";
import { asteroid1SVG, shipSVG } from "./graphics.js";
import { bulletSpecs, shipSpecs, gunSpec, rocks } from "./gamedata.js";

var globalID;
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
let rockList = {};
let bulletList = {};

function initRocks(amount) {
  for (let i = 0; i < amount; i++) {
    initRock("LARGE", gameScreen.getRandomEdgePosition());
  }
}

const createGameElement = (id, className, style, graphicSVG) => {
  let elContainer = document.createElement("div");
  elContainer.setAttribute("id", id);
  elContainer.setAttribute("class", className);
  if (style) {
    elContainer.setAttribute("style", style);
  }
  if (graphicSVG) {
    elContainer.innerHTML = graphicSVG;
  }
  //return elContainer;
  gameScreen.addToGameWindow(elContainer);
};

function getRandomNumber(min, max) {
  return min + Math.random() * (max - min);
}

function initRock(size, pos) {
  let rockProps = rocks.type[size];
  let speed = getRandomNumber(rockProps.minSpeed, rockProps.maxSpeed);
  let r = getRandomNumber(rockProps.minRadius, rockProps.maxRadius);
  let radians = getRandomNumber(0, Math.PI * 2);
  let rotationRate = getRandomNumber(-2, 2);

  const dx = speed * Math.sin(radians);
  const dy = speed * Math.cos(radians);
  let velocity = { dx, dy };

  const rock = new Rock(pos.x, pos.y, r, velocity, size, rotationRate);
  rockList[rock.id] = rock;
  let rockStyle = `height:${2 * rock.r}px; width:${2 * rock.r}px; margin-left:-${rock.r}px; margin-top:-${rock.r}px;`;
  createGameElement(rock.id, "rock", rockStyle, asteroid1SVG(rock));
}

function initShip() {
  const pos = gameScreen.getScreenCentre();
  ship = new Ship(pos, "ship", shipSpecs);
  ship.attachGun(gunSpec);
}

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
    createGameElement(newBullet.id, "bullet", null, null);
    // reload ships gun
    ship.reloadGun();
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

  for (var rock in rockList) {
    rockList[rock].update(gameScreen.width, gameScreen.height);
    if (doCirclesCollide(rockList[rock], ship)) {
      updateDamage(4 * rocks.type[rockList[rock].size].value);
      const nodeId = rock;
      gameScreen.removeNode(nodeId);
      delete rockList[rock];
    }
  }

  let destroyedRockSizes = [];
  // test rocks to bullets
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
          updateScore(rocks.type[rockList[rock].size].value);

          destroyedRockSizes.push(rockList[rock].size);

          gameScreen.removeNode(rockList[rock].id);
          delete rockList[rock];
          gameScreen.removeNode(bulletList[bullet].id);
          delete bulletList[bullet];
        }
      }
    }
  }

  renderScreen(ship, rockList, bulletList, gameScreen);

  globalID = window.requestAnimationFrame(step);
}

function updateScore(value) {
  score.bonus += value;
  document.getElementById("gameScore").innerHTML = "SCORE: " + score.bonus;
}

function updateDamage(value) {
  score.damage += value;
  document.getElementById("gameScoreDamage").innerHTML =
    "DAMAGE :" + score.damage;
}

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

function startGame() {
  addEvents();
  gameScreen.resizeGameScreenSize();
  initShip();
  startLevel(1);
  updateScore(0);
  updateDamage(0);
}

function startLevel(level) {
  initRocks(4);
  createGameElement("ship", "ship", null, shipSVG());
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

  document.getElementById("start").addEventListener("click", function () {
    cancelAnimationFrame(globalID);
    globalID = requestAnimationFrame(step);
  });

  document.getElementById("stop").addEventListener("click", function () {
    isGamePlaying = false;
    cancelAnimationFrame(globalID);
  });
}

function init() {
  startGame();
}

init();
