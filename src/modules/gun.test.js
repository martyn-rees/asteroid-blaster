// reversed y axis (screen coords) so going up decreses in value
// angeles: north: 0, east: PI/2, south: PI,
import { beforeEach, expect, test, vi } from "vitest";
import Gun from "./gun";

function setUpGun() {
  const gunSpec = {
    muzzleOffset: { x: 6, y: 0 },
    muzzleSpeed: 4,
    reloadTime: 3,
  };
  const gun = new Gun(gunSpec);
  return gun;
}

beforeEach(() => {
  // reset the static variable that creates a unique ID before each test
  Gun.gunIDCounter = 0;
});

test("create new gun", () => {
  const gun = setUpGun();
  expect(gun).toEqual({
    id: "gun0",
    muzzleOffset: {
      x: 6,
      y: 0,
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

test("gun and muzzle position when pointing North", () => {
  const gun = setUpGun();
  gun.motionState = {
    position: { x: 100, y: 100 },
    velocity: { speed: 0, direction: 1.5 * Math.PI },
    rotation: 1.5 * Math.PI,
  };
  const muzzleLocation = gun.getMuzzlePosition();
  expect(gun.position).toStrictEqual({ x: 100, y: 100 });
  expect(muzzleLocation).toStrictEqual({ x: 100, y: 94 });
});

test("gun and muzzle position when pointing East", () => {
  const gun = setUpGun();
  gun.motionState = {
    position: { x: 100, y: 100 },
    velocity: { speed: 0, direction: 0 },
    rotation: 0,
  };
  expect(gun.position).toStrictEqual({ x: 100, y: 100 });
  const muzzleLocation = gun.getMuzzlePosition();
  expect(muzzleLocation).toStrictEqual({ x: 106, y: 100 });
});

test("gun and muzzle position when pointing East but moving South", () => {
  const gun = setUpGun();
  gun.motionState = {
    position: { x: 100, y: 100 },
    velocity: { speed: 3, direction: Math.PI / 2 },
    rotation: 0,
  };
  expect(gun.position).toStrictEqual({ x: 100, y: 100 });
  const muzzleLocation = gun.getMuzzlePosition();
  expect(muzzleLocation).toStrictEqual({ x: 106, y: 100 });
});

test("get velocity of bullet when gun is fired while stationary and pointing North", () => {
  const gun = setUpGun();
  // gun is stationary and pointing North (rotation 270)
  gun.motionState = {
    position: { x: 100, y: 100 },
    velocity: { speed: 0, direction: 0 },
    rotation: 1.5 * Math.PI,
  };
  let { bulletPosition, bulletVelocity } = gun.getInitialMotionStateOfBullet();
  expect(gun.position).toStrictEqual({ x: 100, y: 100 });
  const muzzleLocation = gun.getMuzzlePosition();
  expect(muzzleLocation).toStrictEqual({ x: 100, y: 94 });

  expect(bulletPosition).toStrictEqual({ x: 100, y: 94 });
  expect(bulletVelocity).toStrictEqual({ speed: 4, direction: 1.5 * Math.PI });
});

test("get velocity of bullet when gun is fired while moving South and point South", () => {
  const gun = setUpGun();
  // gun is stationary and pointing North (rotation 180)
  gun.motionState = {
    position: { x: 100, y: 100 },
    velocity: { speed: 2, direction: Math.PI / 2 },
    rotation: Math.PI / 2,
  };
  let { bulletPosition } = gun.getInitialMotionStateOfBullet();
  expect(bulletPosition).toStrictEqual({ x: 100, y: 106 });
});

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

test("rendering function get called correctly", () => {
  const mockRenderCallback = vi.fn();
  const gun = setUpGun();
  gun.render(mockRenderCallback);
  expect(mockRenderCallback).toHaveBeenLastCalledWith("gun0", 6, 0);
  // when attached to an object such as a ship then the motionstate of the gun would be set by the ship
  // ship is stationary, position 100,100 and pointing north.
  gun.motionState = {
    position: { x: 100, y: 100 },
    velocity: { speed: 0, direction: 1.5 * Math.PI },
    rotation: 1.5 * Math.PI,
  };
  gun.render(mockRenderCallback);
  // the gun is offset at (x:6, y:0) when rotated East. This test has the ship now rotated North so should expect the gun muzzle to be at (x:100, y:94)
  expect(mockRenderCallback).toHaveBeenLastCalledWith("gun0", 100, 94);
});
