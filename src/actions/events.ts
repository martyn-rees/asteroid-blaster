import { changeGameState } from "../state/gameState";
import { createButton } from "../ui/button";
import { addToScreen, removeFromScreen } from "../render/render";
import { addNewShip } from "../index-ship";
import { addNewRocksForNewLevel } from "../index-rock";
import { gameScreen } from "../index";

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
  addNewShip(gameScreen.screenCentre);
  setTimeout(
    () =>
      addNewRocksForNewLevel({
        rockAmount: 8,
        screenSize: gameScreen.screenSize,
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
      break;
    case "pause":
      changeGameState({ action: "state", payload: "paused" });
      removeFromScreen("pauseButton");
      addResumeButton();
      break;
  }
}

function onExit(screen: string) {
  switch (screen) {
    case "start":
      removeFromScreen("startButton");
      break;
    case "pause":
      removeFromScreen("resumeButton");
      break;
  }
}

export { onEnter, onExit, setUpLevel };
