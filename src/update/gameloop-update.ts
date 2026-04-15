import {
  gameState,
  changeGameState,
  GameState,
  Rocks,
  Bullets,
} from "../state/game-state.ts";
import Gun from "../entities/gun.ts";
import Bullet from "../entities/bullet.ts";
import { bulletSpecs, rockType } from "../assets/game-entity-specs.ts";
import { constrainNumber, testCollision } from "../utils/maths.ts";
import { explodeRock } from "../entities/rock-factory.ts";
import { startLevel } from "../ui/level-start.ts";
import { getShipActions } from "../input/ship-actions.ts";
import Viewport from "../entities/viewport.ts";
function updateMotionStates(
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

export function gameLoopUpdate(gameScreen: Viewport, dt: number) {
  if (!gameState.ship) {
    return { gameState };
  }

  const ship = gameState.ship;
  if (ship.state === "active") {
    changeGameState({ action: "ship actions", payload: getShipActions() });
  }
  updateMotionStates(gameState, gameScreen, dt);

  // Snapshot bullets before expiry check so deletions don't affect iteration.
  // Runs before the destroyed check so bullets fired just before ship death
  // are still cleaned up if the game transitions to gameover this frame.
  const currentBullets: Bullets = { ...gameState.bullets };
  for (const bulletId in currentBullets) {
    const thisBullet = currentBullets[bulletId];
    if (thisBullet.bulletPower === 0) {
      changeGameState({ action: "delete bullet", payload: thisBullet });
    }
  }

  // Once destroyed, dispatch gameover once and stop processing further updates.
  // The guard on gameState.state prevents gameover being dispatched every frame
  // while the loop continues running to keep rocks animating on the end screen.
  if (ship.state === "destroyed") {
    if (gameState.state === "playing") {
      changeGameState({ action: "state", payload: "gameover" });
    }
    return { gameState };
  }

  // Spawn a bullet from the gun muzzle when the ship is firing.
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

  // Snapshot rocks at the start of the frame so the loop isn't affected by rocks
  // being deleted mid-iteration when a collision is detected.
  const currentRocks: Rocks = { ...gameState.rocks };

  for (const rockId in currentRocks) {
    let hasRockCollided: boolean = false;
    const thisRock = currentRocks[rockId];

    // Test this rock against each live bullet. Iterates gameState.bullets directly
    // (not a snapshot) so that bullets deleted earlier in this loop aren't tested again.
    // Known edge case: a fast-moving bullet could register a hit on two rocks in the
    // same frame if it overlaps both simultaneously. Fixing this would require a
    // per-frame set of consumed bullet IDs, which adds complexity for a rare case.
    for (const bulletId in gameState.bullets) {
      const thisBullet = gameState.bullets[bulletId];
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
      }
    }
    // Remove the rock, update score, and spawn smaller rocks regardless of
    // whether the collision was with a bullet or the ship.
    if (hasRockCollided) {
      const rockSize = thisRock.size;
      const valueOfRock = rockType[rockSize].value;
      changeGameState({ action: "score", payload: valueOfRock });
      explodeRock(currentRocks[rockId], gameState.level);
    }
  }

  // Advance to the next level when all rocks are cleared. nextLevelPending
  // prevents this firing again on subsequent frames before the new rocks spawn.
  if (
    Object.keys(gameState.rocks).length === 0 &&
    ship.state === "active" &&
    gameState.state === "playing" &&
    !gameState.nextLevelPending
  ) {
    changeGameState({ action: "next level" });
    startLevel({
      level: gameState.level,
      screenId: gameScreen.id,
      screenSize: gameScreen.dimensions,
    });
  }

  return { gameState };
}
