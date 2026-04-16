import { createButton } from "../ui/button.ts";
import { addToScreen } from "../render/dom-render.ts";
import { changeGameState } from "../state/game-state.ts";

export function addPauseButton(screenId: string) {
  const pauseButton = createButton({
    label: "pause",
    id: "pauseButton",
    className: "pause-button",
    onClick: () => changeGameState({ action: "state", payload: "paused" }),
  });
  addToScreen(pauseButton, screenId);
}

export function addResumeButton(screenId: string) {
  const resumeButton = createButton({
    label: "resume",
    id: "resumeButton",
    className: "pause-button",
    onClick: () => changeGameState({ action: "state", payload: "playing" }),
  });
  addToScreen(resumeButton, screenId);
}
