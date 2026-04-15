import { RockSpec } from "../assets/game-entity-specs.ts";
import { convertDegreesToRadians } from "../utils/maths-motionstate.ts";
import { getRandomNumberInRange } from "../utils/random-generators.ts";

// functions that rely on random numbers
// the results of these functions cannot be determined in tests so they are packaged
// in to this file to make the random dependency easy to mock
export function getRandomRockProps(rockProps: RockSpec) {
  let speed = getRandomNumberInRange(rockProps.speed.min, rockProps.speed.max);
  let r = getRandomNumberInRange(rockProps.radius.min, rockProps.radius.max);
  // choose a random direction but avoid angles within 15 degrees to vertical or horizontal
  let directionDegrees = getRandomNumberInRange(15, 75);
  let quadrant = 90 * Math.floor(Math.random() * 4);
  const directionRadians = convertDegreesToRadians(directionDegrees + quadrant);
  let rotationRate = getRandomNumberInRange(
    rockProps.rotationRate.min,
    rockProps.rotationRate.max,
  );
  rotationRate = Math.random() > 0.5 ? rotationRate : -rotationRate;
  const rotationRateRadians = convertDegreesToRadians(rotationRate);
  let velocity = { speed, direction: directionRadians };

  return { velocity, r, rotationRate: rotationRateRadians };
}
