import { expect, test } from "vitest";
import { constrainNumber, testCollision } from "./helper.js";

test("move position to other side of screen if it goes off the edge", () => {
  const num = constrainNumber(40, 0, 100);
  expect(num).toBe(40);
  const num2 = constrainNumber(-4, 0, 100);
  expect(num2).toBe(96);
  const num3 = constrainNumber(102, 0, 100);
  expect(num3).toBe(2);
});

test("do circular objects collide", () => {
  const circle1 = { x: 100, y: 100, r: 10 };
  const circle2 = { x: 115, y: 100, r: 10 };
  const circle3 = { x: 90, y: 100, r: 10 };
  const Circles1And2 = testCollision(circle1, circle2);
  const Circles1And3 = testCollision(circle1, circle3);
  const Circles2And3 = testCollision(circle2, circle3);
  expect(Circles1And2).toBe(true);
  expect(Circles1And3).toBe(true);
  expect(Circles2And3).toBe(false);
});
