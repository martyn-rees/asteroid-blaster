// rendering
// add gamelements (id, pos, rotation) to rendering list
// map through rendering list. Add ID to previous list
// if ID is not in previous list then create element
// if ID is in previous list then update element position and rotation
// if ID is not in current list but is in previous list then remove element
import { Bullets, Rocks } from "../state/gameState.js";
import Ship from "../entities/ship.js";
import Rock from "../entities/rock.js";
import Gun from "../entities/gun.js";
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
} from "./dom-render.js";

import { asteroidsSVG, shipSVG } from "../assets/graphics.js";
import { GameState } from "../state/gameState.js";

function diffSets(current: Set<string>, previous: Set<string>) {
  return {
    added: new Set([...current].filter((id) => !previous.has(id))),
    removed: new Set([...previous].filter((id) => !current.has(id))),
  };
}

let previousRender = {
  shipIds: new Set<string>(),
  rockIds: new Set<string>(),
  bulletIds: new Set<string>(),
};

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
  newShipIds: Set<string>,
  newBulletIds: Set<string>,
  newRockIds: Set<string>,
  screenId: string,
  rocks: Rocks,
  bullets: Bullets,
) {
  newShipIds.forEach((shipId) => {
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

function removeOldItems(
  oldShipIds: Set<string>,
  oldRockIds: Set<string>,
  oldBulletIds: Set<string>,
) {
  oldShipIds.forEach((shipId: string) => {
    removeFromScreen(shipId);
  });

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
  const { bullets, rocks, ship, score } = gameState;

  // if in render debug mode to test if update and render are de-coupled
  // this line can force this rendering to be skipped for a designated number of frames
  if (debug_skipRenderForThisFrame()) return false;

  const currentShipIds = new Set(ship ? [ship.id] : []);
  const { added: newShipIds, removed: oldShipIds } = diffSets(
    currentShipIds,
    previousRender.shipIds,
  );

  const currentRockIds = new Set(Object.keys(rocks));
  const { added: newRockIds, removed: oldRockIds } = diffSets(
    currentRockIds,
    previousRender.rockIds,
  );

  const currentBulletIds = new Set(Object.keys(bullets));
  const { added: newBulletIds, removed: oldBulletIds } = diffSets(
    currentBulletIds,
    previousRender.bulletIds,
  );

  // ADD NEW ITEMS
  addNewItems(newShipIds, newBulletIds, newRockIds, screenId, rocks, bullets);

  // REMOVE OLD ITEMS
  removeOldItems(oldShipIds, oldRockIds, oldBulletIds);

  // UPDATE ITEMS
  if (ship) updateItems(ship, rocks, bullets);

  displayScore(score);

  previousRender = {
    shipIds: currentShipIds,
    rockIds: currentRockIds,
    bulletIds: currentBulletIds,
  };
  return true;
}
