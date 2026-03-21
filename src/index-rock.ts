import Rock from "./modules/rock.ts";
import { changeGameState } from "./gameState";
import { Position } from "./modules/types";
import { getRockData } from "./gamedata";

function addRock(size: string, pos: Position) {
  const { velocity, r, rotationRate } = getRockData(size);
  const rock = new Rock({
    initialPosition: pos,
    initialVelocity: velocity,
    size,
    r,
    rotationRate,
  });
  changeGameState({ action: "add rock", gameElement: rock });
}

const getRandom = (n: number): number => Math.floor(Math.random() * (n + 1));

function getEdgePosition(
  edge: string,
  screenSize: { screenWidth: number; screenHeight: number },
): { x: number; y: number } {
  switch (edge) {
    case "top":
      return { x: getRandom(screenSize.screenWidth), y: 0 };
    case "right":
      return {
        x: screenSize.screenWidth,
        y: getRandom(screenSize.screenHeight),
      };
    case "bottom":
      return {
        x: getRandom(screenSize.screenWidth),
        y: screenSize.screenHeight,
      };
    case "left":
      return { x: 0, y: getRandom(screenSize.screenHeight) };
  }
  return { x: getRandom(screenSize.screenWidth), y: 0 };
}

export function createRocksForNewLevel({
  rockAmount,
  screenSize,
}: {
  rockAmount: number;
  screenSize: { screenWidth: number; screenHeight: number };
}) {
  for (let i = 0; i < rockAmount; i++) {
    const borders: string[] = ["top", "right", "bottom", "left"];
    const edge = borders[i % 4];
    const posXY = getEdgePosition(edge, screenSize);
    addRock("large", posXY);
  }
}

export function explodeRock(rock: Rock) {
  const explodedRockLocation = rock.rockPosition;
  const rockSize = rock.size;
  // explode rock in to smaller rocks
  if (rockSize == "large") {
    addRock("medium", explodedRockLocation);
    addRock("medium", explodedRockLocation);
  } else if (rockSize == "medium") {
    addRock("small", explodedRockLocation);
    addRock("small", explodedRockLocation);
    addRock("small", explodedRockLocation);
  }
  changeGameState({ action: "delete rock", gameElement: rock });
}
