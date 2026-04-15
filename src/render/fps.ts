let lastTimestamp = 0;
let minFps = Infinity;
let maxFps = 0;

function renderFps(fps: number, minFps: number, maxFps: number) {
  const el = document.getElementById("fps");
  if (el) el.textContent = `${fps} fps`;
  const statsEl = document.getElementById("fps-stats");
  if (statsEl) statsEl.textContent = `lo ${minFps}  hi ${maxFps}`;
}

export function updateFPS(timestamp: number) {
  if (lastTimestamp === 0) {
    lastTimestamp = timestamp;
    return;
  }
  const fps = Math.round(1000 / (timestamp - lastTimestamp));
  lastTimestamp = timestamp;
  if (fps < minFps) minFps = fps;
  if (fps > maxFps) maxFps = fps;
  renderFps(fps, minFps, maxFps);
}
