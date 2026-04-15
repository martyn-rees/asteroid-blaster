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

const levelData: LevelData[] = [
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
