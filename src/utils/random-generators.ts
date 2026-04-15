import { EdgeSide } from "../types.ts";

export const getRandomInt = (n: number): number =>
  Math.floor(Math.random() * (n + 1));

export function getRandomNumberInRange(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

export function getRandomEdgePosition(
  edge: EdgeSide,
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
}
