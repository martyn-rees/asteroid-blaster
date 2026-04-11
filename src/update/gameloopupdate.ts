import {
  gameState,
  changeGameState,
  GameState,
  Rocks,
  Bullets,
} from "../state/gameState";
import Gun from "../entities/gun";
import Bullet from "../entities/bullet";
import { bulletSpecs, rockType } from "../assets/gamedata";
import { constrainNumber, testCollision } from "../utils/helper";
import { explodeRock } from "../entities/rock-factory";
import { getShipActions } from "../input/ship-actions";
import Viewport from "../entities/viewport";
function updateMotionStates(gameState: GameState, gameScreen: Viewport, dt: number) {
  const { ship, bullets, rocks } = gameState;
  // use constrainNumber as a callback in update method of ship, rock and bullet classes instead of passing in gameScreen dimensions
  const warpX = (x: number) => constrainNumber(x, 0, gameScreen.width);
  const warpY = (y: number) => constrainNumber(y, 0, gameScreen.height);

  // update ship position based on motion state
  ship!.update(warpX, warpY, dt);

  // update position of bullet based on motion state
  for (var bulletId in bullets) {
    bullets[bulletId].update(warpX, warpY, dt);
  }

  // update position of rock based on motion state
  for (var rock in rocks) {
    const thisRock = rocks[rock];
    thisRock.update(warpX, warpY, dt);
  }
}

export function gameLoopUpdate(gameScreen: Viewport, dt: number) {
  const ship = gameState.ship!;
  if (ship.state === "active") {
    changeGameState({ action: "ship actions", payload: getShipActions() });
  }
  updateMotionStates(gameState, gameScreen, dt);

  if (ship.state === "destroyed") {
    changeGameState({ action: "state", payload: "gameover" });
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

  // - remove dead bullets - if power <= 0
  // this could be moved to collision function where it loops over bullets to save looping over bullets twice but for now its kept separate for clarity
  // this also changes gameState.bullets as action: "delete bullet" removes any dead bullets from gameState.bullets so this should return the new array
  const currentBullets: Bullets = { ...gameState.bullets };
  for (var bulletId in currentBullets) {
    const thisBullet = currentBullets[bulletId];
    if (thisBullet.bulletPower === 0) {
      changeGameState({ action: "delete bullet", payload: thisBullet });
    }
  }

  // currentRocks and currentBullets are array copies so not using the gameState arrays directly as the gameState arrays get updated inside the loop
  const currentRocks: Rocks = { ...gameState.rocks };
  // test each rock for collision with bullets and ship
  for (var rockId in currentRocks) {
    let hasRockCollided: boolean = false;
    const thisRock = currentRocks[rockId];
    // test rock against each bullet until collision is found - if collision then remove bullet and record a collision has happened and break out of bullet loop
    // BUG: it's possible that a bullet can hit 2 rocks if using currentBullets above. The alternative is to use gameState.bullets directly but this array also
    // gets amended if a bullet hits a rock
    for (var bulletId in gameState.bullets) {
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
      hasRockCollided = testCollision(
        thisRock.boundary(),
        ship.boundary(),
      );
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

  return { gameState };
}
