export const bulletSpecs = {
  r: 2,
  endurance: 90,
  power: 1,
};

export const shipSpecs = {
  speedMax: 4.0,
  drag: 0.005,
  thrustMax: 0.1,
  radius: 10,
  rotationSpeed: 2,
};

// using offset to position gun muzzle on ship when it is facing East (ship rotation 0)
export const gunSpec = {
  muzzleOffset: { x: 10, y: 0 },
  muzzleSpeed: 6,
  reloadTime: 12,
};

type Range = { min: number; max: number };

import { RockSize } from "../types.ts";

export type RockSpec = {
  description: RockSize;
  value: number;
  radius: Range;
  speed: Range;
  rotationRate: Range;
};

type RockType = {
  [key: string]: RockSpec;
};

export const rockType: RockType = {
  large: {
    description: "large",
    value: 100,
    radius: { min: 60, max: 80 },
    speed: { min: 1, max: 2 },
    rotationRate: { min: 0.3, max: 0.8 },
  },
  medium: {
    description: "medium",
    value: 200,
    radius: { min: 25, max: 40 },
    speed: { min: 2.5, max: 3 },
    rotationRate: { min: 1.3, max: 2 },
  },
  small: {
    description: "small",
    value: 300,
    radius: { min: 10, max: 15 },
    speed: { min: 3, max: 4 },
    rotationRate: { min: 2, max: 3 },
  },
};

/**
 * Configuration for each level.
 * @property level - Level number, kept for readability.
 * @property largeRocks - Large rocks spawned at the start of the level.
 * @property mediumRocks - Medium rocks spawned at the start of the level.
 * @property smallRocks - Small rocks spawned at the start of the level.
 * @property largeRockExplosions - Medium rocks spawned when a large rock is destroyed.
 * @property mediumRockExplosions - Small rocks spawned when a medium rock is destroyed.
 */
type LevelData = {
  level: number;
  largeRocks: number;
  mediumRocks: number;
  smallRocks: number;
  largeRockExplosions: number;
  mediumRockExplosions: number;
};

export const levelData: LevelData[] = [
  {
    level: 1,
    largeRocks: 2,
    mediumRocks: 0,
    smallRocks: 0,
    largeRockExplosions: 2,
    mediumRockExplosions: 0,
  },
  {
    level: 2,
    largeRocks: 4,
    mediumRocks: 0,
    smallRocks: 0,
    largeRockExplosions: 2,
    mediumRockExplosions: 0,
  },
  {
    level: 3,
    largeRocks: 6,
    mediumRocks: 0,
    smallRocks: 0,
    largeRockExplosions: 2,
    mediumRockExplosions: 0,
  },
  {
    level: 4,
    largeRocks: 6,
    mediumRocks: 0,
    smallRocks: 0,
    largeRockExplosions: 2,
    mediumRockExplosions: 3,
  },
  {
    level: 5,
    largeRocks: 8,
    mediumRocks: 0,
    smallRocks: 0,
    largeRockExplosions: 2,
    mediumRockExplosions: 3,
  },
  {
    level: 6,
    largeRocks: 8,
    mediumRocks: 0,
    smallRocks: 0,
    largeRockExplosions: 3,
    mediumRockExplosions: 3,
  },
  {
    level: 7,
    largeRocks: 10,
    mediumRocks: 0,
    smallRocks: 0,
    largeRockExplosions: 3,
    mediumRockExplosions: 3,
  },
  {
    level: 8,
    largeRocks: 8,
    mediumRocks: 8,
    smallRocks: 8,
    largeRockExplosions: 3,
    mediumRockExplosions: 3,
  },
  {
    level: 9,
    largeRocks: 12,
    mediumRocks: 8,
    smallRocks: 0,
    largeRockExplosions: 3,
    mediumRockExplosions: 3,
  },
  {
    level: 10,
    largeRocks: 16,
    mediumRocks: 0,
    smallRocks: 0,
    largeRockExplosions: 3,
    mediumRockExplosions: 3,
  },
];

export function getLevelConfig(level: number): LevelData {
  return levelData[level - 1] ?? levelData[levelData.length - 1];
}

export const keyBindings = {
  rotateLeft: "ArrowLeft",
  rotateRight: "ArrowRight",
  thrust: "ArrowUp",
  shoot: "KeyS",
};
