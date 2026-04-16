import { EdgeSide, Size } from "../types.ts";

export const getRandomInt = (n: number): number =>
  Math.floor(Math.random() * (n + 1));

export function getRandomNumberInRange(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

export function getRandomEdgePosition(
  edge: EdgeSide,
  screenSize: Size,
): { x: number; y: number } {
  switch (edge) {
    case "top":
      return { x: getRandomInt(screenSize.width), y: 0 };
    case "right":
      return {
        x: screenSize.width,
        y: getRandomInt(screenSize.height),
      };
    case "bottom":
      return {
        x: getRandomInt(screenSize.width),
        y: screenSize.height,
      };
    case "left":
      return { x: 0, y: getRandomInt(screenSize.height) };
  }
}
