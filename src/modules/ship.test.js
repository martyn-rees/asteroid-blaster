import { expect, test, vi } from "vitest";
import Ship from "./ship";

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
    gunSpecs: { barrelLocation: { x: 0, y: 6 }, speed: 6, reloadTime: 10 },
    gunReloadTimer: 0,
    update: vi.fn(),
    getGunPosition: (shipLocation, shipRotation) => {
      const gunlength = 6;
      const x = shipLocation.x + gunlength * Math.sin(shipRotation);
      const y = shipLocation.y - gunlength * Math.cos(shipRotation);
      return { x, y };
    },
    getBulletVelocity: (shipVelocity, shipRotation) => {
      const shipVelocityX =
        shipVelocity.speed * Math.sin(shipVelocity.direction);
      const shipVelocityY =
        shipVelocity.speed * Math.cos(shipVelocity.direction);
      const dx = shipVelocityX + 6 * Math.sin(shipRotation);
      const dy = shipVelocityY + 6 * Math.cos(shipRotation);
      return {
        dx,
        dy,
      };
    },
  };
  return { shipSpecs, gun };
}

test("create a new ship", () => {
  const { shipSpecs } = setUp();
  const ship = new Ship({ x: 100, y: 100 }, "ship", shipSpecs);
  expect(ship).toEqual({
    id: "ship",
    x: 100,
    y: 100,
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

test("attach a gun to ship and fire it", () => {
  const { shipSpecs, gun } = setUp();
  const ship = new Ship({ x: 100, y: 100 }, "ship", shipSpecs);
  ship.attachGun(gun);
  expect(ship.gun.gunReloadTimer).toBe(0);
  const { bulletPosition, bulletVelocity } = ship.gunFired();
  expect(bulletPosition).toEqual({ x: 100, y: 94 });
  expect(bulletVelocity).toEqual({ dx: 0, dy: 6 });
  ship.update(400, 300);
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
  ship.updateShipActions(false, true, false);
  ship.update(400, 300);
  ship.render(mockRenderCallback, mockRenderThrustCallback);
  expect(mockRenderCallback).toHaveBeenLastCalledWith("ship", 100, 100, 315);
  expect(mockRenderThrustCallback).toHaveBeenLastCalledWith(0);
  // rotate ship right
  ship.updateShipActions(false, false, true);
  ship.update(400, 300);
  ship.render(mockRenderCallback, mockRenderThrustCallback);
  expect(mockRenderCallback).toHaveBeenLastCalledWith("ship", 100, 100, 0);
  expect(mockRenderThrustCallback).toHaveBeenLastCalledWith(0);
  // thrust ship - for this test it moves 1 pixel up per frame (with reverse y axis so y should be 99)
  ship.updateShipActions(true, false, false);
  ship.update(400, 300);
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
  ship.updateShipActions(true, false, false);
  ship.update(400, 300);
  expect(ship.shipSpeed).toBe(1);
  // thrust ship - speed should be 2
  ship.updateShipActions(true, false, false);
  ship.update(400, 300);
  expect(ship.shipSpeed).toBe(1.9);
  // thrust ship - speed should be 3
  ship.updateShipActions(true, false, false);
  ship.update(400, 300);
  expect(ship.shipSpeed).toBe(2.8);
  // thrust ship - speed should be 4
  ship.updateShipActions(true, false, false);
  ship.update(400, 300);
  // TODO: this was 3.6999999999999997 instead of 3.7
  //expect(ship.shipSpeed).toBe(3.7);
  // thrust ship - speed should not exceed maxSpeed (4 for this test)
  ship.updateShipActions(true, false, false);
  ship.update(400, 300);
  expect(ship.shipSpeed).toBe(4);
  // thrust ship - speed should still be 4 (max speed)
  ship.updateShipActions(true, false, false);
  ship.update(400, 300);
  expect(ship.shipSpeed).toBe(4);
});

// TODO: this is implementation details so don't really want this test
test("ships rotation resets after 360 degrees", () => {
  const { shipSpecs } = setUp();
  const ship = new Ship({ x: 100, y: 100 }, "ship", shipSpecs);
  expect(ship.rotation.degrees).toBe(0);
  ship.updateShipActions(0, 0, 1);
  expect(ship.rotation.degrees).toBe(45);
  ship.updateShipActions(0, 0, 1);
  expect(ship.rotation.degrees).toBe(90);
  ship.updateShipActions(0, 0, 1);
  expect(ship.rotation.degrees).toBe(135);
  ship.updateShipActions(0, 0, 1);
  expect(ship.rotation.degrees).toBe(180);
  ship.updateShipActions(0, 0, 1);
  expect(ship.rotation.degrees).toBe(225);
  ship.updateShipActions(0, 0, 1);
  expect(ship.rotation.degrees).toBe(270);
  ship.updateShipActions(0, 0, 1);
  expect(ship.rotation.degrees).toBe(315);
  ship.updateShipActions(0, 0, 1);
  expect(ship.rotation.degrees).toBe(0);
});

test("move ship to left side of screen if moves beyond right screen boundaries", () => {
  const { shipSpecs } = setUp();
  const ship = new Ship({ x: 402, y: 100 }, "ship", shipSpecs);
  ship.update(400, 300);
  const mockRenderCallback = vi.fn();
  const mockRenderThrustCallback = vi.fn();
  ship.render(mockRenderCallback, mockRenderThrustCallback);
  expect(mockRenderCallback).toHaveBeenLastCalledWith("ship", 2, 100, 0);
});

test("move ship to right side of screen if moves beyond left screen boundaries", () => {
  const { shipSpecs } = setUp();
  const ship = new Ship({ x: -2, y: 100 }, "ship", shipSpecs);
  ship.update(400, 300);
  const mockRenderCallback = vi.fn();
  const mockRenderThrustCallback = vi.fn();
  ship.render(mockRenderCallback, mockRenderThrustCallback);
  expect(mockRenderCallback).toHaveBeenLastCalledWith("ship", 398, 100, 0);
});

test("move ship to top side of screen if moves beyond bottom screen boundaries", () => {
  const { shipSpecs } = setUp();
  const ship = new Ship({ x: 100, y: 304 }, "ship", shipSpecs);
  ship.update(400, 300);
  const mockRenderCallback = vi.fn();
  const mockRenderThrustCallback = vi.fn();
  ship.render(mockRenderCallback, mockRenderThrustCallback);
  expect(mockRenderCallback).toHaveBeenLastCalledWith("ship", 100, 4, 0);
});

test("move ship to bottom side of screen if moves beyond top screen boundaries", () => {
  const { shipSpecs } = setUp();
  const ship = new Ship({ x: 402, y: -4 }, "ship", shipSpecs);
  ship.update(400, 300);
  const mockRenderCallback = vi.fn();
  const mockRenderThrustCallback = vi.fn();
  ship.render(mockRenderCallback, mockRenderThrustCallback);
  expect(mockRenderCallback).toHaveBeenLastCalledWith("ship", 2, 296, 0);
});
