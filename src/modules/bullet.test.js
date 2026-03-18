import { expect, test, vi } from "vitest";
import Bullet from "./bullet";

// left hand cartesian coords reverse y-asix
// directions: east 0, south Math.PI/2, west Math.PI, north 1.5 * Math.PI

function setUp(x = 100, y = 100) {
  // reset the static variable that creates a unique ID
  Bullet.bulletIDCounter = 0;
  const bulletPosition = { x, y };
  const bulletDxDy = { dx: 4, dy: 0 };
  const bulletSpecs = {
    r: 2,
    endurance: 4,
    power: 1,
  };
  // bellet velocity direction 0 is East at speed 4 pixels per frame
  const bulletVelocity = { speed: 4, direction: 0 };
  const bullet = new Bullet({
    initialPosition: bulletPosition,
    dxdy: bulletDxDy,
    velocity: bulletVelocity,
    bulletSpecs,
  });
  return bullet;
}

test("create new Bullets", () => {
  const bullet1 = setUp();
  const bullet2 = setUp(110, 100);
  expect(bullet1).toEqual({
    id: "bullet1",
    bulletPower: 1,
    dxdy: { dx: 4, dy: 0 },
    position: { x: 100, y: 100 },
    velocity: {
      direction: 0,
      speed: 4,
    },
    endurance: 4,
    r: 2,
    testdxdy: {
      dx: 4,
      dy: 0,
    },
  });
  expect(bullet2).toEqual({
    id: "bullet1",
    bulletPower: 1,
    dxdy: { dx: 4, dy: 0 },
    velocity: {
      direction: 0,
      speed: 4,
    },
    position: { x: 110, y: 100 },
    endurance: 4,
    r: 2,
    testdxdy: {
      dx: 4,
      dy: 0,
    },
  });
});

test("boundary of bullet", () => {
  const bullet = setUp();
  expect(bullet.boundary()).toStrictEqual({ x: 100, y: 100, r: 2 });
});

test("bullet movement after 2 frames", () => {
  const bullet = setUp();
  // bullet moves dx=4 every frame so should move 8 pixels after 2 frames
  bullet.update();
  bullet.update();
  expect(bullet.position.x).toBe(108);
  expect(bullet.position.y).toBe(100);
});

test("bullet movement after 2 frames with transform", () => {
  const transformCallback = (x) => {
    return 10;
  };
  const bullet = setUp();
  // bullet moves dx=4 every frame so should move 8 pixels after 2 frames
  bullet.update();
  bullet.update(transformCallback, transformCallback);
  expect(bullet.position.x).toBe(10);
  expect(bullet.position.y).toBe(10);
});

test("life expectancy of bullet", () => {
  const bullet = setUp();
  // bullet endurance is set to 4 in set-up so should die after 4 frames
  expect(bullet.endurance).toBe(4);
  bullet.update();
  bullet.update();
  expect(bullet.endurance).toBe(2);
  expect(bullet.bulletPower).toBe(1);
  bullet.update();
  bullet.update();
  expect(bullet.endurance).toBe(0);
  expect(bullet.bulletPower).toBe(0);
  bullet.update();
  expect(bullet.endurance).toBe(-1);
  expect(bullet.bulletPower).toBe(0);
});

test("render calls callback function with id and position", () => {
  const mockRenderCallback = vi.fn();
  const bullet = setUp();
  bullet.render(mockRenderCallback);
  //expect renderCallback to be called with id,x,y parameters
  expect(mockRenderCallback).toHaveBeenCalledTimes(1);
  expect(mockRenderCallback).toHaveBeenLastCalledWith("bullet1", 100, 100);
});
