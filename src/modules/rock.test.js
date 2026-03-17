import { expect, test, vi } from "vitest";
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

test.only("rock movement after 2 frames moving East", () => {
  const rock = setUp();
  rock.update();
  rock.update();
  expect(rock.rockPosition).toStrictEqual({ x: 102, y: 100 });
});

test("rock movement after 2 frames moving South", () => {
  const rock = setUp(90);
  rock.update();
  rock.update();
  expect(rock.rockPosition).toStrictEqual({ x: 100, y: 102 });
});

test("rock movement after 2 frames moving SouthWest", () => {
  const rock = setUp(135);
  rock.update();
  rock.update();
  expect(rock.rockPosition).toStrictEqual({ x: 98.586, y: 101.414 });
});

test("rock movement after 2 frames moving North", () => {
  const rock = setUp(270);
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

test("render calls callback function with id, position and rotation", () => {
  const mockRenderCallback = vi.fn();
  const rock = setUp();

  //expect renderCallback to be called with id,x,y parameters
  rock.render(mockRenderCallback);
  expect(mockRenderCallback).toHaveBeenCalledTimes(1);
  expect(mockRenderCallback).toHaveBeenLastCalledWith("rock0", 100, 100, 0);
  // after a frame update the x,y position and rotation parameters have been updated
  rock.update();
  rock.render(mockRenderCallback);
  expect(mockRenderCallback).toHaveBeenCalledTimes(2);
  expect(mockRenderCallback).toHaveBeenLastCalledWith("rock0", 100, 101, 1.5);
});
