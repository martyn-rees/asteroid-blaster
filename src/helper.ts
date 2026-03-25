import { Circle, Position } from "./modules/types";

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
  transformX?: Function,
  transformY?: Function,
): Position {
  const x = transformX ? transformX(position.x) : position.x;
  const y = transformY ? transformY(position.y) : position.y;
  return { x, y };
}

// alternatrive to warping to other side of screen
/*bounceOffWalls(screenWidth, screenHeight) {
    if (this.x - this.r < 0) {
      this.velocity.dx = Math.abs(this.velocity.dx);
    } else if (this.x + this.r > screenWidth) {
      this.velocity.dx = -Math.abs(this.velocity.dx);
    }
    if (this.y - this.r < 0) {
      this.velocity.dy = Math.abs(this.velocity.dy);
    } else if (this.y + this.r > screenHeight) {
      this.velocity.dy = -Math.abs(this.velocity.dy);
    }
  }*/

// position: {x,y} - the position of the object that has gone off the screen
// boundingBox: {w,h} - the width and height of the game screen
export const translateToOppositeSideIfOutside = (
  position: Position,
  boundingBox: { w: number; h: number },
) => {
  let newPosition = { x: position.x, y: position.y };
  if (newPosition.x < 0) {
    newPosition.x = boundingBox.w + newPosition.x;
  } else if (newPosition.x > boundingBox.w) {
    newPosition.x = newPosition.x - boundingBox.w;
  }
  if (newPosition.y < 0) {
    newPosition.y = boundingBox.h + newPosition.y;
  } else if (newPosition.y > boundingBox.h) {
    newPosition.y = newPosition.y - boundingBox.h;
  }
  return newPosition;
};

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
