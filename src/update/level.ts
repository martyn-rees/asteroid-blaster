import { changeGameState, GameState } from "../state/game-state.ts";
import Ship from "../entities/ship.ts";
import Viewport from "../entities/viewport.ts";
import { startLevel } from "../ui/level-start.ts";

// Advance to the next level when all rocks are cleared. levelStartPending
// prevents this firing again on subsequent frames before the new rocks spawn.
export function checkLevelComplete(
  ship: Ship,
  gameScreen: Viewport,
  getState: () => GameState,
): void {
  const state = getState();
  if (
    Object.keys(state.rocks).length === 0 &&
    ship.state === "active" &&
    state.state === "playing" &&
    !state.levelStartPending
  ) {
    changeGameState({ action: "next level" });
    startLevel({
      level: getState().level,
      screenId: gameScreen.id,
      screenSize: gameScreen.size,
    });
  }
}
