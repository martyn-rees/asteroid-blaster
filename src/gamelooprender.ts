import {
  addToScreen,
  removeFromScreen,
  createElement,
  updateElement,
  renderThrust,
} from "./render.js";

import { asteroidsSVG } from "./graphics.js";
import Rock from "./modules/rock.js";
import GameScreen from "./modules/gamescreen.js";
import { GameState } from "./gameState.js";

/* RENDER CODEE */
// disply game elements, ship, rocks and bullets
// TODO: pass in gameElelemtns object with single items and arrays which get displayed using generic functions
// TODO - keep a copy of rockList and bullewtList from previous frame and compare to current list to decide which elements to add, update and remove
// can then remove oldBullets, oldRocks and newBullets
//
export function gameLoopRender(gameState: GameState, gameScreen: GameScreen) {
  //TODO: if addNewBullet is moved to end of this function then get an error that new bullet is not rendered on first frame. Why?
  // ADD NEW ITEMS
  gameState.newBullets.forEach((bulletId) => {
    const el = createElement(bulletId, "bullet", null, null);
    addToScreen(el, gameScreen.id);
    playSound("shoot");
  });

  // add new rocks to screen and then reset newRocks list to []
  gameState.newRocks.forEach((rockId) => {
    addNewRockToScreen(gameState.rockList[rockId], gameScreen);
  });

  // REMOVE OLD ITEMS
  // remove dead bullets
  gameState.oldBullets.forEach((bulletId) => {
    removeFromScreen(bulletId);
  });

  // remove dead rocks
  gameState.oldRocks.forEach((rockId) => {
    removeFromScreen(rockId);
    playSound("explosion");
  });

  // UPDATE ITEMS
  gameState.ship!.render(updateElement, renderThrust); // this calls render method in ship class which calls renderShip above whch calls render

  for (var rockId in gameState.rockList) {
    gameState.rockList[rockId].render(updateElement); // this calls render method in rock class which calls render above
  }

  for (var bulletId in gameState.bulletList) {
    gameState.bulletList[bulletId].render(updateElement);
  }

  displayScore(gameState.score);
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

const getAsteroidGraphic = (): string => {
  const n = Math.floor(Math.random() * asteroidsSVG.length);
  return asteroidsSVG[n];
};

function addNewRockToScreen(rock: Rock, gameScreen: GameScreen) {
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
