import { RockSpec } from "../assets/gamedata";
import { convertDegreestoRadians } from "../utils/maths";

// functions that reply on random numbers
// the result of these functions can not be determined in user tests so they are packages up in to this file

const getRandomInt = (n: number): number => Math.floor(Math.random() * (n + 1));

function getRandomNumberInRange(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function getRandomEdgePosition(
  edge: string,
  screenSize: { screenWidth: number; screenHeight: number },
): { x: number; y: number } {
  switch (edge) {
    case "top":
      return { x: getRandomInt(screenSize.screenWidth), y: 0 };
    case "right":
      return {
        x: screenSize.screenWidth,
        y: getRandomInt(screenSize.screenHeight),
      };
    case "bottom":
      return {
        x: getRandomInt(screenSize.screenWidth),
        y: screenSize.screenHeight,
      };
    case "left":
      return { x: 0, y: getRandomInt(screenSize.screenHeight) };
  }
  return { x: getRandomInt(screenSize.screenWidth), y: 0 };
}

function getRandomRockProps(rockProps: RockSpec) {
  let speed = getRandomNumberInRange(rockProps.speed.min, rockProps.speed.max);
  let r = getRandomNumberInRange(rockProps.radius.min, rockProps.radius.max);
  // choose a random direction but avoid angles within 15 degrees to vertical or horizontal
  let directionDegrees = getRandomNumberInRange(15, 75);
  let quadrant = 90 * Math.floor(Math.random() * 4);
  const directionRadians = convertDegreestoRadians(directionDegrees + quadrant);
  let rotationRate = getRandomNumberInRange(
    rockProps.rotationRate.min,
    rockProps.rotationRate.max,
  );
  rotationRate = Math.random() > 0.5 ? rotationRate : -rotationRate;
  const rotationRateRadians = convertDegreestoRadians(rotationRate);
  let velocity = { speed, direction: directionRadians };

  return { velocity, r, rotationRate: rotationRateRadians };
}

export { getRandomEdgePosition, getRandomRockProps };
