import { expect, test } from "vitest";
import { constrainNumber, testCollision } from "./maths.ts";
import { Circle } from "../types.ts";

test("move position to other side of screen if it goes off the edge", () => {
  expect(constrainNumber(40, 0, 100)).toBe(40);
  expect(constrainNumber(-4, 0, 100)).toBe(96);
  expect(constrainNumber(102, 0, 100)).toBe(2);
});

test("do circular objects collide", () => {
  const circle1: Circle = { x: 100, y: 100, r: 10 };
  const circle2: Circle = { x: 115, y: 100, r: 10 };
  const circle3: Circle = { x: 90, y: 100, r: 10 };
  expect(testCollision(circle1, circle2)).toBe(true);
  expect(testCollision(circle1, circle3)).toBe(true);
  expect(testCollision(circle2, circle3)).toBe(false);
});
