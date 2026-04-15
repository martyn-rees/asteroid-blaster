// reversed y axis (screen coords) so going up decreases in value
// angles: north: 0, east: PI/2, south: PI
import { beforeEach, expect, test } from "vitest";
import Gun from "./gun.ts";
import { MotionState, Position } from "../types.ts";

function setUpGun(): Gun {
  const gunSpec = {
    muzzleOffset: { x: 6, y: 0 },
    muzzleSpeed: 4,
    reloadTime: 3,
  };
  return new Gun(gunSpec);
}

// Gun.position is private — cast to access it in tests
function gunPosition(gun: Gun): Position {
  return (gun as unknown as { position: Position }).position;
}

beforeEach(() => {
  Gun.gunIDCounter = 0;
});

test("create new gun", () => {
  const gun = setUpGun();
  expect(gun).toEqual({
    id: "gun0",
    muzzleOffset: { x: 6, y: 0 },
    gunReloadTimer: 0,
    position: { x: 0, y: 0 },
    muzzleSpeed: 4,
    reloadTime: 3,
    rotation: 0,
    state: "loaded",
    velocity: { direction: 0, speed: 0 },
  });
});

test("gun and muzzle position when pointing North", () => {
  const gun = setUpGun();
  gun.motionState = {
    position: { x: 100, y: 100 },
    velocity: { speed: 0, direction: 1.5 * Math.PI },
    rotation: 1.5 * Math.PI,
  } as MotionState;
  expect(gunPosition(gun)).toStrictEqual({ x: 100, y: 100 });
  expect(gun.muzzlePosition).toStrictEqual({ x: 100, y: 94 });
});

test("gun and muzzle position when pointing East", () => {
  const gun = setUpGun();
  gun.motionState = {
    position: { x: 100, y: 100 },
    velocity: { speed: 0, direction: 0 },
    rotation: 0,
  } as MotionState;
  expect(gunPosition(gun)).toStrictEqual({ x: 100, y: 100 });
  expect(gun.muzzlePosition).toStrictEqual({ x: 106, y: 100 });
});

test("gun and muzzle position when pointing East but moving South", () => {
  const gun = setUpGun();
  gun.motionState = {
    position: { x: 100, y: 100 },
    velocity: { speed: 3, direction: Math.PI / 2 },
    rotation: 0,
  } as MotionState;
  expect(gunPosition(gun)).toStrictEqual({ x: 100, y: 100 });
  expect(gun.muzzlePosition).toStrictEqual({ x: 106, y: 100 });
});

test("get velocity of bullet when gun is fired while stationary and pointing North", () => {
  const gun = setUpGun();
  gun.motionState = {
    position: { x: 100, y: 100 },
    velocity: { speed: 0, direction: 0 },
    rotation: 1.5 * Math.PI,
  } as MotionState;
  const { bulletPosition, bulletVelocity } =
    gun.getInitialMotionStateOfBullet();
  expect(gunPosition(gun)).toStrictEqual({ x: 100, y: 100 });
  expect(gun.muzzlePosition).toStrictEqual({ x: 100, y: 94 });
  expect(bulletPosition).toStrictEqual({ x: 100, y: 94 });
  expect(bulletVelocity).toStrictEqual({ speed: 4, direction: 1.5 * Math.PI });
});

test("get velocity of bullet when gun is fired while moving South and pointing South", () => {
  const gun = setUpGun();
  gun.motionState = {
    position: { x: 100, y: 100 },
    velocity: { speed: 2, direction: Math.PI / 2 },
    rotation: Math.PI / 2,
  } as MotionState;
  const { bulletPosition } = gun.getInitialMotionStateOfBullet();
  expect(bulletPosition).toStrictEqual({ x: 100, y: 106 });
});

test("when gun is fired it is not reloaded until reload time has passed", () => {
  const gun = setUpGun();
  expect(gun.state).toBe("loaded");
  gun.update(true);
  expect(gun.state).toBe("firing");
  gun.reloadGun();
  gun.update(false);
  gun.update(false);
  expect(gun.state).toBe("reloading");
  gun.update(false);
  expect(gun.state).toBe("loaded");
});
