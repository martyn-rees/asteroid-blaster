import { GamePhase } from "../entities/types.ts";
import { onEnter, onExit, setUpLevel } from "../events/events.ts";
import { removeFromScreen } from "../render/dom-render.ts";

export function handleStateTransition(
  currentState: GamePhase | "",
  previousState: GamePhase | "",
  onResetTimer: () => void,
): void {
  switch (currentState) {
    case "start":
      if (previousState !== "start") {
        if (previousState === "gameover") removeFromScreen("endScreen");
        onEnter("start");
      }
      break;
    case "playing":
      if (previousState === "start") {
        onExit("start");
        setUpLevel();
        onEnter("playing");
        onResetTimer();
      }
      if (previousState === "paused") {
        onExit("paused");
        onEnter("playing");
        onResetTimer();
      }
      break;
    case "paused":
      if (previousState === "playing") {
        onEnter("paused");
      }
      break;
    case "gameover":
      if (previousState === "playing") {
        onEnter("gameover");
      }
      break;
  }
}
