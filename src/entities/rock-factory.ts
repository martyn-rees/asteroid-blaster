import Rock from "./rock.ts";
import { changeGameState } from "../state/game-state.ts";
import { EdgeSide, Position, RockSize } from "../types.ts";
import {
  getRandomEdgePosition,
  getRandomRockProps,
} from "./rock-randomizer.ts";
import { rockType } from "../assets/game-entity-specs.ts";
import { getLevelConfig } from "../assets/level-config.ts";

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

function spawnRockBatch({
  rocksToAdd,
  rockSize,
  screenSize,
}: {
  rocksToAdd: number;
  rockSize: RockSize;
  screenSize: { screenWidth: number; screenHeight: number };
}) {
  for (let i = 0; i < rocksToAdd; i++) {
    const borders: EdgeSide[] = ["top", "right", "bottom", "left"];
    const edge = borders[i % 4];
    const pos: Position = getRandomEdgePosition(edge, screenSize);
    addRock(rockSize, pos);
  }
}

export function spawnRocks({
  level,
  screenSize,
}: {
  level: number;
  screenSize: { screenWidth: number; screenHeight: number };
}) {
  const { largeRocks, mediumRocks, smallRocks } = getLevelConfig(level);
  spawnRockBatch({ rocksToAdd: largeRocks, rockSize: "large", screenSize });
  spawnRockBatch({ rocksToAdd: mediumRocks, rockSize: "medium", screenSize });
  spawnRockBatch({ rocksToAdd: smallRocks, rockSize: "small", screenSize });
}

export function explodeRock(rock: Rock, level: number) {
  const explodedRockLocation = rock.rockPosition;
  const rockSize = rock.size;
  const { largeRockExplosions, mediumRockExplosions } = getLevelConfig(level);
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
