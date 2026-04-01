import Container from "./modules/container.ts";
import { changeGameState, gameState } from "./state/gameState.ts";
import { gameLoopUpdate } from "./update/gameloopupdate.ts";
import { gameLoopRender } from "./render/gamelooprender.ts";
import { onEnter, onExit, setUpLevel } from "./actions/events.ts";

export let gameScreen = new Container("gameScreen", 800, 400);

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

function init() {
  changeGameState({ action: "state", payload: "start" });
  requestAnimationFrame(step);
}

init();
