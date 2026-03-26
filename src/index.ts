import { addNewShip } from "./index-ship.ts";
import GameScreen from "./modules/gamescreen.ts";
import { addToScreen, removeFromScreen } from "./render/render.ts";
import { createButton } from "./ui/button.ts";
import { gameLoopRender } from "./render/gamelooprender.ts";
import { changeGameState } from "./state/gameState.ts";
import { addNewRocksForNewLevel } from "./index-rock.ts";
import { gameLoopUpdate } from "./update/gameloopupdate.ts";

var animationId: number;

let gameScreen = new GameScreen("gameScreen", 800, 400);

// GAME loop code
function step(timestamp: number) {
  gameLoop();
}

// rendering
// add gamelements (id, pos, rotation) to rendering list
// map through rendering list. Add ID to previous list
// if ID is not in previous list then create element
// if ID is in previous list then update element position and rotation
// if ID is not in current list but is in previous list then remove element
function gameLoop() {
  const { gameState } = gameLoopUpdate(gameScreen);
  // DOM rendering
  gameLoopRender(gameState, gameScreen.id);

  animationId = window.requestAnimationFrame(step);
}

/* set up game */
//TODO: uses render method
// add start button, instructions, clear up old events and score
function startButtonHandler() {
  // set state to "game-screen" - exit currentScreen,  enter nextScreen, set currentScreen to nextScreen
  exitStartScreen();
  enterGameScreen();
}

function pauseButtonHandler() {
  exitPlayGameScreen();
  enterPauseGameScreen();
}

function resumeButtonHandler() {
  exitPauseGameScreen();
  enterPlayGameScreen();
}

function enterStartScreen() {
  const startButton = createButton({
    label: "start",
    id: "startButton",
    className: "start-button",
    buttonCallback: startButtonHandler,
  });
  addToScreen(startButton, gameScreen.id);
}

function exitStartScreen() {
  removeFromScreen("startButton");
}

function enterPauseGameScreen() {
  const resumeButton = createButton({
    label: "resume",
    id: "resumeButton",
    className: "pause-button",
    buttonCallback: resumeButtonHandler,
  });
  addToScreen(resumeButton, gameScreen.id);
}

function exitPauseGameScreen() {
  cancelAnimationFrame(animationId);
  animationId = requestAnimationFrame(step);
  removeFromScreen("resumeButton");
}

function enterPlayGameScreen() {
  const pauseButton = createButton({
    label: "pause",
    id: "pauseButton",
    className: "pause-button",
    buttonCallback: pauseButtonHandler,
  });
  addToScreen(pauseButton, gameScreen.id);
}

function exitPlayGameScreen() {
  cancelAnimationFrame(animationId);
  removeFromScreen("pauseButton");
}

/* end of handlers */
// TODO: uses render method
function enterGameScreen() {
  enterPlayGameScreen();
  changeGameState({ action: "score", gameElement: 0 });

  addNewShip(gameScreen.screenCentre);

  setTimeout(
    () =>
      addNewRocksForNewLevel({
        rockAmount: 8,
        screenSize: gameScreen.screenSize,
      }),
    1000,
  );

  cancelAnimationFrame(animationId);
  animationId = requestAnimationFrame(step);
}

function setUpEndScreen() {}

// TODO: uses GameScreen instance
function init() {
  window.addEventListener("resize", function (event) {
    setGameScreenSize(gameScreen);
  });
  setGameScreenSize(gameScreen);
  enterStartScreen();
}
/* end of set up game */

init();

// events code
// TODO: get game screen size and set dimesniosn of GameScreen instance
export function setGameScreenSize(screen: GameScreen) {
  let screenNode: HTMLElement = document.getElementById(screen.id)!;
  screen.screenSize = {
    w: screenNode.offsetWidth,
    h: screenNode.offsetHeight,
  };
}
// end of events code
