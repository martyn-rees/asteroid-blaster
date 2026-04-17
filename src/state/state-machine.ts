import { GamePhase } from "../types.ts";
import { changeGameState } from "../state/game-state.ts";
import { onEnter, onExit, setUpLevel } from "../events/events.ts";
import Viewport from "../entities/viewport.ts";

export function handleStateTransition(
  currentState: GamePhase | "",
  previousState: GamePhase | "",
  gameScreen: Viewport,
  onResetTimer: () => void,
): void {
  switch (currentState) {
    case "start":
      if (previousState !== "start") {
        if (previousState === "gameover") onExit("gameover", gameScreen);
        onEnter("start", gameScreen);
        changeGameState({ action: "sync transition" });
      }
      break;
    case "playing":
      if (previousState === "start") {
        onExit("start", gameScreen);
        setUpLevel(gameScreen);
        onEnter("playing", gameScreen);
        onResetTimer();
        changeGameState({ action: "sync transition" });
      }
      if (previousState === "paused") {
        onExit("paused", gameScreen);
        onEnter("playing", gameScreen);
        onResetTimer();
        changeGameState({ action: "sync transition" });
      }
      break;
    case "paused":
      if (previousState === "playing") {
        onExit("playing", gameScreen);
        onEnter("paused", gameScreen);
        changeGameState({ action: "sync transition" });
      }
      break;
    case "gameover":
      if (previousState === "playing") {
        onExit("playing", gameScreen);
        onEnter("gameover", gameScreen);
        changeGameState({ action: "sync transition" });
      }
      break;
  }
}
