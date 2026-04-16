import { GamePhase } from "../types.ts";
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
      }
      break;
    case "playing":
      if (previousState === "start") {
        onExit("start", gameScreen);
        setUpLevel(gameScreen);
        onEnter("playing", gameScreen);
        onResetTimer();
      }
      if (previousState === "paused") {
        onExit("paused", gameScreen);
        onEnter("playing", gameScreen);
        onResetTimer();
      }
      break;
    case "paused":
      if (previousState === "playing") {
        onExit("playing", gameScreen);
        onEnter("paused", gameScreen);
      }
      break;
    case "gameover":
      if (previousState === "playing") {
        onExit("playing", gameScreen);
        onEnter("gameover", gameScreen);
      }
      break;
  }
}
