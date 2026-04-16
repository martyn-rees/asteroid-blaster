let cursorHideTimer: ReturnType<typeof setTimeout> | null = null;
let mouseMoveHandler: (() => void) | null = null;

function hideCursor(screenId: string) {
  const el = document.getElementById(screenId);
  if (!el) return;
  el.style.cursor = "none";
  mouseMoveHandler = () => {
    el.style.cursor = "default";
    if (cursorHideTimer) clearTimeout(cursorHideTimer);
    cursorHideTimer = setTimeout(() => {
      el.style.cursor = "none";
    }, 2000);
  };
  // delay attaching mousemove — the browser synthesises a mousemove after a button click,
  // which would immediately re-show the cursor. 100ms clears the click event pipeline.
  setTimeout(() => el.addEventListener("mousemove", mouseMoveHandler!), 100);
}

function showCursor(screenId: string) {
  const el = document.getElementById(screenId);
  if (!el) return;
  el.style.cursor = "default";
  if (mouseMoveHandler) {
    el.removeEventListener("mousemove", mouseMoveHandler);
    mouseMoveHandler = null;
  }
  if (cursorHideTimer) {
    clearTimeout(cursorHideTimer);
    cursorHideTimer = null;
  }
}

export { hideCursor, showCursor };
