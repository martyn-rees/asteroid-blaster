import { expect, test } from "vitest";
import Gun from "./gun";

function setUp() {
  const gunSpec = {
    barrelOffset: { x: 0, y: 6 },
    muzzleSpeed: 6,
    reloadTime: 10,
  };
  return gunSpec;
}

test("create new gun", () => {
  const gunSpec = setUp();
  const gun = new Gun(gunSpec);
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
    muzzleSpeed: 6,
    reloadTime: 10,
    rotation: 0,
    state: "loaded",
    velocity: {
      direction: 0,
      speed: 0,
    },
  });
});

test("get motion state", () => {
  const gunSpec = setUp();
  const gun = new Gun(gunSpec);

  const motionstate = gun.updateMotionState({
    position: { x: 100, y: 100 },
    velocity: {
      speed: 0,
      direction: 0,
    },
    rotation: 10,
  });
  expect(gun.position).toStrictEqual({ x: 100, y: 100 });
  expect(gun.velocity).toStrictEqual({
    speed: 0,
    direction: 0,
  });
  expect(gun.rotation).toBe(10);
});

test("gun position on a ship (when pointing North then East)", () => {
  const gunSpec = setUp();
  const gun = new Gun(gunSpec);
  const motionStateNorth = {
    position: { x: 100, y: 100 },
    velocity: { speed: 0, direction: 0 },
    rotation: 0,
  };
  gun.updateMotionState(motionStateNorth);
  const gunLocation = gun.getGunPosition();
  // reversed y axis (screen coords) so going up decreses in value
  expect(gunLocation).toStrictEqual({ x: 100, y: 94 });

  const motionStateEast = {
    position: { x: 100, y: 100 },
    velocity: { speed: 0, direction: 0 },
    rotation: Math.PI / 2,
  };
  gun.updateMotionState(motionStateEast);
  const locationAfterRotation = gun.getGunPosition();
  // reversed y axis (screen coords) so going down increases in value
  expect(locationAfterRotation).toStrictEqual({ x: 106, y: 100 });
});

test("get velocity of bullet when ship's gun is fired", () => {
  const gunSpec = setUp();
  const gun = new Gun(gunSpec);
  // when ship is stationary and pointing North
  const shipVelocity = { speed: 0, direction: 0 };
  const shipRotationNorth = 0;
  const bulletDxDy = gun.getBulletDxDy(shipVelocity, shipRotationNorth);
  expect(bulletDxDy).toStrictEqual({ dx: 0, dy: 6 });
  // when ship is moving North at 2 pixels per frame
  const shipVelocity2 = { speed: 2, direction: 0 };
  const bulletVelocity2 = gun.getBulletDxDy(shipVelocity2, shipRotationNorth);
  expect(bulletVelocity2).toStrictEqual({ dx: 0, dy: 6 });
});

test("when gun is fired it is not reloaded until reload time has passed", () => {
  const gunSpec = setUp();
  gunSpec.reloadTime = 3;
  const gun = new Gun(gunSpec);
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
