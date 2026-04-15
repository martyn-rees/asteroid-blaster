import { gameScreen } from "../index.ts";

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

export { hideCursor, showCursor };
