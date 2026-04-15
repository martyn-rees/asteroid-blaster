import { changeGameState, gameState } from "../state/game-state.ts";
import { GamePhase } from "../types.ts";
import { createButton } from "../ui/button.ts";
import { addToScreen, removeFromScreen } from "../render/dom-render.ts";
import { displayHiScore, displayScore } from "../render/score-render.ts";
import { addNewShip } from "../entities/ship-factory.ts";
import { startLevel } from "../ui/level-start.ts";
import { resetRenderer } from "../render/gameloop-render.ts";
import { createStartScreen } from "../ui/startscreen.ts";
import { createEndScreen } from "../ui/endscreen.ts";
import { hideCursor, showCursor } from "./cursor-events.ts";
import Viewport from "../entities/viewport.ts";

let endScreenTimer: ReturnType<typeof setTimeout> | null = null;

function addPauseButton(screenId: string) {
  const pauseButton = createButton({
    label: "pause",
    id: "pauseButton",
    className: "pause-button",
    onClick: () => changeGameState({ action: "state", payload: "paused" }),
  });
  addToScreen(pauseButton, screenId);
}

function addResumeButton(screenId: string) {
  const resumeButton = createButton({
    label: "resume",
    id: "resumeButton",
    className: "pause-button",
    onClick: () => changeGameState({ action: "state", payload: "playing" }),
  });
  addToScreen(resumeButton, screenId);
}

// add ship and then show level announcement and add rocks after a delay
function setUpLevel(gameScreen: Viewport) {
  if (endScreenTimer) {
    clearTimeout(endScreenTimer);
    endScreenTimer = null;
  }
  changeGameState({ action: "reset game" });
  resetRenderer();
  addNewShip(gameScreen.centre);
  startLevel({
    level: gameState.level,
    screenId: gameScreen.id,
    screenSize: gameScreen.dimensions,
  });
}

function onEnter(screen: GamePhase, gameScreen: Viewport) {
  switch (screen) {
    case "start":
      changeGameState({ action: "state", payload: "start" });
      displayScore(gameState.score);
      displayHiScore(gameState.hiScore);
      addToScreen(
        createStartScreen(() =>
          changeGameState({ action: "state", payload: "playing" }),
        ),
        gameScreen.id,
      );
      break;
    case "playing":
      changeGameState({ action: "state", payload: "playing" });
      addPauseButton(gameScreen.id);
      hideCursor(gameScreen.id);
      break;
    case "paused":
      changeGameState({ action: "state", payload: "paused" });
      removeFromScreen("pauseButton");
      addResumeButton(gameScreen.id);
      break;
    case "gameover":
      changeGameState({ action: "state", payload: "gameover" });
      changeGameState({ action: "update hi-score" });
      showCursor(gameScreen.id);
      removeFromScreen("pauseButton");
      endScreenTimer = setTimeout(() => {
        endScreenTimer = null;
        if (gameState.state === "gameover") {
          addToScreen(
            createEndScreen(gameState.score, gameState.hiScore, () =>
              changeGameState({ action: "state", payload: "start" }),
            ),
            gameScreen.id,
          );
          displayHiScore(gameState.hiScore);
        }
      }, 3000);
      break;
  }
}

// buttons onClick events are automatically removed so do not need to clean up attachedEvent
function onExit(screen: GamePhase, gameScreen: Viewport) {
  switch (screen) {
    case "start":
      removeFromScreen("startScreen");
      break;
    case "paused":
      removeFromScreen("resumeButton");
      showCursor(gameScreen.id);
      break;
  }
}

export { onEnter, onExit, setUpLevel };
