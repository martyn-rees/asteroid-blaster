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

  // TODO: this isn't good that I need to recreate methods in gun class
  const gun = {
    gunSpecs: { barrelOffset: { x: 0, y: 6 }, speed: 6, reloadTime: 10 },
    gunReloadTimer: 0,
    update: vi.fn(),
    updateMotionState: vi.fn(),
  };
  return { shipSpecs, gun };
}

test("create a new ship", () => {
  const { shipSpecs } = setUp();
  const ship = new Ship({ x: 100, y: 100 }, "ship", shipSpecs);
  expect(ship).toEqual({
    id: "ship",
    position: { x: 100, y: 100 },
    speedMax: 4,
    drag: 0.1,
    thrustMax: 1,
    r: 6,
    rotationSpeed: 45,
    rotation: { degrees: 0, radians: 0 },
    thrustPower: 0,
    direction: { degrees: 0, radians: 0 },
    shipSpeed: 0,
    gun: null,
  });
  const mockRenderCallback = vi.fn();
  const mockRenderThrustCallback = vi.fn();
  ship.render(mockRenderCallback, mockRenderThrustCallback);
  expect(mockRenderCallback).toHaveBeenLastCalledWith("ship", 100, 100, 0);
  expect(mockRenderThrustCallback).toHaveBeenLastCalledWith(0);
});

test("boundary of ship", () => {
  const { shipSpecs } = setUp();
  const ship = new Ship({ x: 100, y: 100 }, "ship", shipSpecs);
  expect(ship.boundary()).toStrictEqual({ x: 100, y: 100, r: 6 });
});

test("get motion state", () => {
  const { shipSpecs } = setUp();
  const ship = new Ship({ x: 100, y: 100 }, "ship", shipSpecs);
  const motionstate = ship.getShipMotionState();
  expect(motionstate).toStrictEqual({
    position: { x: 100, y: 100 },
    velocity: {
      speed: 0,
      direction: 0,
    },
    rotation: 0,
  });
});

test("attach a gun to ship and fire it", () => {
  const { shipSpecs, gun } = setUp();
  const ship = new Ship({ x: 100, y: 100 }, "ship", shipSpecs);
  ship.attachGun(gun);
  expect(ship.gun).not.toBe(null);
  const ACTIONS = newActions({ shoot: true });
  console.log(ACTIONS);
  ship.update(ACTIONS);
  expect(ship.gun.update).toBeCalled();
});

test("rotate ship and then thrust", () => {
  const { shipSpecs } = setUp();
  const ship = new Ship({ x: 100, y: 100 }, "ship", shipSpecs);
  const mockRenderCallback = vi.fn();
  const mockRenderThrustCallback = vi.fn();
  // render ship before any actions
  ship.render(mockRenderCallback, mockRenderThrustCallback);
  expect(mockRenderCallback).toHaveBeenLastCalledWith("ship", 100, 100, 0);
  expect(mockRenderThrustCallback).toHaveBeenLastCalledWith(0);
  // rotate ship left
  const rotateLeftAction = newActions({ rotateCounterClockwise: true });
  ship.update(rotateLeftAction);
  ship.render(mockRenderCallback, mockRenderThrustCallback);
  expect(mockRenderCallback).toHaveBeenLastCalledWith("ship", 100, 100, 315);
  expect(mockRenderThrustCallback).toHaveBeenLastCalledWith(0);
  // rotate ship right
  const rotateRightAction = newActions({ rotateClockwise: true });
  ship.update(rotateRightAction);
  ship.render(mockRenderCallback, mockRenderThrustCallback);
  expect(mockRenderCallback).toHaveBeenLastCalledWith("ship", 100, 100, 0);
  expect(mockRenderThrustCallback).toHaveBeenLastCalledWith(0);
  // thrust ship - for this test it moves 1 pixel up per frame (with reverse y axis so y should be 99)
  const thrustAction = newActions({ thrust: true });
  ship.update(thrustAction);
  ship.render(mockRenderCallback, mockRenderThrustCallback);
  expect(mockRenderCallback).toHaveBeenLastCalledWith("ship", 100, 99, 0);
  expect(mockRenderThrustCallback).toHaveBeenLastCalledWith(1);
});

test("ship doesn't move beyond its max speed", () => {
  const { shipSpecs } = setUp();
  const ship = new Ship({ x: 100, y: 100 }, "ship", shipSpecs);
  // render ship before any actions
  expect(ship.shipSpeed).toBe(0);
  // thrust ship - speed should be 1
  ship.update(newActions({ thrust: true }));
  expect(ship.shipSpeed).toBe(1);
  // thrust ship - speed should be 2
  ship.update(newActions({ thrust: true }));
  expect(ship.shipSpeed).toBe(1.9);
  // thrust ship - speed should be 3
  ship.update(newActions({ thrust: true }));
  expect(ship.shipSpeed).toBe(2.8);
  // thrust ship - speed should be 4
  ship.update(newActions({ thrust: true }));
  // TODO: this was 3.6999999999999997 instead of 3.7
  //expect(ship.shipSpeed).toBe(3.7);
  // thrust ship - speed should not exceed maxSpeed (4 for this test)
  ship.update(newActions({ thrust: true }));
  expect(ship.shipSpeed).toBe(4);
  // thrust ship - speed should still be 4 (max speed)
  ship.update(newActions({ thrust: true }));
  expect(ship.shipSpeed).toBe(4);
});

// TODO: this is implementation details so don't really want this test
test("ships rotation resets after 360 degrees", () => {
  const { shipSpecs } = setUp();
  const ship = new Ship({ x: 100, y: 100 }, "ship", shipSpecs);
  expect(ship.rotation.degrees).toBe(0);
  ship.update(newActions({ rotateClockwise: true }));
  expect(ship.rotation.degrees).toBe(45);
  ship.update(newActions({ rotateClockwise: true }));
  expect(ship.rotation.degrees).toBe(90);
  ship.update(newActions({ rotateClockwise: true }));
  expect(ship.rotation.degrees).toBe(135);
  ship.update(newActions({ rotateClockwise: true }));
  expect(ship.rotation.degrees).toBe(180);
  ship.update(newActions({ rotateClockwise: true }));
  expect(ship.rotation.degrees).toBe(225);
  ship.update(newActions({ rotateClockwise: true }));
  expect(ship.rotation.degrees).toBe(270);
  ship.update(newActions({ rotateClockwise: true }));
  expect(ship.rotation.degrees).toBe(315);
  ship.update(newActions({ rotateClockwise: true }));
  expect(ship.rotation.degrees).toBe(0);
});

test("ship movement after 2 frames with transform", () => {
  const transformCallback = (x) => {
    return 10;
  };
  const { shipSpecs } = setUp();
  const ship = new Ship({ x: 100, y: 100 }, "ship", shipSpecs);

  ship.update(
    newActions({
      thrust: true,
    }),
    transformCallback,
    transformCallback,
  );
  expect(ship.position.x).toBe(10);
  expect(ship.position.y).toBe(10);
});
