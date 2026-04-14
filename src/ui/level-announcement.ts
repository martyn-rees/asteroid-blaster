import {
  createElement,
  addToScreen,
  removeFromScreen,
} from "../render/dom-render.ts";
import { addNewRocksForNewLevel } from "../entities/rock-factory.ts";
import { changeGameState, gameState } from "../state/game-state.ts";

const ANNOUNCEMENT_DELAY_MS = 2000;
const ANNOUNCEMENT_ID = "levelAnnouncement";

export function showLevelAnnouncement({
  level,
  screenSize,
  screenId,
}: {
  level: number;
  screenSize: { screenWidth: number; screenHeight: number };
  screenId: string;
}) {
  const rockAmount = Math.min(2 + level * 2, 16);
  const announcement = createElement(
    ANNOUNCEMENT_ID,
    "level-announcement press-start-2p-regular",
    null,
    null,
  );
  announcement.textContent = `LEVEL ${level}`;
  addToScreen(announcement, screenId);
  setTimeout(() => {
    removeFromScreen(ANNOUNCEMENT_ID);
    if (gameState.state === "playing") {
      addNewRocksForNewLevel({ rockAmount, screenSize });
    }
    changeGameState({ action: "clear level pending" });
  }, ANNOUNCEMENT_DELAY_MS);
}
