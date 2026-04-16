import { changeGameState, gameState } from "../state/game-state.ts";
import { GamePhase } from "../types.ts";
import { addToScreen, removeFromScreen } from "../render/dom-render.ts";
import { displayHiScore, displayScore } from "../render/score-render.ts";
import { addNewShip } from "../entities/ship-factory.ts";
import { startLevel } from "../ui/level-start.ts";
import { resetRenderer } from "../render/gameloop-render.ts";
import { createStartScreen } from "../ui/startscreen.ts";
import { createEndScreen } from "../ui/endscreen.ts";
import { hideCursor, showCursor } from "./cursor-events.ts";
import Viewport from "../entities/viewport.ts";
import { addPauseButton, addResumeButton } from "./button-events.ts";

let endScreenTimer: ReturnType<typeof setTimeout> | null = null;

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
    screenSize: gameScreen.size,
  });
}

function onEnterStart(gameScreen: Viewport) {
  changeGameState({ action: "state", payload: "start" });
  displayScore(gameState.score);
  displayHiScore(gameState.hiScore);
  addToScreen(
    createStartScreen(() =>
      changeGameState({ action: "state", payload: "playing" }),
    ),
    gameScreen.id,
  );
}

function onEnterPlaying(gameScreen: Viewport) {
  changeGameState({ action: "state", payload: "playing" });
  addPauseButton(gameScreen.id);
  hideCursor(gameScreen.id);
}

function onEnterPaused(gameScreen: Viewport) {
  changeGameState({ action: "state", payload: "paused" });
  addResumeButton(gameScreen.id);
}

function onEnterGameOver(gameScreen: Viewport) {
  changeGameState({ action: "state", payload: "gameover" });
  changeGameState({ action: "update hi-score" });
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
}

function onEnter(screen: GamePhase, gameScreen: Viewport) {
  switch (screen) {
    case "start":
      onEnterStart(gameScreen);
      break;
    case "playing":
      onEnterPlaying(gameScreen);
      break;
    case "paused":
      onEnterPaused(gameScreen);
      break;
    case "gameover":
      onEnterGameOver(gameScreen);
      break;
  }
}

// buttons onClick events are automatically removed so do not need to clean up attachedEvent
function onExit(screen: GamePhase, gameScreen: Viewport) {
  switch (screen) {
    case "start":
      removeFromScreen("startScreen");
      break;
    case "playing":
      removeFromScreen("pauseButton");
      showCursor(gameScreen.id);
      break;
    case "paused":
      removeFromScreen("resumeButton");
      break;
    case "gameover":
      removeFromScreen("endScreen");
      break;
  }
}

export { onEnter, onExit, setUpLevel };
