import { Bullets, Rocks } from "../state/gameState.js";
import Ship from "../modules/ship.js";
import Rock from "../modules/rock.js";
import Gun from "../modules/gun.js";
import { convertRadiansToDegrees } from "../utils/maths.js";

import {
  addToScreen,
  removeFromScreen,
  createElement,
  redrawOnScreen,
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

function removeOldItems(oldRocks: string[], oldBullets: string[]) {
  // remove dead bullets
  oldBullets.forEach((bulletId) => {
    removeFromScreen(bulletId);
  });

  // remove dead rocks
  oldRocks.forEach((rockId) => {
    removeFromScreen(rockId);
    playSound("rock-explosion");
  });
}

function updateItems(ship: Ship, rocks: Rocks, bullets: Bullets) {
  // redraw ship
  const degrees = convertRadiansToDegrees(ship.rotation);
  redrawOnScreen(ship.id, ship.position.x, ship.position.y, degrees);
  renderThrust(ship.thrustPower);

  // these lines are for testing - updates the ship's gun muzzle to check it's position is correct
  if (debug.showGunMuzzle) {
    const gun: Gun = ship!.gun!;
    redrawOnScreen(gun.id, gun.muzzlePosition.x, gun.muzzlePosition.y);
  }
  // redraw rocks
  for (var rockId in rocks) {
    const rock: Rock = rocks[rockId];
    redrawOnScreen(rockId, rock.position.x, rock.position.y, rock.rotation);
  }
  // redraw bullets
  for (var bulletId in bullets) {
    const bullet = bullets[bulletId];
    redrawOnScreen(bulletId, bullet.position.x, bullet.position.y);
  }
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
  removeOldItems(oldRocks, oldBullets);

  // UPDATE ITEMS
  updateItems(ship!, rocks, bullets);

  displayScore(score);
}
