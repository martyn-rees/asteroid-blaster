import Rock from "./modules/rock.js";
import Ship from "./modules/ship.js";
import Bullet from "./modules/bullet.js";
import GameScreen from "./modules/gamescreen.js";
import { renderScreen } from "./render.js";
import { doCirclesCollide } from "./helper.js";
import { asteroid1SVG, shipSVG } from "./graphics.js";
var globalID;
let isGamePlaying = false;
var ACTIONS = {
  shipThrust: false,
  shoot: false,
  shipLeft: false,
  shipRight: false,
};

let gameState = {
  ship: null,
  rocksList: {},
  bulletsList: {},
};

let gameScreen = new GameScreen("gameScreen", 800, 400);
let score = { bonus: 0, damage: 0 };
let bulletSpecs = {
  r: 2,
  endurance: 90,
  power: 1,
};
let shipSpecs = {
  maxSpeed: 4.0,
  drag: 0.005,
  thrust: 0.1,
  radius: 6,
  rotationSpeed: Math.PI / 90, // radians per frame
};
let gunSpec = {
  barrelLocation: { x: 0, y: 6 },
  speed: 6,
  reloadTime: 10,
};

let rocks = {
  type: {
    LARGE: {
      minRadius: 60,
      maxRadius: 80,
      minSpeed: 1,
      maxSpeed: 2,
      value: 100,
    },
    MEDIUM: {
      minRadius: 25,
      maxRadius: 40,
      minSpeed: 1.5,
      maxSpeed: 2.5,
      value: 200,
    },
    SMALL: {
      minRadius: 10,
      maxRadius: 15,
      minSpeed: 2,
      maxSpeed: 3,
      value: 300,
    },
  },
  rockList: {},
};
let ship;
let bullets = {
  MIN_RELOD_TIME: 10,
  countdownToReload: 0,
  bulletList: {},
};

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
  rocks.rockList[rock.id] = rock;
  let rockStyle = `height:${2 * rock.r}px; width:${2 * rock.r}px; margin-left:-${rock.r}px; margin-top:-${rock.r}px;`;
  createGameElement(rock.id, "rock", rockStyle, asteroid1SVG(rock));
}

function initShip() {
  const pos = gameScreen.getScreenCentre();
  ship = new Ship(pos, "ship", shipSpecs);
  ship.attachGun(gunSpec);
  console.log("init ship", ship);
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
  // update ship position
  ship.update(gameScreen.width, gameScreen.height);
  // test if bullet fired
  if (bullets.countdownToReload > 0) {
    bullets.countdownToReload--;
  } else {
    // test if SHOOT KEY is pressed
    if (ACTIONS.shoot == true) {
      // create new bullet - needs ship position, rotation and speed to calculate bullet velocity and position
      // could i just add ID to rendering list and then the rendering function coud create the game element

      const gunPosition = ship.getGunPosition();
      const bulletVelocity = ship.getBulletVelocity();

      const newBullet = new Bullet(gunPosition, bulletVelocity, bulletSpecs);
      bullets.bulletList[newBullet.id] = newBullet;
      createGameElement(newBullet.id, "bullet", null, null);
      // reset time to fire next bullet
      // this should be included with ship that gun is attached to so that if we add power ups to the game that decrease the time between shots then we can just decrease the gun's reload time and it will affect all bullets fired from that gun. That way we don't have to change any of the bullet code when we add power ups to the game.
      bullets.countdownToReload = bullets.MIN_RELOD_TIME;
    }
  }

  // remove dead bullets
  for (var bullet in bullets.bulletList) {
    if (bullets.bulletList[bullet].bulletPower == 0) {
      // remove bullet from gameScreen
      const nodeId = bullets.bulletList[bullet].id;
      gameScreen.removeNode(nodeId);
      // remove bullet from list
      delete bullets.bulletList[bullet];
    }
  }

  for (var rock in rocks.rockList) {
    rocks.rockList[rock].update(gameScreen.width, gameScreen.height);
    if (doCirclesCollide(rocks.rockList[rock], ship)) {
      updateDamage(4 * rocks.type[rocks.rockList[rock].size].value);
      const nodeId = rock;
      gameScreen.removeNode(nodeId);
      delete rocks.rockList[rock];
    }
  }

  let destroyedRockSizes = [];
  // test rocks to bullets
  for (var rock in rocks.rockList) {
    let haveCollision = false;
    for (var bullet in bullets.bulletList) {
      if (!haveCollision) {
        const thisBullet = bullets.bulletList[bullet];
        const bulletPosition = {
          x: thisBullet.position.x,
          y: thisBullet.position.y,
          r: thisBullet.r,
        };
        if (doCirclesCollide(rocks.rockList[rock], bulletPosition)) {
          const pos = {
            x: rocks.rockList[rock].x,
            y: rocks.rockList[rock].y,
          };
          if (rocks.rockList[rock].size == "LARGE") {
            initRock("MEDIUM", pos);
            initRock("MEDIUM", pos);
          } else if (rocks.rockList[rock].size == "MEDIUM") {
            initRock("SMALL", pos);
            initRock("SMALL", pos);
            initRock("SMALL", pos);
          }
          destroyedRockSizes.push(rocks.rockList[rock].size);

          gameScreen.removeNode(rocks.rockList[rock].id);
          delete rocks.rockList[rock];
          gameScreen.removeNode(bullets.bulletList[bullet].id);
          delete bullets.bulletList[bullet];

          haveCollision = true;
        }
      }
    }
  }

  renderScreen(ship, rocks, bullets, gameScreen);

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
