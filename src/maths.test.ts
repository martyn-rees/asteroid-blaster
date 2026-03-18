import { describe, expect, test } from "vitest";
import { Directions } from "./modules/types";
import { changeRotation, getDirection } from "./maths";

describe("updating rotation", () => {
  test("change rotation from north to west", () => {
    const newRotation: Directions = changeRotation(-90, 270);
    expect(newRotation.degrees).toBe(180);
    expect(newRotation.radians).toBeCloseTo(Math.PI, 4);
  });
  test("change rotation to less than 0", () => {
    const newRotation: Directions = changeRotation(-90, 50);
    expect(newRotation.degrees).toBe(320);
  });
  test("change rotation to more than 360", () => {
    const newRotation: Directions = changeRotation(2, 359);
    expect(newRotation.degrees).toBe(1);
  });
  test("changing rotation to 360 sets rotation to 0", () => {
    const newRotation: Directions = changeRotation(1, 359);
    expect(newRotation.degrees).toBe(0);
    expect(newRotation.radians).toBe(0);
  });
});

describe("get velocity from changes in x and y positions", () => {
  test("angle of direction pointing East", () => {
    const angle: Directions = getDirection(1, 0);
    expect(angle.degrees).toBe(0);
    expect(angle.radians).toBe(0);
  });
  test("angle of direction pointing North", () => {
    const angle: Directions = getDirection(0, -1);
    expect(angle.degrees).toBe(270);
    expect(angle.radians).toBe(1.5 * Math.PI);
  });
  test("angle of direction pointing West", () => {
    const angle: Directions = getDirection(-1, 0);
    expect(angle.degrees).toBe(180);
    expect(angle.radians).toBe(Math.PI);
  });
  test("angle of direction pointing South", () => {
    const angle: Directions = getDirection(0, 1);
    expect(angle.degrees).toBe(90);
    expect(angle.radians).toBe(Math.PI / 2);
  });
  test("set angle of direction to North when dx,dy is 0", () => {
    const angle: Directions = getDirection(0, 0);
    expect(angle.degrees).toBe(270);
    expect(angle.radians).toBe(1.5 * Math.PI);
  });
  test("angle of direction 2 parts East 1 part South ", () => {
    const angle: Directions = getDirection(2, 1);
    expect(angle.degrees).toBe(26.6);
    expect(angle.radians).toBeCloseTo(0.4636);
  });
});
