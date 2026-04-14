import { showLevelAnnouncement } from "./ui/level-announcement.ts";
import { addNewRocksForNewLevel } from "./entities/rock-factory.ts";

type LevelStartParams = {
  level: number;
  screenId: string;
  screenSize: { screenWidth: number; screenHeight: number };
};

export function startLevel({ level, screenId, screenSize }: LevelStartParams) {
  showLevelAnnouncement({
    level,
    screenId,
    onComplete: () => addNewRocksForNewLevel({ level, screenSize }),
  });
}
