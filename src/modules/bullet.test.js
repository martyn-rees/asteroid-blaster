import { expect, test, vi } from "vitest";
import Bullet from "./bullet";

function setUp() {
  // reset the static variable that creates a unique ID
  Bullet.bulletIDCounter = 0;
  const bulletPosition = { x: 100, y: 100 };
  const bulletVelocity = { dx: 4, dy: 1 };
  const bulletSpecs = {
    r: 2,
    endurance: 4,
    power: 1,
  };
  return { bulletPosition, bulletVelocity, bulletSpecs };
}

test("create new Bullets", () => {
  const { bulletPosition, bulletVelocity, bulletSpecs } = setUp();
  const bullet1 = new Bullet(bulletPosition, bulletVelocity, bulletSpecs);
  const secondBulletPosition = { x: 110, y: 100 };
  const bullet2 = new Bullet(secondBulletPosition, bulletVelocity, bulletSpecs);
  expect(bullet1).toEqual({
    id: "bullet1",
    bulletPower: 1,
    velocity: { dx: 4, dy: 1 },
    position: { x: 100, y: 100 },
    endurance: 4,
    r: 2,
  });
  expect(bullet2).toEqual({
    id: "bullet2",
    bulletPower: 1,
    velocity: { dx: 4, dy: 1 },
    position: { x: 110, y: 100 },
    endurance: 4,
    r: 2,
  });
});

test("boundary of bullet", () => {
  const { bulletPosition, bulletVelocity, bulletSpecs } = setUp();
  const bullet = new Bullet(bulletPosition, bulletVelocity, bulletSpecs);
  expect(bullet.boundary()).toStrictEqual({ x: 100, y: 100, r: 2 });
});

// NB: that y axis is reversed for computer screens with 0,0 being top left instead of bottom left
// maybe I should change calculations so that -dy moves up and +dy moves down
test("bullet movement after 2 frames", () => {
  const { bulletPosition, bulletVelocity, bulletSpecs } = setUp();
  const bullet = new Bullet(bulletPosition, bulletVelocity, bulletSpecs);
  // bullet moves dx=4 every frame so should move 8 pixels after 2 frames
  bullet.update();
  bullet.update();
  expect(bullet.position.x).toBe(108);
  expect(bullet.position.y).toBe(98);
});

test("bullet movement after 2 frames with transform", () => {
  const transformCallback = (x) => {
    return 10;
  };
  const { bulletPosition, bulletVelocity, bulletSpecs } = setUp();
  const bullet = new Bullet(bulletPosition, bulletVelocity, bulletSpecs);
  // bullet moves dx=4 every frame so should move 8 pixels after 2 frames
  bullet.update();
  bullet.update(transformCallback, transformCallback);
  expect(bullet.position.x).toBe(10);
  expect(bullet.position.y).toBe(10);
});

test("life expectancy of bullet", () => {
  const { bulletPosition, bulletVelocity, bulletSpecs } = setUp();
  const bullet = new Bullet(bulletPosition, bulletVelocity, bulletSpecs);
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
  const { bulletPosition, bulletVelocity, bulletSpecs } = setUp();
  const bullet = new Bullet(bulletPosition, bulletVelocity, bulletSpecs);
  bullet.render(mockRenderCallback);
  //expect renderCallback to be called with id,x,y parameters
  expect(mockRenderCallback).toHaveBeenCalledTimes(1);
  expect(mockRenderCallback).toHaveBeenLastCalledWith("bullet1", 100, 100);
});
