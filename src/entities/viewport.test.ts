import { expect, test } from "vitest";
import Viewport from "./viewport.ts";

test("set up gamescreen, resize it and get screen centre", () => {
  const screen: Viewport = new Viewport("gameScreen1", 400, 300);
  expect(screen.centre).toStrictEqual({ x: 200, y: 150 });
  screen.size = { width: 300, height: 200 };
  expect(screen.size).toStrictEqual({
    width: 300,
    height: 200,
  });
  expect(screen.centre).toStrictEqual({ x: 150, y: 100 });
});
