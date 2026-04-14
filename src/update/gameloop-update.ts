import {
  gameState,
  changeGameState,
  GameState,
  Rocks,
  Bullets,
} from "../state/game-state.ts";
import Gun from "../entities/gun.ts";
import Bullet from "../entities/bullet.ts";
import { bulletSpecs, rockType } from "../assets/gamedata.ts";
import { constrainNumber, testCollision } from "../utils/maths.ts";
import { explodeRock, addNewRocksForNewLevel } from "../entities/rock-factory.ts";
import { getShipActions } from "../input/ship-actions.ts";
import Viewport from "../entities/viewport.ts";
import { addToScreen, removeFromScreen, createElement } from "../render/dom-render.ts";
function updateMotionStates(
  gameState: GameState,
  gameScreen: Viewport,
  dt: number,
) {
  const { ship, bullets, rocks } = gameState;
  // use constrainNumber as a callback in update method of ship, rock and bullet classes instead of passing in gameScreen dimensions
  const warpPosition = ({ x, y }: { x: number; y: number }) => ({
    x: constrainNumber(x, 0, gameScreen.width),
    y: constrainNumber(y, 0, gameScreen.height),
  });

  // update ship position based on motion state
  ship!.update(warpPosition, dt);

  // update position of bullet based on motion state
  for (const bulletId in bullets) {
    bullets[bulletId].update(warpPosition, dt);
  }

  // update position of rock based on motion state
  for (const rockId in rocks) {
    const thisRock = rocks[rockId];
    thisRock.update(warpPosition, dt);
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

  // remove bullets that have expired — must run before the destroyed check so
  // bullets fired just before ship death are still cleaned up during gameover
  const currentBullets: Bullets = { ...gameState.bullets };
  for (const bulletId in currentBullets) {
    const thisBullet = currentBullets[bulletId];
    if (thisBullet.bulletPower === 0) {
      changeGameState({ action: "delete bullet", payload: thisBullet });
    }
  }

  // guard ensures gameover is only dispatched once — without it, the game loop
  // continuing in gameover state would dispatch it every frame
  if (ship.state === "destroyed") {
    if (gameState.state === "playing") {
      changeGameState({ action: "state", payload: "gameover" });
    }
    return { gameState };
  }

  // - add new bullets - if ACTION.shoot
  const shipGun: Gun | null = ship.gun;
  if (ship.state === "active" && shipGun && shipGun.state === "firing") {
    // get position of gun attached to ship as the starting position of new bullet
    const { bulletPosition, bulletVelocity } =
      shipGun.getInitialMotionStateOfBullet();
    const bullet = new Bullet({
      initialPosition: bulletPosition,
      velocity: bulletVelocity,
      bulletSpecs,
    });
    changeGameState({ action: "add bullet", payload: bullet });
  }

  // currentRocks and currentBullets are array copies so not using the gameState arrays directly as the gameState arrays get updated inside the loop
  const currentRocks: Rocks = { ...gameState.rocks };
  // test each rock for collision with bullets and ship
  for (const rockId in currentRocks) {
    let hasRockCollided: boolean = false;
    const thisRock = currentRocks[rockId];
    // test rock against each bullet until collision is found - if collision then remove bullet and record a collision has happened and break out of bullet loop
    // BUG: it's possible that a bullet can hit 2 rocks if using currentBullets above. The alternative is to use gameState.bullets directly but this array also
    // gets amended if a bullet hits a rock
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
    // if the rock has not collided with a bullet then check if it has collided with the ship
    if (!hasRockCollided && ship.state === "active") {
      hasRockCollided = testCollision(thisRock.boundary(), ship.boundary());
      if (hasRockCollided) {
        changeGameState({ action: "delete ship" });
      }
    }
    // if collision with bullet or ship then remove rock, add score and add smaller rocks if needed
    if (hasRockCollided) {
      const rockSize = thisRock.size;
      const valueOfRock = rockType[rockSize].value;
      changeGameState({ action: "score", payload: valueOfRock });
      explodeRock(currentRocks[rockId]);
    }
  }

  // detect when all rocks are cleared while the ship is still active
  if (
    Object.keys(gameState.rocks).length === 0 &&
    ship.state === "active" &&
    gameState.state === "playing" &&
    !gameState.nextLevelPending
  ) {
    changeGameState({ action: "next level" });
    const level = gameState.level;
    const announcement = createElement(
      "levelAnnouncement",
      "level-announcement press-start-2p-regular",
      null,
      null,
    );
    announcement.textContent = `LEVEL ${level}`;
    addToScreen(announcement, gameScreen.id);
    setTimeout(() => {
      removeFromScreen("levelAnnouncement");
      if (gameState.state === "playing") {
        addNewRocksForNewLevel({
          rockAmount: Math.min(2 + level * 2, 16),
          screenSize: gameScreen.dimensions,
        });
      }
      changeGameState({ action: "clear level pending" });
    }, 2000);
  }

  return { gameState };
}
