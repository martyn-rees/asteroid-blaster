import Viewport from "./entities/viewport.ts";
import { changeGameState, gameState } from "./state/gameState.ts";
import { gameLoopUpdate } from "./update/gameloopupdate.ts";
import { gameLoopRender } from "./render/gamelooprender.ts";
import { onEnter, onExit, setUpLevel } from "./events/events.ts";
import { removeFromScreen } from "./render/dom-render.ts";
import { updateFPS } from "./utils/fps.js";
import { debug } from "./render/gamelooprender.js";

export let gameScreen = new Viewport("gameScreen", 800, 400);

const TARGET_FRAME_MS = 1000 / 60;
let previousTimestamp = 0;

// GAME loop code
function step(timestamp: number) {
  const currentState = gameState.state;
  const previousState = gameState.previousState;
  switch (currentState) {
    case "start":
      if (previousState !== "start") {
        if (previousState === "gameover") removeFromScreen("endScreen");
        onEnter("start");
      }
      break;
    case "playing":
      if (previousState === "start") {
        onExit("start");
        setUpLevel();
        onEnter("playing");
        previousTimestamp = 0;
      }
      if (previousState === "paused") {
        onExit("pause");
        onEnter("playing");
        previousTimestamp = 0;
      }
      gameLoop(timestamp);
      break;
    case "paused":
      if (previousState === "playing") {
        onEnter("pause");
      }
      break;
    case "gameover":
      if (previousState === "playing") {
        onEnter("gameover");
      }
      break;
  }

  window.requestAnimationFrame(step);
}

function gameLoop(timestamp: number) {
  if (debug.fps) updateFPS(timestamp);
  const elapsed =
    previousTimestamp === 0 ? TARGET_FRAME_MS : timestamp - previousTimestamp;
  previousTimestamp = timestamp;
  const dt = Math.min(elapsed / TARGET_FRAME_MS, 3);
  gameLoopUpdate(gameScreen, dt);
  gameLoopRender(gameState, gameScreen.id);
}

function init() {
  changeGameState({ action: "state", payload: "start" });
  requestAnimationFrame(step);
}

init();
