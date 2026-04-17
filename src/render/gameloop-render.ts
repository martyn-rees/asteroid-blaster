// rendering
// add gamelements (id, pos, rotation) to rendering list
// map through rendering list. Add ID to previous list
// if ID is not in previous list then create element
// if ID is in previous list then update element position and rotation
// if ID is not in current list but is in previous list then remove element
import { Bullets, Rocks } from "../state/game-state.ts";
import Ship from "../entities/ship.ts";
import Rock from "../entities/rock.ts";

import {
  addToScreen,
  removeFromScreen,
  redrawOnScreen,
  renderThrust,
  createRock,
  createShip,
  createBullet,
  createGun,
} from "./dom-render.ts";

import { displayScore } from "../render/score-render.ts";
import { playSound } from "./sound-render.ts";
import { resetFPS } from "./fps.ts";

import { GameState } from "../state/game-state.ts";
import { debug, renderConfig } from "../config/config.ts";

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
  score: -1,
};

// Clears all tracked DOM elements and resets render state for a new game.
// Must be called on game reset — without this, the diff against previousRender
// would never see old elements as removed, leaving them frozen on screen.
export function resetRenderer() {
  previousRender.shipIds.forEach((id) => removeFromScreen(id));
  previousRender.rockIds.forEach((id) => removeFromScreen(id));
  previousRender.bulletIds.forEach((id) => removeFromScreen(id));
  resetFPS();
  resetRenderFrameCount();
  previousRender = {
    shipIds: new Set<string>(),
    rockIds: new Set<string>(),
    bulletIds: new Set<string>(),
    score: -1,
  };
}

let renderFrameCount = 0;

function resetRenderFrameCount() {
  renderFrameCount = 0;
}

function skipRenderForThisFrame(): boolean {
  if (renderConfig.frameSkip > 1) {
    renderFrameCount++;
    if (renderFrameCount < renderConfig.frameSkip) {
      return true;
    }
    renderFrameCount = 0;
  }
  return false;
}

function displayNewShips(newShipIds: Set<string>, screenId: string, ship: Ship | undefined) {
  if (!ship) return;
  newShipIds.forEach(() => {
    addToScreen(createShip(ship), screenId);
    // these lines are for testing - adds the ship's gun muzzle to check it's position is correct
    if (debug.showGunMuzzle && ship.gun) {
      addToScreen(createGun(ship.gun), screenId);
    }
  });
}

function displayNewBullets(
  newBulletIds: Set<string>,
  screenId: string,
  bullets: Bullets,
) {
  newBulletIds.forEach((bulletId: string) => {
    const bullet = bullets[bulletId];
    if (bullet) {
      addToScreen(createBullet(bullet), screenId);
      playSound("shoot");
    } else {
      console.error("bulletId doesn't exist in bullets", bulletId);
    }
  });
}

function displayNewRocks(
  newRockIds: Set<string>,
  screenId: string,
  rocks: Rocks,
) {
  newRockIds.forEach((rockId: string) => {
    const rock = rocks[rockId];
    if (rock) {
      addToScreen(createRock(rock), screenId);
    } else {
      console.error("rockId doesn't exist in rocks", rockId);
    }
  });
}

function removeOldShips(oldShipIds: Set<string>) {
  oldShipIds.forEach((shipId: string) => {
    removeFromScreen(shipId);
  });
}

function removeOldBullets(oldBulletIds: Set<string>) {
  oldBulletIds.forEach((bulletId: string) => {
    removeFromScreen(bulletId);
  });
}

function removeOldRocks(oldRockIds: Set<string>) {
  oldRockIds.forEach((rockId: string) => {
    removeFromScreen(rockId);
    playSound("rock-explosion");
  });
}

function redrawShip(ship: Ship) {
  redrawOnScreen(ship.id, ship.position.x, ship.position.y, ship.rotation);
  renderThrust(ship.thrustPower);

  // these lines are for testing - updates the ship's gun muzzle to check it's position is correct
  if (debug.showGunMuzzle) {
    const gun = ship.gun!;
    redrawOnScreen(gun.id, gun.muzzlePosition.x, gun.muzzlePosition.y);
  }
}

function redrawBullets(bullets: Bullets) {
  for (const bulletId in bullets) {
    const bullet = bullets[bulletId];
    redrawOnScreen(bulletId, bullet.position.x, bullet.position.y);
  }
}

function redrawRocks(rocks: Rocks) {
  for (const rockId in rocks) {
    const rock: Rock = rocks[rockId];
    redrawOnScreen(rockId, rock.position.x, rock.position.y, rock.rotation);
  }
}

/* RENDER CODE */
// display game elements, ship, rocks and bullets
export function gameLoopRender(gameState: GameState, screenId: string) {
  const { bullets, rocks, ship, score } = gameState;

  // if in render debug mode to test if update and render are de-coupled
  // this line can force this rendering to be skipped for a designated number of frames
  if (skipRenderForThisFrame()) return false;

  // ship is only in currentShipIds when active — going non-active removes it from the DOM
  const currentShipIds = new Set(
    ship && ship.state === "active" ? [ship.id] : [],
  );
  const { added: newShipIds, removed: oldShipIds } = diffSets(
    currentShipIds,
    previousRender.shipIds,
  );

  // ship just transitioned to exploding this frame — add explosion element
  if (
    ship &&
    ship.state === "exploding" &&
    previousRender.shipIds.has(ship.id)
  ) {
    const el = document.createElement("div");
    el.setAttribute("id", "shipExplosion");
    el.setAttribute("class", "ship-explosion");
    el.style.left = `${ship.position.x}px`;
    el.style.top = `${ship.position.y}px`;
    document.getElementById(screenId)?.appendChild(el);
  }

  // remove explosion element once ship reaches destroyed
  if (ship && ship.state === "destroyed") {
    const el = document.getElementById("shipExplosion");
    el?.parentNode?.removeChild(el);
  }

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

  // DISPLAY NEW ITEMS
  displayNewShips(newShipIds, screenId, ship);
  displayNewBullets(newBulletIds, screenId, bullets);
  displayNewRocks(newRockIds, screenId, rocks);

  // REMOVE OLD ITEMS
  removeOldShips(oldShipIds);
  removeOldBullets(oldBulletIds);
  removeOldRocks(oldRockIds);

  // REDRAW ITEMS
  if (ship && ship.state === "active") {
    redrawShip(ship);
  }
  redrawBullets(bullets);
  redrawRocks(rocks);

  if (score !== previousRender.score) {
    displayScore(score);
  }

  previousRender = {
    shipIds: currentShipIds,
    rockIds: currentRockIds,
    bulletIds: currentBulletIds,
    score,
  };
  return true;
}
