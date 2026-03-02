import { expect, test } from "vitest";
import Gun from "./gun";

function setUp() {
  const gunSpec = {
    barrelLocation: { x: 0, y: 6 },
    speed: 6,
    reloadTime: 10,
  };
  return gunSpec;
}

test("create new gun", () => {
  const gunSpec = setUp();
  const gun = new Gun(gunSpec);
  expect(gun).toEqual({
    gunSpecs: { barrelLocation: { x: 0, y: 6 }, speed: 6, reloadTime: 10 },
    gunReloadTimer: 0,
    state: "loaded",
  });
});

test("gun position on a ship (when pointing North then East)", () => {
  const gunSpec = setUp();
  const gun = new Gun(gunSpec);
  const location = { x: 100, y: 100 };
  const shipRotationNorth = 0;
  const gunLocation = gun.getGunPosition({
    location,
    rotation: shipRotationNorth,
  });
  // TODO: reversed y axis.
  expect(gunLocation).toStrictEqual({ x: 100, y: 94 });

  const shipRotationEast = Math.PI / 2;
  const locationAfterRotation = gun.getGunPosition({
    location,
    rotation: shipRotationEast,
  });
  // TODO: reversed y axis.
  expect(locationAfterRotation).toStrictEqual({ x: 106, y: 100 });
});

test("get velocity of bullet when ship's gun is fired", () => {
  const gunSpec = setUp();
  const gun = new Gun(gunSpec);
  // when ship is stationary and pointing North
  const shipVelocity = { speed: 0, direction: 0 };
  const shipRotationNorth = 0;
  const bulletVelocity = gun.getBulletVelocity(shipVelocity, shipRotationNorth);
  expect(bulletVelocity).toStrictEqual({ dx: 0, dy: 6 });
  // when ship is moving North at 2 pixels per frame
  const shipVelocity2 = { speed: 2, direction: 0 };
  const bulletVelocity2 = gun.getBulletVelocity(
    shipVelocity2,
    shipRotationNorth,
  );
  expect(bulletVelocity2).toStrictEqual({ dx: 0, dy: 8 });
});

test("when gun is fired it is not reloaded until reload time has passed", () => {
  const gunSpec = setUp();
  gunSpec.reloadTime = 3;
  const gun = new Gun(gunSpec);
  // gun is loaded at start
  expect(gun.isGunLoaded()).toBe(true);
  // reload gun after being fired
  gun.reloadGun();
  expect(gun.isGunLoaded()).toBe(false);
  // update reload gun timer
  gun.update();
  gun.update();
  expect(gun.isGunLoaded()).toBe(false);
  // when updates = reload time then gun is loaded again
  gun.update();
  expect(gun.isGunLoaded()).toBe(true);
});
