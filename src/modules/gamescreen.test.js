import { expect, test } from "vitest";
import GameScreen from "./gamescreen";

test("set up gamescrren, resize it and get screen centre", () => {
  const screen1 = new GameScreen("gameScreen1", 400, 300);
  const screenCentre = screen1.getScreenCentre();
  expect(screenCentre).toStrictEqual({ x: 200, y: 150 });
  screen1.setGameScreenDimensions(300, 200);
  const resizedScreenCentre = screen1.getScreenCentre();
  expect(resizedScreenCentre).toStrictEqual({ x: 150, y: 100 });
});

test("random screen position should be inside screen dimesnions", () => {
  const screen1 = new GameScreen("gameScreen1", 10, 5);
  for (let i = 0; i < 100; i++) {
    const { x, y } = screen1.getRandomScreenPosition();
    expect(x).toBeGreaterThanOrEqual(0);
    expect(x).toBeLessThanOrEqual(10);
    expect(y).toBeGreaterThanOrEqual(0);
    expect(y).toBeLessThanOrEqual(5);
  }
});
