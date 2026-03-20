import { expect, test, vi } from "vitest";
import Ship from "./ship";

function newActions(newActions) {
  const defaultActions = {
    rotateCounterClockwise: false,
    rotateClockwise: false,
    shoot: false,
    thrust: false,
  };
  return { ...defaultActions, ...newActions };
}

function setUp() {
  // for test purposes ship rotates 45 degrees per frame and has a thrust of 1 pixel per frame
  //TODO: should thrust be called acceleration?
  const shipSpecs = {
    speedMax: 4.0,
    drag: 0.1,
    thrustMax: 1,
    radius: 6,
    rotationSpeed: 45,
  };

  const ship = new Ship({ x: 100, y: 100 }, "ship", shipSpecs);
  return ship;
}

function setUpGun() {
  return {
    gunSpecs: { muzzleOffset: { x: 0, y: 6 }, speed: 6, reloadTime: 10 },
    gunReloadTimer: 0,
    update: vi.fn(),
  };
}

// left hand cartesian maths
// sin (270) = -1
// cos (270) = 0
// direction 0=east, 90=south, 180=west, 270=north
test("create a new ship", () => {
  const ship = setUp();
  expect(ship).toEqual({
    id: "ship",
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
  });
});

test("boundary of ship", () => {
  const ship = setUp();
  expect(ship.boundary()).toStrictEqual({ x: 100, y: 100, r: 6 });
});

test("get motion state", () => {
  const ship = setUp();
  const motionstate = ship.motionState;
  expect(motionstate).toStrictEqual({
    position: { x: 100, y: 100 },
    velocity: {
      speed: 0,
      direction: 1.5 * Math.PI,
    },
    rotation: 1.5 * Math.PI,
  });
});

test("attach a gun to ship and fire it", () => {
  const ship = setUp();
  const gun = setUpGun();
  ship.attachGun(gun);
  expect(ship.gun).not.toBe(null);
  const ACTIONS = newActions({ shoot: true });
  ship.updateActions(ACTIONS);
  ship.update();
  expect(ship.gun.update).toBeCalled();
});

test("thrust ship North for 1 frame", () => {
  const mockRenderCallback = vi.fn();
  const mockRenderThrustCallback = vi.fn();
  const ship = setUp();

  const thrustAction = newActions({ thrust: true });
  ship.updateActions(thrustAction);
  expect(ship.velocity.direction).toBe(1.5 * Math.PI);
  ship.update();
  expect(ship).toEqual({
    id: "ship",
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
  });

  expect(ship.velocity.direction).toBe(1.5 * Math.PI);
  const motionstate = ship.motionState;
  expect(ship.position.x).toBe(100);
  expect(ship.position.y).toBe(99);
  expect(ship.velocity.direction).toBe(1.5 * Math.PI);
  expect(motionstate).toStrictEqual({
    position: { x: 100, y: 99 },
    velocity: {
      speed: 1,
      direction: 1.5 * Math.PI,
    },
    rotation: 1.5 * Math.PI,
  });
  ship.render(mockRenderCallback, mockRenderThrustCallback);
  expect(mockRenderCallback).toHaveBeenLastCalledWith("ship", 100, 99, 270);
  expect(mockRenderThrustCallback).toHaveBeenLastCalledWith(1);
});

test("thrust ship East for 1 frame", () => {
  const mockRenderCallback = vi.fn();
  const mockRenderThrustCallback = vi.fn();
  const ship = setUp();

  const rotateRightAction = newActions({ rotateClockwise: true });
  ship.updateActions(rotateRightAction);
  ship.updateActions(rotateRightAction);
  expect(ship.rotation).toBe(0);
  ship.update();
  expect(ship.rotation).toBe(0);

  const thrustAction = newActions({ thrust: true });
  ship.updateActions(thrustAction);
  ship.update();

  expect(ship.rotation).toBe(0);
  const motionstate = ship.motionState;
  expect(ship.position.x).toBe(101);
  expect(ship.position.y).toBe(100);
  expect(ship.velocity.direction).toBe(0);
  expect(motionstate).toStrictEqual({
    position: { x: 101, y: 100 },
    velocity: {
      speed: 1,
      direction: 0,
    },
    rotation: 0,
  });
  ship.render(mockRenderCallback, mockRenderThrustCallback);
  expect(mockRenderCallback).toHaveBeenLastCalledWith("ship", 101, 100, 0);
  expect(mockRenderThrustCallback).toHaveBeenLastCalledWith(1);
});

test("rotate ship and then thrust", () => {
  const ship = setUp();

  const mockRenderCallback = vi.fn();
  const mockRenderThrustCallback = vi.fn();
  // render ship before any actions
  ship.render(mockRenderCallback, mockRenderThrustCallback);
  expect(mockRenderCallback).toHaveBeenLastCalledWith("ship", 100, 100, 270);
  expect(mockRenderThrustCallback).toHaveBeenLastCalledWith(0);
  expect(ship.velocity.direction).toBe(1.5 * Math.PI);
  // rotate ship left
  const rotateLeftAction = newActions({ rotateCounterClockwise: true });
  ship.updateActions(rotateLeftAction);
  expect(ship.rotation).toBe(1.25 * Math.PI);
  ship.update();
  expect(ship.rotation).toBe(1.25 * Math.PI);
  ship.render(mockRenderCallback, mockRenderThrustCallback);
  expect(mockRenderCallback).toHaveBeenLastCalledWith("ship", 100, 100, 225);
  expect(mockRenderThrustCallback).toHaveBeenLastCalledWith(0);

  // rotate ship right
  const rotateRightAction = newActions({ rotateClockwise: true });
  ship.updateActions(rotateRightAction);
  ship.update();
  ship.render(mockRenderCallback, mockRenderThrustCallback);
  expect(mockRenderCallback).toHaveBeenLastCalledWith("ship", 100, 100, 270);
  expect(mockRenderThrustCallback).toHaveBeenLastCalledWith(0);
  expect(ship.velocity.direction).toBe(1.5 * Math.PI);
  // thrust ship - for this test it moves 1 pixel up per frame (with reverse y axis so y should be 99)
  const thrustAction = newActions({ thrust: true });
  ship.updateActions(thrustAction);
  ship.update();
  expect(ship.velocity.direction).toBe(1.5 * Math.PI);
  ship.render(mockRenderCallback, mockRenderThrustCallback);
  expect(mockRenderCallback).toHaveBeenLastCalledWith("ship", 100, 99, 270);
  expect(mockRenderThrustCallback).toHaveBeenLastCalledWith(1);
});

test("ship doesn't move beyond its max speed", () => {
  const ship = setUp();
  // render ship before any actions
  expect(ship.velocity.speed).toBe(0);
  // thrust ship - speed should be 1
  ship.updateActions(newActions({ thrust: true }));
  ship.update();
  expect(ship.velocity.speed).toBe(1);
  // thrust ship - speed should be 2
  ship.updateActions(newActions({ thrust: true }));
  ship.update();
  expect(ship.velocity.speed).toBe(1.9);
  // thrust ship - speed should be 3
  ship.updateActions(newActions({ thrust: true }));
  ship.update();
  expect(ship.velocity.speed).toBe(2.8);
  // thrust ship - speed should be 4
  ship.updateActions(newActions({ thrust: true }));
  ship.update();
  // TODO: this was 3.6999999999999997 instead of 3.7
  expect(ship.velocity.speed).toBe(3.7);
  // thrust ship - speed should not exceed maxSpeed (4 for this test)
  ship.updateActions(newActions({ thrust: true }));
  ship.update();
  expect(ship.velocity.speed).toBe(4);
  // thrust ship - speed should still be 4 (max speed)
  ship.updateActions(newActions({ thrust: true }));
  ship.update();
  expect(ship.velocity.speed).toBe(4);
});

// TODO: this is implementation details so don't really want this test
test("ships rotation resets after 360 degrees", () => {
  const ship = setUp();
  expect(ship.rotation).toBe(1.5 * Math.PI);
  ship.updateActions(newActions({ rotateClockwise: true }));
  ship.update();
  expect(ship.rotation).toBe(1.75 * Math.PI);
  ship.updateActions(newActions({ rotateClockwise: true }));
  ship.update();
  expect(ship.rotation).toBe(0);
});

test("ship movement after 2 frames with transform", () => {
  const transformCallback = (x) => {
    return 10;
  };
  const ship = setUp();
  ship.updateActions(
    newActions({
      thrust: true,
    }),
  );
  ship.update(transformCallback, transformCallback);
  expect(ship.position.x).toBe(10);
  expect(ship.position.y).toBe(10);
});
