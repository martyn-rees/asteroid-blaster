import { beforeEach, expect, test } from "vitest";
import Bullet, { resetBulletIDCounter } from "./bullet.ts";
import { PositionTransform } from "../types.ts";

// left hand cartesian coords reverse y-axis
// directions: east 0, south Math.PI/2, west Math.PI, north 1.5 * Math.PI

beforeEach(() => {
  resetBulletIDCounter();
});

function setUp(x: number = 100, y: number = 100): Bullet {
  return new Bullet({
    initialPosition: { x, y },
    velocity: { speed: 4, direction: 0 },
    bulletSpecs: {
      r: 2,
      endurance: 4,
      power: 1,
    },
  });
}

test("create new Bullets", () => {
  const bullet1 = setUp();
  const bullet2 = setUp(110, 100);
  expect(bullet1).toEqual({
    id: "bullet1",
    bulletPower: 1,
    position: { x: 100, y: 100 },
    velocity: {
      direction: 0,
      speed: 4,
    },
    endurance: 4,
    r: 2,
  });
  expect(bullet2).toEqual({
    id: "bullet2",
    bulletPower: 1,
    velocity: {
      direction: 0,
      speed: 4,
    },
    position: { x: 110, y: 100 },
    endurance: 4,
    r: 2,
  });
});

test("boundary of bullet", () => {
  const bullet = setUp();
  expect(bullet.boundary()).toStrictEqual({ x: 100, y: 100, r: 2 });
});

test("bullet movement after 2 frames", () => {
  const bullet = setUp();
  // bullet moves 4 pixels east every frame so should move 8 pixels after 2 frames
  bullet.update();
  bullet.update();
  expect(bullet.position.x).toBe(108);
  expect(bullet.position.y).toBe(100);
});

test("bullet movement after 2 frames with transform", () => {
  const transformCallback: PositionTransform = () => ({ x: 10, y: 10 });
  const bullet = setUp();
  bullet.update();
  bullet.update(transformCallback);
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
