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
        onExit("pause");
        onEnter("playing");
        onResetTimer();
      }
      break;
    case "paused":
      if (previousState === "playing") {
        onEnter("pause");
      }
      break;
    case "gameover":
      if (previousState === "playing") {
        onEnter("gameover");
      }
      break;
  }
}
