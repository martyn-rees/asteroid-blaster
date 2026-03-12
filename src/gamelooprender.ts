import {
  addToScreen,
  removeFromScreen,
  createElement,
  updateElement,
  renderThrust,
  playSound,
  createRockElement,
  displayScore,
} from "./render.js";

import { asteroidsSVG } from "./graphics.js";
import { GameState } from "./gameState.js";

/* RENDER CODEE */
// disply game elements, ship, rocks and bullets
// TODO: pass in gameElelemtns object with single items and arrays which get displayed using generic functions
// TODO - keep a copy of rocks and bullets from previous frame and compare to current list to decide which elements to add, update and remove
// can then remove oldBullets, oldRocks and newBullets
//
export function gameLoopRender(gameState: GameState, screenId: string) {
  const {
    bullets,
    newBullets,
    oldBullets,
    rocks,
    newRocks,
    oldRocks,
    ship,
    score,
  } = gameState;

  // ADD NEW ITEMS
  newBullets.forEach((bulletId) => {
    const el = createElement(bulletId, "bullet", null, null);
    addToScreen(el, screenId);
    playSound("shoot");
  });

  // add new rocks to screen and then reset newRocks list to []
  newRocks.forEach((rockId) => {
    const rock = rocks[rockId];
    const el = createRockElement({
      id: rockId,
      r: rock.r,
      SVGList: asteroidsSVG,
    });
    addToScreen(el, screenId);
  });

  // REMOVE OLD ITEMS
  // remove dead bullets
  oldBullets.forEach((bulletId) => {
    removeFromScreen(bulletId);
  });

  // remove dead rocks
  oldRocks.forEach((rockId) => {
    removeFromScreen(rockId);
    playSound("explosion");
  });

  // UPDATE ITEMS
  ship!.render(updateElement, renderThrust); // this calls render method in ship class which calls renderShip above whch calls render

  for (var rockId in rocks) {
    rocks[rockId].render(updateElement); // this calls render method in rock class which calls render above
  }

  for (var bulletId in bullets) {
    bullets[bulletId].render(updateElement);
  }

  displayScore(score);
}
