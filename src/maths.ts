import { Directions, Velocity } from "./modules/types";

function convertDegreestoRadians(degrees: number) {
  return (Math.PI / 180) * degrees;
}

function convertRadiansToDegrees(radians: number) {
  return +((180 / Math.PI) * radians).toFixed(1);
}

function getComponentVelocity(
  v1: Velocity,
  v2: Velocity,
): { dx: number; dy: number } {
  const v1x = v1.speed * Math.cos(v1.direction);
  const v1y = v1.speed * Math.sin(v1.direction);

  const v2x = v2.speed * Math.cos(v2.direction);
  const v2y = v2.speed * Math.sin(v2.direction);

  let dx = +(v1x + v2x).toFixed(1);
  let dy = +(v1y + v2y).toFixed(1);

  return { dx, dy };
}

//TODO: this provides direction basded on change of movement along x and y axis but it could also return speed as well therefore returning velocity
function getDirection(dx: number, dy: number): Directions {
  let direction: Directions = { radians: 0, degrees: 0 };
  let speed: number = 0;

  if (dx > 0) {
    direction.radians = Math.atan(dy / dx);
  } else if (dx < 0) {
    direction.radians = Math.PI + Math.atan(dy / dx);
  } else {
    if (dy < 0) {
      direction.radians = 1.5 * Math.PI;
    } else if (dy > 0) {
      direction.radians = Math.PI / 2;
    } else {
      direction.radians = 1.5 * Math.PI;
    }
  }

  direction.degrees = convertRadiansToDegrees(direction.radians);
  return direction;
}

function changeRotation(
  rotationChange: number,
  currentRotation: number,
): Directions {
  const FULLDEGREE = 360;
  let rotation: Directions = { radians: 0, degrees: 0 };
  rotation.degrees = currentRotation + rotationChange;
  if (rotation.degrees < 0) {
    rotation.degrees += FULLDEGREE;
  } else if (rotation.degrees >= FULLDEGREE) {
    rotation.degrees -= FULLDEGREE;
  }
  rotation.radians = convertDegreestoRadians(rotation.degrees);
  return rotation;
}

export {
  convertDegreestoRadians,
  convertRadiansToDegrees,
  getComponentVelocity,
  getDirection,
  changeRotation,
};
