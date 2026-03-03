// TODO: rewrite so this accepts location and screen coords and returns new location if off edge of screen
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

// position: {x,y} - the position of the object that has gone off the screen
// boundingBox: {w,h} - the width and height of the game screen
/*export const translateToOppositeSideIfOutside = (position, boundingBox) => {
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
};*/

// p1 and p2 are objects with x and y properties
const distanceBetweenPoints = (
  p1: { x: number; y: number },
  p2: { x: number; y: number },
) => {
  let dx = p1.x - p2.x;
  let dy = p1.y - p2.y;
  return Math.sqrt(dx * dx + dy * dy);
};

// c1 and c2 are objects with x, y and r properties
export const testCollision = (
  c1: { x: number; y: number; r: number },
  c2: { x: number; y: number; r: number },
) => {
  let minDistance = c1.r + c2.r;
  return distanceBetweenPoints(c1, c2) < minDistance ? true : false;
};
