import { createButton } from "../ui/button.ts";
import { addToScreen } from "../render/dom-render.ts";
import { changeGameState } from "../state/game-state.ts";

const pauseSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true" focusable="false"><rect x="5" y="3" width="4" height="18"/><rect x="15" y="3" width="4" height="18"/></svg>`;

const resumeSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true" focusable="false"><polygon points="5,3 19,12 5,21"/></svg>`;

export function addPauseButton(screenId: string) {
  const pauseButton = createButton({
    label: "pause",
    id: "pauseButton",
    className: "pause-button",
    onClick: () => changeGameState({ action: "state", payload: "paused" }),
    svgContent: pauseSVG,
  });
  addToScreen(pauseButton, screenId);
}

export function addResumeButton(screenId: string) {
  const resumeButton = createButton({
    label: "resume",
    id: "resumeButton",
    className: "pause-button",
    onClick: () => changeGameState({ action: "state", payload: "playing" }),
    svgContent: resumeSVG,
  });
  addToScreen(resumeButton, screenId);
}
