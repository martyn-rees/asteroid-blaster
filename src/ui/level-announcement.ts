import {
  createElement,
  addToScreen,
  removeFromScreen,
} from "../render/dom-render.ts";
import { changeGameState, gameState } from "../state/game-state.ts";
import { ANNOUNCEMENT_DELAY_MS } from "../config/config.ts";
const ANNOUNCEMENT_ID = "levelAnnouncement";

export function showLevelAnnouncement({
  level,
  screenId,
  onComplete,
}: {
  level: number;
  screenId: string;
  onComplete: () => void;
}) {
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
    if (gameState.state === "playing" || gameState.state === "paused") {
      onComplete();
      changeGameState({ action: "clear level pending" });
    }
  }, ANNOUNCEMENT_DELAY_MS);
}
