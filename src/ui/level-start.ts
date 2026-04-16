import { showLevelAnnouncement } from "./level-announcement.ts";
import { spawnRocks } from "../entities/rock-factory.ts";
import { Size } from "../types.ts";

type LevelStartParams = {
  level: number;
  screenId: string;
  screenSize: Size;
};

export function startLevel({ level, screenId, screenSize }: LevelStartParams) {
  showLevelAnnouncement({
    level,
    screenId,
    onComplete: () => spawnRocks({ level, screenSize }),
  });
}
