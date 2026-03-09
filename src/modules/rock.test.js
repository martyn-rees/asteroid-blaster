import { expect, test, vi } from "vitest";
import Rock from "./rock";

function setUp({ x, y } = { x: 100, y: 100 }) {
  // reset the static variable that creates a unique ID
  Rock.rockIDCounter = 0;
  const position = { x, y };
  let velocity = { speed: 1, direction: 45 };
  const size = "large";
  const r = 70;
  const rotationRate = 1.5;
  const rock = new Rock({
    initialPosition: position,
    initialVelocity: velocity,
    size,
    r,
    rotationRate,
  });
  return rock;
}

test("create new rocks", () => {
  const rock1 = setUp();
  const newPosition = { x: 110, y: 100 };
  const rock2 = setUp(newPosition);
  expect(rock1).toEqual({
    id: "rock0",
    size: "large",
    r: 70,
    rotationRate: 1.5,
    velocity: { speed: 1, direction: 45 },
    position: { x: 100, y: 100 },
    rotation: 0,
  });
  expect(rock2).toEqual({
    id: "rock0",
    size: "large",
    r: 70,
    rotationRate: 1.5,
    velocity: { speed: 1, direction: 45 },
    position: { x: 110, y: 100 },
    rotation: 0,
  });
});

test("boundary of rock", () => {
  const rock = setUp();
  expect(rock.boundary()).toStrictEqual({ x: 100, y: 100, r: 70 });
});

test("rock movement after 2 frames with transform", () => {
  const transformCallback = (x) => {
    return 10;
  };
  const rock = setUp();
  rock.update();
  rock.update(transformCallback, transformCallback);
  expect(rock.position.x).toBe(10);
  expect(rock.position.y).toBe(10);
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
  expect(mockRenderCallback).toHaveBeenLastCalledWith(
    "rock0",
    100.70710701920045,
    100.70710654317256,
    1.5,
  );
});
