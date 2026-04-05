import { keyBindings } from "../assets/gamedata";

function formatKey(code: string): string {
  const labels: Record<string, string> = {
    ArrowLeft: "←",
    ArrowRight: "→",
    ArrowUp: "↑",
    ArrowDown: "↓",
  };
  if (labels[code]) return labels[code];
  if (code.startsWith("Key")) return code.slice(3);
  return code;
}

export function createStartScreen(onStart: () => void): HTMLElement {
  const el = document.createElement("div");
  el.setAttribute("id", "startScreen");
  el.setAttribute("class", "start-screen press-start-2p-regular");
  el.innerHTML = `
    <div class="start-screen__instructions">
      <div class="start-screen__instruction-row">
        <span class="start-screen__key">${formatKey(keyBindings.rotateLeft)} ${formatKey(keyBindings.rotateRight)}</span>
        <span>rotate</span>
      </div>
      <div class="start-screen__instruction-row">
        <span class="start-screen__key">${formatKey(keyBindings.thrust)}</span>
        <span>thrust</span>
      </div>
      <div class="start-screen__instruction-row">
        <span class="start-screen__key">${formatKey(keyBindings.shoot)}</span>
        <span>shoot</span>
      </div>
    </div>
    <button id="startButton" class="start-screen__button">start</button>
  `;
  el.querySelector("#startButton")!.addEventListener("click", onStart, { once: true });
  return el;
}
