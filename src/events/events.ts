import { changeGameState } from "../state/gameState";
import { createButton } from "../ui/button";
import { addToScreen, removeFromScreen } from "../render/dom-render";
import { addNewShip } from "../entities/ship-factory";
import { addNewRocksForNewLevel } from "../entities/rock-factory";
import { gameScreen } from "../index";

let cursorHideTimer: ReturnType<typeof setTimeout> | null = null;

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

/* ADD BUTTONS AND BUTTON HANDLERS */
function addStartButton() {
  const startButton = createButton({
    label: "start",
    id: "startButton",
    className: "start-button",
    onClick: () => changeGameState({ action: "state", payload: "playing" }),
  });
  addToScreen(startButton, gameScreen.id);
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
  changeGameState({ action: "score", payload: 0 });
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
      addStartButton();
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
  }
}

// buttons onClick events are automatically removed so do not need to clean up attachedEvent
function onExit(screen: string) {
  switch (screen) {
    case "start":
      removeFromScreen("startButton");
      break;
    case "pause":
      removeFromScreen("resumeButton");
      showCursor();
      break;
  }
}

export { onEnter, onExit, setUpLevel };
