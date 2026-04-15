import { expect, test } from "vitest";
import Viewport from "./viewport.ts";

test("set up gamescreen, resize it and get screen centre", () => {
  const screen: Viewport = new Viewport("gameScreen1", 400, 300);
  expect(screen.centre).toStrictEqual({ x: 200, y: 150 });
  screen.dimensions = { w: 300, h: 200 };
  expect(screen.dimensions).toStrictEqual({
    screenWidth: 300,
    screenHeight: 200,
  });
  expect(screen.centre).toStrictEqual({ x: 150, y: 100 });
});
