import { expect, test, vi } from "vitest";
import Ship from "./ship.ts";
import Gun from "./gun.ts";
import { ShipActions } from "../input/ship-actions.ts";
import { PositionTransform } from "../types.ts";

// Partial<ShipActions> makes every property of ShipActions optional, so tests
// only need to specify the actions relevant to them. The spread merges overrides
// on top of the all-false defaults to produce a complete ShipActions object.
function newActions(overrides: Partial<ShipActions>): ShipActions {
  return {
    rotateCounterClockwise: false,
    rotateClockwise: false,
    shoot: false,
    thrust: false,
    ...overrides,
  };
}

function setUp(): Ship {
  // for test purposes ship rotates 45 degrees per frame and has a thrust of 1 pixel per frame
  const shipSpecs = {
    speedMax: 4.0,
    drag: 0.1,
    thrustMax: 1,
    radius: 6,
    rotationSpeed: 45,
  };
  return new Ship({ x: 100, y: 100 }, "ship", shipSpecs);
}

function setUpGun(): Gun {
  // `as unknown as Gun` lets a partial object satisfy the Gun type in tests.
  // Direct casting (`as Gun`) is blocked by TypeScript when the shapes are too
  // different, so the double cast via `unknown` is the standard escape hatch —
  // use sparingly, only where a full implementation would add no test value.
  return {
    gunSpecs: { muzzleOffset: { x: 0, y: 6 }, speed: 6, reloadTime: 10 },
    gunReloadTimer: 0,
    update: vi.fn(),
  } as unknown as Gun;
}

// left hand cartesian maths
// sin (270) = -1
// cos (270) = 0
// direction 0=east, 90=south, 180=west, 270=north
test("create a new ship", () => {
  const ship = setUp();
  expect(ship).toEqual({
    id: "ship",
    state: "active",
    position: { x: 100, y: 100 },
    speedMax: 4,
    drag: 0.1,
    thrustMax: 1,
    r: 6,
    rotationSpeed: Math.PI / 4,
    rotation: 1.5 * Math.PI,
    thrustPower: 0,
    velocity: { speed: 0, direction: 1.5 * Math.PI },
    gun: null,
    isTriggerPressed: false,
    explosionTimer: 0,
    rotateDirection: 0,
  });
});

test("boundary of ship", () => {
  const ship = setUp();
  expect(ship.boundary()).toStrictEqual({ x: 100, y: 100, r: 6 });
});

test("get motion state", () => {
  const ship = setUp();
  expect(ship.motionState).toStrictEqual({
    position: { x: 100, y: 100 },
    velocity: { speed: 0, direction: 1.5 * Math.PI },
    rotation: 1.5 * Math.PI,
  });
});

test("attach a gun to ship and fire it", () => {
  const ship = setUp();
  const gun = setUpGun();
  ship.attachGun(gun);
  expect(ship.gun).not.toBe(null);
  ship.setInput(newActions({ shoot: true }));
  ship.update();
  expect(ship.gun!.update).toBeCalled();
});

test("thrust ship North for 1 frame", () => {
  const ship = setUp();
  ship.setInput(newActions({ thrust: true }));
  expect(ship.velocity.direction).toBe(1.5 * Math.PI);
  ship.update();
  expect(ship).toEqual({
    id: "ship",
    state: "active",
    position: { x: 100, y: 99 },
    speedMax: 4,
    drag: 0.1,
    thrustMax: 1,
    r: 6,
    rotationSpeed: Math.PI / 4,
    rotation: 1.5 * Math.PI,
    thrustPower: 1,
    velocity: { speed: 1, direction: 1.5 * Math.PI },
    gun: null,
    isTriggerPressed: false,
    explosionTimer: 0,
    rotateDirection: 0,
  });
  expect(ship.position).toStrictEqual({ x: 100, y: 99 });
  expect(ship.motionState).toStrictEqual({
    position: { x: 100, y: 99 },
    velocity: { speed: 1, direction: 1.5 * Math.PI },
    rotation: 1.5 * Math.PI,
  });
});

test("thrust ship East for 1 frame", () => {
  const ship = setUp();
  ship.setInput(newActions({ rotateClockwise: true }));
  ship.update();
  ship.setInput(newActions({ rotateClockwise: true }));
  ship.update();
  expect(ship.rotation).toBe(0);

  ship.setInput(newActions({ thrust: true }));
  ship.update();

  expect(ship.rotation).toBe(0);
  expect(ship.position).toStrictEqual({ x: 101, y: 100 });
  expect(ship.velocity.direction).toBe(0);
  expect(ship.motionState).toStrictEqual({
    position: { x: 101, y: 100 },
    velocity: { speed: 1, direction: 0 },
    rotation: 0,
  });
});

test("rotate ship and then thrust", () => {
  const ship = setUp();
  expect(ship.velocity.direction).toBe(1.5 * Math.PI);
  ship.setInput(newActions({ rotateCounterClockwise: true }));
  ship.update();
  expect(ship.rotation).toBe(1.25 * Math.PI);
  ship.setInput(newActions({ rotateClockwise: true }));
  ship.update();
  expect(ship.velocity.direction).toBe(1.5 * Math.PI);
  ship.setInput(newActions({ thrust: true }));
  ship.update();
  expect(ship.velocity.direction).toBe(1.5 * Math.PI);
});

test("ship doesn't move beyond its max speed", () => {
  const ship = setUp();
  expect(ship.velocity.speed).toBe(0);
  ship.setInput(newActions({ thrust: true }));
  ship.update();
  expect(ship.velocity.speed).toBe(1);
  ship.update();
  expect(ship.velocity.speed).toBe(1.9);
  ship.update();
  expect(ship.velocity.speed).toBe(2.8);
  ship.update();
  expect(ship.velocity.speed).toBe(3.7);
  ship.update();
  expect(ship.velocity.speed).toBe(4);
  ship.update();
  expect(ship.velocity.speed).toBe(4);
});

// TODO: this is implementation details so don't really want this test
test("ships rotation resets after 360 degrees", () => {
  const ship = setUp();
  expect(ship.rotation).toBe(1.5 * Math.PI);
  ship.setInput(newActions({ rotateClockwise: true }));
  ship.update();
  expect(ship.rotation).toBe(1.75 * Math.PI);
  ship.setInput(newActions({ rotateClockwise: true }));
  ship.update();
  expect(ship.rotation).toBe(0);
});

test("ship movement after 2 frames with transform", () => {
  const transformCallback: PositionTransform = () => ({ x: 10, y: 10 });
  const ship = setUp();
  ship.setInput(newActions({ thrust: true }));
  ship.update(transformCallback);
  expect(ship.position).toStrictEqual({ x: 10, y: 10 });
});
