// reversed y axis (screen coords) so going up decreses in value
// angeles: north: 0, east: PI/2, south: PI,
import { expect, test } from "vitest";
import Gun from "./gun";

function setUpGun() {
  const gunSpec = {
    barrelOffset: { x: 0, y: 6 },
    muzzleSpeed: 4,
    reloadTime: 3,
  };
  const gun = new Gun(gunSpec);
  return gun;
}

test("create new gun", () => {
  const gun = setUpGun();
  expect(gun).toEqual({
    barrelOffset: {
      x: 0,
      y: 6,
    },
    gunReloadTimer: 0,
    position: {
      x: 0,
      y: 0,
    },
    muzzleSpeed: 4,
    reloadTime: 3,
    rotation: 0,
    state: "loaded",
    velocity: {
      direction: 0,
      speed: 0,
    },
  });
});

test("set motion state", () => {
  const gun = setUpGun();

  gun.updateMotionState({
    position: { x: 100, y: 100 },
    velocity: {
      speed: 0,
      direction: 0,
    },
    rotation: 0,
  });
  expect(gun.position).toStrictEqual({ x: 100, y: 100 });
  expect(gun.velocity).toStrictEqual({
    speed: 0,
    direction: 0,
  });
  expect(gun.rotation).toBe(0);
});

test("gun and muzzle position when pointing North", () => {
  const gun = setUpGun();
  const motionStateNorth = {
    position: { x: 100, y: 100 },
    velocity: { speed: 0, direction: 0 },
    rotation: 0,
  };
  gun.updateMotionState(motionStateNorth);
  const muzzleLocation = gun.getMuzzlePosition();
  expect(gun.position).toStrictEqual({ x: 100, y: 100 });
  expect(muzzleLocation).toStrictEqual({ x: 100, y: 94 });
});

test("gun and muzzle position when pointing East", () => {
  const gun = setUpGun();
  gun.updateMotionState({
    position: { x: 100, y: 100 },
    velocity: { speed: 0, direction: 0 },
    rotation: Math.PI / 2,
  });
  expect(gun.position).toStrictEqual({ x: 100, y: 100 });
  const muzzleLocation = gun.getMuzzlePosition();
  expect(muzzleLocation).toStrictEqual({ x: 106, y: 100 });
});

test("gun and muzzle position when pointing East but moving South", () => {
  const gun = setUpGun();
  gun.updateMotionState({
    position: { x: 100, y: 100 },
    velocity: { speed: 3, direction: Math.PI },
    rotation: Math.PI / 2,
  });
  expect(gun.position).toStrictEqual({ x: 100, y: 100 });
  const muzzleLocation = gun.getMuzzlePosition();
  expect(muzzleLocation).toStrictEqual({ x: 106, y: 100 });
});

test("get velocity of bullet when gun is fired while stationary and pointing North", () => {
  const gun = setUpGun();
  // gun is stationary and pointing North (rotation 180)
  gun.updateMotionState({
    position: { x: 100, y: 100 },
    velocity: { speed: 0, direction: 0 },
    rotation: 0,
  });
  let { bulletPosition, bulletDxDy, bulletVelocity } =
    gun.getInitialMotionStateOfBullet();
  expect(gun.position).toStrictEqual({ x: 100, y: 100 });
  const muzzleLocation = gun.getMuzzlePosition();
  expect(muzzleLocation).toStrictEqual({ x: 100, y: 94 });

  //expect(bulletDxDy).toStrictEqual({ dx: 0, dy: -4 });
  expect(bulletPosition).toStrictEqual({ x: 100, y: 94 });
  //expect(bulletVelocity).toStrictEqual({ speed: 0, direction: 0 });
});

/*test("get velocity of bullet when gun is fired while moving South and point South", () => {
  const gun = setUpGun();
  // gun is stationary and pointing North (rotation 180)
  gun.updateMotionState({
    position: { x: 100, y: 100 },
    velocity: { speed: 2, direction: Math.PI },
    rotation: Math.PI,
  });
  let { bulletPosition, bulletDxDy, bulletVelocity } =
    gun.getInitialMotionStateOfBullet();
  //const shipVelocity2 = { speed: 2, direction: 0 };
  const gunFrame2 = gun.getInitialMotionStateOfBullet();
  //const bulletVelocity2 = gun.getBulletDxDy(shipVelocity2, shipRotationNorth);
  //expect(gunFrame2.bulletDxDy).toStrictEqual({ dx: 0, dy: 8 });
  //expect(bulletDxDy).toStrictEqual({ dx: 0, dy: -6 });
  expect(gunFrame2.bulletPosition).toStrictEqual({ x: 100, y: 96 });
});*/

test("when gun is fired it is not reloaded until reload time has passed", () => {
  const gun = setUpGun();
  // gun is loaded at start
  expect(gun.state).toBe("loaded");
  gun.update(true);
  expect(gun.state).toBe("firing");
  // reload gun after being fired
  gun.reloadGun();
  gun.update();
  gun.update();
  expect(gun.state).toBe("reloading");
  // when updates = reload time then gun is loaded again
  gun.update();
  expect(gun.state).toBe("loaded");
});
