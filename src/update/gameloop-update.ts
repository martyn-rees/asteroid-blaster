import {
  changeGameState,
  GameState,
  Rocks,
  Bullets,
} from "../state/game-state.ts";
import Ship from "../entities/ship.ts";
import Gun from "../entities/gun.ts";
import Bullet from "../entities/bullet.ts";
import { bulletSpecs, rockType } from "../config/game-entity-specs.ts";
import { constrainNumber, testCollision } from "../utils/maths.ts";
import { explodeRock } from "../entities/rock-factory.ts";
import { startLevel } from "../ui/level-start.ts";
import { getShipActions, removeShipControlEvents } from "../input/ship-actions.ts";
import Viewport from "../entities/viewport.ts";

export function updateMotionStates(
  gameState: GameState,
  gameScreen: Viewport,
  dt: number,
) {
  const { ship, bullets, rocks } = gameState;
  // warpPosition wraps coordinates that go off one edge of the screen to the opposite edge
  const warpPosition = ({ x, y }: { x: number; y: number }) => ({
    x: constrainNumber(x, 0, gameScreen.width),
    y: constrainNumber(y, 0, gameScreen.height),
  });

  ship!.update(warpPosition, dt);

  for (const bulletId in bullets) {
    bullets[bulletId].update(warpPosition, dt);
  }

  for (const rockId in rocks) {
    rocks[rockId].update(warpPosition, dt);
  }
}

export function expireOldBullets(bullets: Bullets): void {
  for (const bulletId in bullets) {
    const thisBullet = bullets[bulletId];
    if (thisBullet.bulletPower === 0) {
      changeGameState({ action: "delete bullet", payload: thisBullet });
    }
  }
}

export function spawnBulletIfFiring(ship: Ship): void {
  const shipGun: Gun | null = ship.gun;
  if (ship.state === "active" && shipGun && shipGun.state === "firing") {
    const { bulletPosition, bulletVelocity } =
      shipGun.getInitialMotionStateOfBullet();
    const bullet = new Bullet({
      initialPosition: bulletPosition,
      velocity: bulletVelocity,
      bulletSpecs,
    });
    changeGameState({ action: "add bullet", payload: bullet });
  }
}

// getState is called fresh on each outer loop iteration so that bullets deleted
// earlier in the same frame are not tested against subsequent rocks.
export function processCollisions(
  ship: Ship,
  rocksSnapshot: Rocks,
  getState: () => GameState,
): void {
  for (const rockId in rocksSnapshot) {
    let hasRockCollided = false;
    const thisRock = rocksSnapshot[rockId];

    for (const bulletId in getState().bullets) {
      const thisBullet = getState().bullets[bulletId];
      hasRockCollided = testCollision(
        thisRock.boundary(),
        thisBullet.boundary(),
      );
      if (hasRockCollided) {
        changeGameState({ action: "delete bullet", payload: thisBullet });
        break;
      }
    }

    // Only check ship collision if no bullet hit was found this frame.
    if (!hasRockCollided && ship.state === "active") {
      hasRockCollided = testCollision(thisRock.boundary(), ship.boundary());
      if (hasRockCollided) {
        changeGameState({ action: "delete ship" });
        removeShipControlEvents();
      }
    }

    // Remove the rock, update score, and spawn smaller rocks regardless of
    // whether the collision was with a bullet or the ship.
    if (hasRockCollided) {
      const rockSize = thisRock.size;
      const valueOfRock = rockType[rockSize].value;
      changeGameState({ action: "score", payload: valueOfRock });
      explodeRock(rocksSnapshot[rockId], getState().level);
    }
  }
}

// Advance to the next level when all rocks are cleared. levelStartPending
// prevents this firing again on subsequent frames before the new rocks spawn.
export function checkLevelComplete(
  ship: Ship,
  gameScreen: Viewport,
  getState: () => GameState,
): void {
  const state = getState();
  if (
    Object.keys(state.rocks).length === 0 &&
    ship.state === "active" &&
    state.state === "playing" &&
    !state.levelStartPending
  ) {
    changeGameState({ action: "next level" });
    startLevel({
      level: getState().level,
      screenId: gameScreen.id,
      screenSize: gameScreen.size,
    });
  }
}

export function gameLoopUpdate(
  gameScreen: Viewport,
  dt: number,
  getState: () => GameState,
) {
  if (!getState().ship) {
    return;
  }

  const ship = getState().ship!;
  if (ship.state === "active") {
    changeGameState({ action: "ship actions", payload: getShipActions() });
  }
  updateMotionStates(getState(), gameScreen, dt);

  // Snapshot bullets before expiry check so deletions don't affect iteration.
  // Runs before the destroyed check so bullets fired just before ship death
  // are still cleaned up if the game transitions to gameover this frame.
  expireOldBullets({ ...getState().bullets });

  // Once destroyed, dispatch gameover once and stop processing further updates.
  // The guard on state.state prevents gameover being dispatched every frame
  // while the loop continues running to keep rocks animating on the end screen.
  if (ship.state === "destroyed") {
    if (getState().state === "playing") {
      changeGameState({ action: "state", payload: "gameover" });
    }
    return;
  }

  spawnBulletIfFiring(ship);

  // Snapshot rocks at the start of the frame so the loop isn't affected by rocks
  // being deleted mid-iteration when a collision is detected.
  processCollisions(ship, { ...getState().rocks }, getState);

  checkLevelComplete(ship, gameScreen, getState);
}
