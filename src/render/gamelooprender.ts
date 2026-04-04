// rendering
// add gamelements (id, pos, rotation) to rendering list
// map through rendering list. Add ID to previous list
// if ID is not in previous list then create element
// if ID is in previous list then update element position and rotation
// if ID is not in current list but is in previous list then remove element
//
import { Bullets, Rocks, changeGameState } from "../state/gameState.js";
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

let previousRockIds: Set<string> = new Set();
let previousBulletIds: Set<string> = new Set();

// can set the debug mode on by setting the debug object
// set show gun muzzle to display the poition of a ships gun to check it's in the correct position
// set renderDelay to true to make the render loop run slower than the update loop.
// so setting a longer render delay can quickly show any problems
const debug = { showGunMuzzle: false, renderDelay: false };
const DEBUG_RENDER_DELAY = 5;
let debug_render_countdown = DEBUG_RENDER_DELAY;

function debug_skipRenderForThisFrame(): boolean {
  // code to delay rendering for number of frames specified by DEBUG_RENDER_DELAY
  // use this for testing if rendering truly is separated from update to game model
  if (debug.renderDelay === true) {
    debug_render_countdown--;
    if (debug_render_countdown <= 0) {
      debug_render_countdown = DEBUG_RENDER_DELAY;
    } else {
      return true;
    }
  }
  return false;
}

function addNewItems(
  newShips: string[],
  newBulletIds: Set<string>,
  newRockIds: Set<string>,
  screenId: string,
  rocks: Rocks,
  bullets: Bullets,
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

  newBulletIds.forEach((bulletId: string) => {
    const bullet = bullets[bulletId];
    if (bullet) {
      const el = createElement(bulletId, "bullet", null, null);
      addToScreen(el, screenId);
      playSound("shoot");
    } else {
      console.error("bulletId doesn't exist in bullets", bulletId);
    }
  });

  newRockIds.forEach((rockId: string) => {
    const rock = rocks[rockId];
    if (rock) {
      const graphicIndex = rock.index % asteroidsSVG.length;
      const el = createRockElement({
        id: rockId,
        r: rock.r,
        asteroidImage: asteroidsSVG[graphicIndex],
        size: rock.size,
      });
      addToScreen(el, screenId);
    } else {
      console.error("rockId doesn't exist in rocks", rockId);
    }
  });
}

function removeOldItems(oldRockIds: Set<string>, oldBulletIds: Set<string>) {
  oldBulletIds.forEach((bulletId: string) => {
    removeFromScreen(bulletId);
  });

  oldRockIds.forEach((rockId: string) => {
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
// display game elements, ship, rocks and bullets
export function gameLoopRender(gameState: GameState, screenId: string) {
  const { bullets, rocks, ship, newShips, score } = gameState;

  // if in render debug mode to test if update and render are de-coupled
  // this line can force this rendering to be skipped for a designated number of frames
  if (debug_skipRenderForThisFrame()) return false;

  const currentRockIds = new Set(Object.keys(rocks));
  const newRockIds = new Set(
    [...currentRockIds].filter((id) => !previousRockIds.has(id)),
  );
  const oldRockIds = new Set(
    [...previousRockIds].filter((id) => !currentRockIds.has(id)),
  );

  const currentBulletIds = new Set(Object.keys(bullets));
  const newBulletIds = new Set(
    [...currentBulletIds].filter((id) => !previousBulletIds.has(id)),
  );
  const oldBulletIds = new Set(
    [...previousBulletIds].filter((id) => !currentBulletIds.has(id)),
  );

  // ADD NEW ITEMS
  addNewItems(newShips, newBulletIds, newRockIds, screenId, rocks, bullets);

  // REMOVE OLD ITEMS
  removeOldItems(oldRockIds, oldBulletIds);

  // UPDATE ITEMS
  updateItems(ship!, rocks, bullets);

  displayScore(score);

  previousRockIds = currentRockIds;
  previousBulletIds = currentBulletIds;
  changeGameState({ action: "reset lists", payload: "" });
  return true;
}
