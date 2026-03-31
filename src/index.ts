import GameScreen from "./modules/gamescreen.ts";
import { changeGameState, gameState } from "./state/gameState.ts";
import { gameLoopUpdate } from "./update/gameloopupdate.ts";
import { gameLoopRender } from "./render/gamelooprender.ts";
import { onEnter, onExit, setUpLevel } from "./actions/events.ts";

export let gameScreen = new GameScreen("gameScreen", 800, 400);

// GAME loop code
function step(timestamp: number) {
  const currentState = gameState.state;
  const previousState = gameState.previousState;
  switch (currentState) {
    case "start":
      if (previousState !== "start") {
        onEnter("start");
      }
      break;
    case "playing":
      if (previousState === "start") {
        // if previous "menu" exit menu screen, setUpGame (set up ship, asteroids, score), add pause
        onExit("start");
        setUpLevel();
        onEnter("playing");
      }
      if (previousState === "paused") {
        onExit("pause");
        onEnter("playing");
      }
      gameLoop();
      break;
    case "paused":
      if (previousState === "playing") {
        onEnter("pause");
      }
      break;
    case "gameover":
      console.log("gameover");
      break;
  }

  window.requestAnimationFrame(step);
}

function gameLoop() {
  const { gameState } = gameLoopUpdate(gameScreen);
  gameLoopRender(gameState, gameScreen.id);
}

// TODO: uses GameScreen instance
function init() {
  window.addEventListener("resize", function (event) {
    setGameScreenSize(gameScreen);
  });
  setGameScreenSize(gameScreen);
  changeGameState({ action: "state", payload: "start" });
  requestAnimationFrame(step);
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
