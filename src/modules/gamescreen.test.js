import { expect, test } from "vitest";
import GameScreen from "./gamescreen";

test("set up gamescreen, resize it and get screen centre", () => {
  const screen1 = new GameScreen("gameScreen1", 400, 300);
  const screenCentre = screen1.screenCentre;
  expect(screenCentre).toStrictEqual({ x: 200, y: 150 });
  screen1.screenSize = { w: 300, h: 200 };
  expect(screen1.screenSize).toStrictEqual({
    screenWidth: 300,
    screenHeight: 200,
  });
  expect(screen1.screenCentre).toStrictEqual({ x: 150, y: 100 });
});
