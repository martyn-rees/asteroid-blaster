import Rock from "./modules/rock.ts";
import { changeGameState } from "./gameState";
import { Position } from "./modules/types";
import { getRandomEdgePosition, getRandomRockProps } from "./randomizer.ts";
import { rockType } from "./gamedata.ts";

function addRock(size: string, pos: Position) {
  const { velocity, r, rotationRate } = getRandomRockProps(rockType[size]);
  const rock = new Rock({
    initialPosition: pos,
    initialVelocity: velocity,
    size,
    r,
    rotationRate,
  });
  changeGameState({ action: "add rock", gameElement: rock });
}

export function addNewRocksForNewLevel({
  rockAmount,
  screenSize,
}: {
  rockAmount: number;
  screenSize: { screenWidth: number; screenHeight: number };
}) {
  for (let i = 0; i < rockAmount; i++) {
    const borders: string[] = ["top", "right", "bottom", "left"];
    const edge = borders[i % 4];
    const posXY = getRandomEdgePosition(edge, screenSize);
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
