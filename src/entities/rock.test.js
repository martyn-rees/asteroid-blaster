import { expect, test } from "vitest";
import Rock from "./rock";

function setUp(direction = 0) {
  // reset the static variable that creates a unique ID
  Rock.rockIDCounter = 0;

  const rock = new Rock({
    initialPosition: { x: 100, y: 100 },
    initialVelocity: { speed: 1, direction: direction },
    size: "large",
    r: 70,
    rotationRate: 1.5,
  });
  return rock;
}

test("create new rock", () => {
  const rock1 = setUp();
  expect(rock1).toEqual({
    id: "rock0",
    index: 0,
    size: "large",
    r: 70,
    rotationRate: 1.5,
    velocity: { speed: 1, direction: 0 },
    position: { x: 100, y: 100 },
    rotation: 0,
  });
});

test("boundary of rock", () => {
  const rock = setUp();
  const boundary = rock.boundary();
  expect(boundary).toStrictEqual({ x: 100, y: 100, r: 70 });
});

test("get position", () => {
  const rock = setUp();
  expect(rock.rockPosition).toStrictEqual({ x: 100, y: 100 });
});

test("rock movement after 2 frames moving East", () => {
  const rock = setUp();
  rock.update();
  rock.update();
  expect(rock.rockPosition).toStrictEqual({ x: 102, y: 100 });
});

test("rock movement after 2 frames moving SouthEast", () => {
  const rock = setUp(Math.PI / 4);
  rock.update();
  rock.update();
  expect(rock.rockPosition).toStrictEqual({ x: 101.4, y: 101.4 });
});

test("rock movement after 2 frames moving South", () => {
  const rock = setUp(Math.PI / 2);
  rock.update();
  rock.update();
  expect(rock.rockPosition).toStrictEqual({ x: 100, y: 102 });
});

test("rock movement after 2 frames moving SouthWest", () => {
  const rock = setUp(Math.PI * 0.75);
  rock.update();
  rock.update();
  expect(rock.rockPosition).toStrictEqual({ x: 98.6, y: 101.4 });
});

test("rock movement after 2 frames moving North", () => {
  const rock = setUp(Math.PI * 1.5);
  rock.update();
  rock.update();
  expect(rock.rockPosition).toStrictEqual({ x: 100, y: 98 });
});

test("rock movement after 2 frames with transform", () => {
  const transformCallback = (x) => {
    return 10;
  };
  const rock = setUp();
  rock.update();
  rock.update(transformCallback, transformCallback);
  expect(rock.rockPosition).toStrictEqual({ x: 10, y: 10 });
});
