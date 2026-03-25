import { Rocks } from "../state/gameState.js";

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

import { asteroidsSVG, shipSVG } from "../graphics.js";
import { GameState } from "../state/gameState.js";

const debug = { showGunMuzzle: true };

function addNewItems(
  newShips: string[],
  newBullets: string[],
  newRocks: string[],
  screenId: string,
  rocks: Rocks,
) {
  newShips.forEach((shipId) => {
    const shipEl = createElement(shipId, "ship", null, shipSVG());
    addToScreen(shipEl, screenId);
    // these lines are for testing - adds the ship's gun muzzle to check it's position is correct
    if (debug.showGunMuzzle) {
      const gunEl = createElement("gun0", "gun", null, null);
      addToScreen(gunEl, screenId);
    }
  });

  newBullets.forEach((bulletId) => {
    const el = createElement(bulletId, "bullet", null, null);
    addToScreen(el, screenId);
    playSound("shoot");
  });

  // add new rocks to screen and then reset newRocks list to []
  newRocks.forEach((rockId) => {
    const rock = rocks[rockId];
    const graphicIndex = rock.index % asteroidsSVG.length;
    const el = createRockElement({
      id: rockId,
      r: rock.r,
      asteroidImage: asteroidsSVG[graphicIndex],
      size: rock.size,
    });
    addToScreen(el, screenId);
  });
}

/* RENDER CODE */
// disply game elements, ship, rocks and bullets
// TODO - keep a copy of rocks and bullets from previous frame and compare to current list to decide which elements to add, update and remove
// can then remove oldBullets, oldRocks and newBullets
export function gameLoopRender(gameState: GameState, screenId: string) {
  const {
    bullets,
    newBullets,
    oldBullets,
    rocks,
    newRocks,
    oldRocks,
    ship,
    newShips,
    score,
  } = gameState;

  // ADD NEW ITEMS
  addNewItems(newShips, newBullets, newRocks, screenId, rocks);

  // REMOVE OLD ITEMS
  // remove dead bullets
  oldBullets.forEach((bulletId) => {
    removeFromScreen(bulletId);
  });

  // remove dead rocks
  oldRocks.forEach((rockId) => {
    removeFromScreen(rockId);
    playSound("rock-explosion");
  });

  // UPDATE ITEMS
  ship!.render(updateElement, renderThrust); // this calls render method in ship class which calls renderShip above whch calls render
  // these lines are for testing - updates the ship's gun muzzle to check it's position is correct
  if (debug.showGunMuzzle) {
    ship!.gun!.render(updateElement);
  }
  for (var rockId in rocks) {
    rocks[rockId].render(updateElement); // this calls render method in rock class which calls render above
  }

  for (var bulletId in bullets) {
    bullets[bulletId].render(updateElement);
  }

  displayScore(score);
}
