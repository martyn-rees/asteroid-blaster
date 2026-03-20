import { Directions, Position, Velocity } from "./modules/types";

function convertDegreestoRadians(degrees: number) {
  return (Math.PI / 180) * degrees;
}

function convertRadiansToDegrees(radians: number) {
  return +((180 / Math.PI) * radians).toFixed(1);
}

function getNewPosition(position: Position, velocity: Velocity): Position {
  const dx = velocity.speed * Math.cos(velocity.direction);
  const dy = velocity.speed * Math.sin(velocity.direction);
  return {
    x: position.x + dx,
    y: position.y + dy,
  };
}

// calculate new position of a point attached to another object
// position and rotation are for main object
// offset is the position of the attached point relative to the main object when the main object is at rotation 0
// TODO: refactor to use getNewPosition
export function getNewPositionWithOffset(
  position: Position,
  rotation: number,
  offset: Position,
): Position {
  const dx = offset.x;
  const dy = offset.y;
  const offsetLength = Math.sqrt(dx * dx + dy * dy);
  const offsetAngle = getDirectionRadians(dx, dy);

  const offsetVector = {
    x: offsetLength * Math.cos(offsetAngle + rotation),
    y: offsetLength * Math.sin(offsetAngle + rotation),
  };

  const x = parseFloat((position.x + offsetVector.x).toFixed(1));
  const y = parseFloat((position.y + offsetVector.y).toFixed(1));
  return { x, y };
}

function getComponentVelocity(
  v1: Velocity,
  v2: Velocity,
): { dx: number; dy: number } {
  // javascript math issues
  // NB: if direction is North (degrees:270, radians: 1.5 * Math.PI) then Math.cos(v1.direction) can be close to -0.000000000001 instead of 0
  const v1x = v1.speed * Math.cos(v1.direction);
  const v1y = v1.speed * Math.sin(v1.direction);

  const v2x = v2.speed * Math.cos(v2.direction);
  const v2y = v2.speed * Math.sin(v2.direction);

  let dx = +(v1x + v2x).toFixed(3);
  let dy = +(v1y + v2y).toFixed(3);

  return { dx, dy };
}

// calculate new speed and direction
function calculateNewVelocity(
  v1: Velocity,
  v2: Velocity,
  maxSpeed: number,
): Velocity {
  let { dx, dy } = getComponentVelocity(v1, v2);
  // shipSpeed
  let speed = Math.sqrt(dx * dx + dy * dy);
  if (speed > maxSpeed) {
    speed = maxSpeed;
  }

  const radians = getDirectionRadians(dx, dy);
  return { speed: speed, direction: radians };
}

//TODO: this provides direction basded on change of movement along x and y axis but it could also return speed as well therefore returning velocity
function getDirectionRadians(dx: number, dy: number): number {
  let radians = 0;

  if (dx > 0) {
    radians = Math.atan(dy / dx);
  } else if (dx < 0) {
    radians = Math.PI + Math.atan(dy / dx);
  } else {
    if (dy < 0) {
      radians = 1.5 * Math.PI;
    } else if (dy > 0) {
      radians = Math.PI / 2;
    } else {
      radians = 1.5 * Math.PI;
    }
  }

  return radians;
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
  calculateNewVelocity,
  convertDegreestoRadians,
  convertRadiansToDegrees,
  getComponentVelocity,
  getNewPosition,
  getDirectionRadians,
  changeRotation,
};
