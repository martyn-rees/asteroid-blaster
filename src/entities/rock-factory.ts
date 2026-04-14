import Rock from "./rock.ts";
import { changeGameState, gameState } from "../state/game-state.ts";
import { EdgeSide, Position, RockSize } from "../types.ts";
import {
  getRandomEdgePosition,
  getRandomRockProps,
} from "../utils/rock-randomizer.ts";
import { rockType, getLevelConfig } from "../assets/gamedata.ts";

function addRock(size: RockSize, pos: Position) {
  const { velocity, r, rotationRate } = getRandomRockProps(rockType[size]);
  const rock = new Rock({
    initialPosition: pos,
    initialVelocity: velocity,
    size,
    r,
    rotationRate,
  });
  changeGameState({ action: "add rock", payload: rock });
}

export function addNewRocksForNewLevel({
  level,
  screenSize,
}: {
  level: number;
  screenSize: { screenWidth: number; screenHeight: number };
}) {
  const { largeRocks } = getLevelConfig(level);
  for (let i = 0; i < largeRocks; i++) {
    const borders: EdgeSide[] = ["top", "right", "bottom", "left"];
    const edge = borders[i % 4];
    const posXY = getRandomEdgePosition(edge, screenSize);
    addRock("large", posXY);
  }
}

export function explodeRock(rock: Rock) {
  const explodedRockLocation = rock.rockPosition;
  const rockSize = rock.size;
  const { largeRockExplosions, mediumRockExplosions } = getLevelConfig(gameState.level);
  if (rockSize === "large") {
    for (let i = 0; i < largeRockExplosions; i++) {
      addRock("medium", explodedRockLocation);
    }
  } else if (rockSize === "medium") {
    for (let i = 0; i < mediumRockExplosions; i++) {
      addRock("small", explodedRockLocation);
    }
  }
  changeGameState({ action: "delete rock", payload: rock });
}
