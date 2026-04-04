import { expect, test } from "vitest";
import Container from "./container";

test("set up gamescreen, resize it and get screen centre", () => {
  const screen1 = new Container("gameScreen1", 400, 300);
  const screenCentre = screen1.centre;
  expect(screenCentre).toStrictEqual({ x: 200, y: 150 });
  screen1.dimensions = { w: 300, h: 200 };
  expect(screen1.dimensions).toStrictEqual({
    screenWidth: 300,
    screenHeight: 200,
  });
  expect(screen1.centre).toStrictEqual({ x: 150, y: 100 });
});
