import Viewport from "./entities/viewport.ts";
import { changeGameState, gameState } from "./state/game-state.ts";

const gameScreen = new Viewport("gameScreen", 800, 400);
import { handleStateTransition } from "./state/state-machine.ts";
import { gameLoopUpdate } from "./update/gameloop-update.ts";
import { gameLoopRender } from "./render/gameloop-render.ts";
import { updateFPS } from "./render/fps.ts";
import { renderConfig, TARGET_FRAME_MS } from "./config/config.ts";
let previousTimestamp = 0;

// GAME loop code
function step(timestamp: number) {
  // handle state transitions and reset gameloop timer on state change
  handleStateTransition(gameState.state, gameState.previousState, gameScreen, () => {
    previousTimestamp = 0;
  });

  // also run during gameover so rocks continue animating in the background
  if (gameState.state === "playing" || gameState.state === "gameover")
    gameLoop(timestamp);

  window.requestAnimationFrame(step);
}

function gameLoop(timestamp: number) {
  if (renderConfig.showFps) updateFPS(timestamp);
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
