/**
 * Configuration for each level.
 * @property largeRocks - Large rocks spawned at the start of the level.
 * @property mediumRocks - Medium rocks spawned at the start of the level.
 * @property smallRocks - Small rocks spawned at the start of the level.
 * @property largeRockExplosions - Medium rocks spawned when a large rock is destroyed.
 * @property mediumRockExplosions - Small rocks spawned when a medium rock is destroyed.
 */
type LevelData = {
  largeRocks: number;
  mediumRocks: number;
  smallRocks: number;
  largeRockExplosions: number;
  mediumRockExplosions: number;
};

// prettier-ignore
const levelData: Record<number, LevelData> = {
  1:  { largeRocks: 2,  mediumRocks: 0, smallRocks: 0, largeRockExplosions: 2, mediumRockExplosions: 0 },
  2:  { largeRocks: 4,  mediumRocks: 0, smallRocks: 0, largeRockExplosions: 2, mediumRockExplosions: 0 },
  3:  { largeRocks: 6,  mediumRocks: 0, smallRocks: 0, largeRockExplosions: 2, mediumRockExplosions: 0 },
  4:  { largeRocks: 6,  mediumRocks: 0, smallRocks: 0, largeRockExplosions: 2, mediumRockExplosions: 3 },
  5:  { largeRocks: 8,  mediumRocks: 0, smallRocks: 0, largeRockExplosions: 2, mediumRockExplosions: 3 },
  6:  { largeRocks: 8,  mediumRocks: 0, smallRocks: 0, largeRockExplosions: 3, mediumRockExplosions: 3 },
  7:  { largeRocks: 10, mediumRocks: 0, smallRocks: 0, largeRockExplosions: 3, mediumRockExplosions: 3 },
  8:  { largeRocks: 8,  mediumRocks: 8, smallRocks: 8, largeRockExplosions: 3, mediumRockExplosions: 3 },
  9:  { largeRocks: 12, mediumRocks: 8, smallRocks: 0, largeRockExplosions: 3, mediumRockExplosions: 3 },
  10: { largeRocks: 16, mediumRocks: 0, smallRocks: 0, largeRockExplosions: 3, mediumRockExplosions: 3 },
};

export function getLevelConfig(level: number): LevelData {
  return levelData[level] ?? levelData[10];
}
