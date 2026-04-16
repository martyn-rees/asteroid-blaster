import { Position, Velocity } from "../types.ts";

const DECIMAL_PLACES = 3;
const round = (n: number): number => +n.toFixed(DECIMAL_PLACES);

export function getNewPosition(
  position: Position,
  velocity: Velocity,
  deltaTime: number = 1,
): Position {
  const dx = velocity.speed * Math.cos(velocity.direction) * deltaTime;
  const dy = velocity.speed * Math.sin(velocity.direction) * deltaTime;
  let x = round(position.x + dx);
  let y = round(position.y + dy);
  return { x, y };
}

// calculate new position of a point attached to another object
// position and rotation are for main object
// offset is the position of the attached point relative to the main object when the main object is at rotation 0
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

  const x = round(position.x + offsetVector.x);
  const y = round(position.y + offsetVector.y);
  return { x, y };
}

export function getComponentVelocity(
  v1: Velocity,
  v2: Velocity,
): { dx: number; dy: number } {
  // javascript math issues
  // NB: if direction is North (degrees:270, radians: 1.5 * Math.PI) then Math.cos(v1.direction) can be close to -0.000000000001 instead of 0
  const v1x = v1.speed * Math.cos(v1.direction);
  const v1y = v1.speed * Math.sin(v1.direction);

  const v2x = v2.speed * Math.cos(v2.direction);
  const v2y = v2.speed * Math.sin(v2.direction);

  let dx = round(v1x + v2x);
  let dy = round(v1y + v2y);

  return { dx, dy };
}

// calculate new speed and direction
export function calculateNewVelocity(
  v1: Velocity,
  v2: Velocity,
  maxSpeed: number,
): Velocity {
  let { dx, dy } = getComponentVelocity(v1, v2);
  let speed = Math.sqrt(dx * dx + dy * dy);
  if (speed > maxSpeed) {
    speed = maxSpeed;
  }

  const radians = getDirectionRadians(dx, dy);
  return { speed: speed, direction: radians };
}

export function getDirectionRadians(dx: number, dy: number): number {
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

export function changeRotation(
  rotationChange: number,
  currentRotation: number,
  format: "degrees" | "radians" = "radians",
): number {
  const maxAngle = format === "degrees" ? 360 : 2 * Math.PI;
  let rotation = currentRotation + rotationChange;
  if (rotation < 0) {
    rotation += maxAngle;
  } else if (rotation >= maxAngle) {
    rotation -= maxAngle;
  }
  return rotation;
}
