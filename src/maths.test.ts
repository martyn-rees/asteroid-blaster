import { describe, expect, test } from "vitest";
import { Directions } from "./modules/types";
import {
  changeRotation,
  getComponentVelocity,
  getDirectionRadians,
} from "./maths";

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

describe("get component velocitiy from 2 velocities", () => {
  test("component velocity while heading North", () => {
    const v1 = { speed: 1, direction: 1.5 * Math.PI };
    const v2 = { speed: 0.5, direction: Math.PI / 2 };
    const { dx, dy } = getComponentVelocity(v1, v2);
    // this failed because of issue with javascript maths where dx was -0 instead of 0 so using toBecloseTo to 7 decimal places
    expect(dx).toBeCloseTo(0, 7);
    expect(dy).toBe(-0.5);
  });
  test("component velocity while heading SouthEast", () => {
    const v1 = { speed: 1, direction: Math.PI / 2 };
    const v2 = { speed: 1, direction: Math.PI };
    const { dx, dy } = getComponentVelocity(v1, v2);
    expect(dx).toBe(-1);
    expect(dy).toBe(1);
  });
});

describe("get velocity from changes in x and y positions", () => {
  test("angle of direction pointing East", () => {
    const radians: number = getDirectionRadians(1, 0);
    //expect(angle.degrees).toBe(0);
    expect(radians).toBe(0);
  });
  test("angle of direction pointing North", () => {
    const radians: number = getDirectionRadians(0, -1);
    //expect(angle.degrees).toBe(270);
    expect(radians).toBe(1.5 * Math.PI);
  });
  test("angle of direction pointing West", () => {
    const radians: number = getDirectionRadians(-1, 0);
    //expect(angle.degrees).toBe(180);
    expect(radians).toBe(Math.PI);
  });
  test("angle of direction pointing South", () => {
    const radians: number = getDirectionRadians(0, 1);
    //expect(angle.degrees).toBe(90);
    expect(radians).toBe(Math.PI / 2);
  });
  test("set angle of direction to North when dx,dy is 0", () => {
    const radians: number = getDirectionRadians(0, 0);
    //expect(angle.degrees).toBe(270);
    expect(radians).toBe(1.5 * Math.PI);
  });
  test("angle of direction 2 parts East 1 part South ", () => {
    const radians: number = getDirectionRadians(2, 1);
    // expect(angle.degrees).toBe(26.6);
    expect(radians).toBeCloseTo(0.4636);
  });
});
