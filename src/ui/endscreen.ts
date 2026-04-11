export const endScreen = () => `
<div class="gameover-screen" id="gameoverScreen">
    <img src="./images/stranded_square.gif" class="gameover-end" alt="stranded image" />
    <img src="./images/fixing_square.gif" class="gameover-end" alt="stranded image" style="
    </div>
`;

export function createEndScreen(
  score: number,
  onRestart: () => void,
): HTMLElement {
  const el = document.createElement("div");
  el.setAttribute("id", "endScreen");
  el.setAttribute("class", "end-screen press-start-2p-regular");
  el.innerHTML = `
    <div class="end-screen__title">game over</div>
    <div class="end-screen__score">score: ${score}</div>
    <button id="restartButton" class="end-screen__button">play again</button>
  `;
  el.querySelector("#restartButton")!.addEventListener("click", onRestart, {
    once: true,
  });
  return el;
}
