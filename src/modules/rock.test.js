import { expect, test, vi } from "vitest";
import Rock from "./rock";

function setUp() {
  // reset the static variable that creates a unique ID
  Rock.rockIDCounter = 0;
  const initialPosition = { x: 100, y: 100 };
  let velocity = { speed: 1, direction: 45 };
  const rockSpecs = { size: "large", r: 70, rotationRate: 1.5 };
  return { initialPosition, velocity, rockSpecs };
}

test("create new rocks", () => {
  const { initialPosition, velocity, rockSpecs } = setUp();
  const rock1 = new Rock(initialPosition, velocity, rockSpecs);
  const secondRockPosition = { x: 110, y: 100 };
  const rock2 = new Rock(secondRockPosition, velocity, rockSpecs);
  expect(rock1).toEqual({
    id: "rock0",
    size: "large",
    r: 70,
    rotationRate: 1.5,
    velocity: { speed: 1, direction: 45 },
    x: 100,
    y: 100,
    rotation: 0,
  });
  expect(rock2).toEqual({
    id: "rock1",
    size: "large",
    r: 70,
    rotationRate: 1.5,
    velocity: { speed: 1, direction: 45 },
    x: 110,
    y: 100,
    rotation: 0,
  });
});

test("render calls callback function with id, position and rotation", () => {
  const mockRenderCallback = vi.fn();
  const { initialPosition, velocity, rockSpecs } = setUp();
  const rock = new Rock(initialPosition, velocity, rockSpecs);

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
