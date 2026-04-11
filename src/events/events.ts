import { changeGameState, gameState } from "../state/game-state.ts";
import { createButton } from "../ui/button.ts";
import { addToScreen, removeFromScreen } from "../render/dom-render.ts";
import { addNewShip } from "../entities/ship-factory.ts";
import { addNewRocksForNewLevel } from "../entities/rock-factory.ts";
import { createStartScreen } from "../ui/startscreen.ts";
import { createEndScreen } from "../ui/endscreen.ts";
import { gameScreen } from "../index.ts";

let cursorHideTimer: ReturnType<typeof setTimeout> | null = null;
let endScreenTimer: ReturnType<typeof setTimeout> | null = null;

function onMouseMove() {
  const el = document.getElementById(gameScreen.id);
  if (!el) return;
  el.style.cursor = "default";
  if (cursorHideTimer) clearTimeout(cursorHideTimer);
  cursorHideTimer = setTimeout(() => {
    el.style.cursor = "none";
  }, 2000);
}

function hideCursor() {
  const el = document.getElementById(gameScreen.id);
  if (!el) return;
  el.style.cursor = "none";
  // delay attaching mousemove so the click that triggered this doesn't immediately show the cursor again
  setTimeout(() => el.addEventListener("mousemove", onMouseMove), 100);
}

function showCursor() {
  const el = document.getElementById(gameScreen.id);
  if (!el) return;
  el.style.cursor = "default";
  el.removeEventListener("mousemove", onMouseMove);
  if (cursorHideTimer) {
    clearTimeout(cursorHideTimer);
    cursorHideTimer = null;
  }
}

function addPauseButton() {
  const pauseButton = createButton({
    label: "pause",
    id: "pauseButton",
    className: "pause-button",
    onClick: () => changeGameState({ action: "state", payload: "paused" }),
  });
  addToScreen(pauseButton, gameScreen.id);
}

function addResumeButton() {
  const resumeButton = createButton({
    label: "resume",
    id: "resumeButton",
    className: "pause-button",
    onClick: () => changeGameState({ action: "state", payload: "playing" }),
  });
  addToScreen(resumeButton, gameScreen.id);
}

// add ship and then add rocks after a set time and set score to 0
function setUpLevel() {
  if (endScreenTimer) {
    clearTimeout(endScreenTimer);
    endScreenTimer = null;
  }
  changeGameState({ action: "reset game" });
  addNewShip(gameScreen.centre);
  setTimeout(
    () =>
      addNewRocksForNewLevel({
        rockAmount: 8,
        screenSize: gameScreen.dimensions,
      }),
    1000,
  );
}

function onEnter(screen: string) {
  switch (screen) {
    case "start":
      changeGameState({ action: "state", payload: "start" });
      addToScreen(
        createStartScreen(() =>
          changeGameState({ action: "state", payload: "playing" }),
        ),
        gameScreen.id,
      );
      break;
    case "playing":
      changeGameState({ action: "state", payload: "playing" });
      addPauseButton();
      hideCursor();
      break;
    case "pause":
      changeGameState({ action: "state", payload: "paused" });
      removeFromScreen("pauseButton");
      addResumeButton();
      break;
    case "gameover":
      changeGameState({ action: "state", payload: "gameover" });
      showCursor();
      removeFromScreen("pauseButton");
      endScreenTimer = setTimeout(() => {
        endScreenTimer = null;
        if (gameState.state === "gameover") {
          addToScreen(
            createEndScreen(gameState.score, () =>
              changeGameState({ action: "state", payload: "start" }),
            ),
            gameScreen.id,
          );
        }
      }, 3000);
      break;
  }
}

// buttons onClick events are automatically removed so do not need to clean up attachedEvent
function onExit(screen: string) {
  switch (screen) {
    case "start":
      removeFromScreen("startScreen");
      break;
    case "pause":
      removeFromScreen("resumeButton");
      showCursor();
      break;
  }
}

export { onEnter, onExit, setUpLevel };
