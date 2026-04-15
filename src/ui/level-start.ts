import { showLevelAnnouncement } from "./level-announcement.ts";
import { spawnRocks } from "../entities/rock-factory.ts";

type LevelStartParams = {
  level: number;
  screenId: string;
  screenSize: { screenWidth: number; screenHeight: number };
};

export function startLevel({ level, screenId, screenSize }: LevelStartParams) {
  showLevelAnnouncement({
    level,
    screenId,
    onComplete: () => spawnRocks({ level, screenSize }),
  });
}
