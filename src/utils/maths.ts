import { BoundaryTransform, Circle, Position } from "../entities/types.ts";

export const constrainNumber = (
  n: number,
  min: number,
  max: number,
): number => {
  let constrainedNumber = n;
  if (n < min) {
    constrainedNumber = max + n;
  } else if (n > max) {
    constrainedNumber = n - max;
  }
  return constrainedNumber;
};

// transform functions are used to keep the a position within the playing field.
// For example, if the position goes off the right edge of the screen it can be transformed to the left edge of the screen and vice versa.
// This is done by passing in a transform function that takes a position and returns a new position that is within the playing field.
export function transform(
  position: Position,
  transformX?: BoundaryTransform,
  transformY?: BoundaryTransform,
): Position {
  const x = transformX ? transformX(position.x) : position.x;
  const y = transformY ? transformY(position.y) : position.y;
  return { x, y };
}

// p1 and p2 are objects with x and y properties
const distanceBetweenPoints = (p1: Circle, p2: Circle): number => {
  let dx = p1.x - p2.x;
  let dy = p1.y - p2.y;
  return Math.sqrt(dx * dx + dy * dy);
};

// c1 and c2 are objects with x, y and r properties
export const testCollision = (c1: Circle, c2: Circle): boolean => {
  let minDistance = c1.r + c2.r;
  return distanceBetweenPoints(c1, c2) < minDistance ? true : false;
};
