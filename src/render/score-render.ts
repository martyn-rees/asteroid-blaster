export function displayScore(score: number) {
  document.getElementById("gameScore")!.innerHTML =
    `<span class="score__label">SCORE</span><span class="score__value">${score}</span>`;
}

export function displayHiScore(hiScore: number) {
  document.getElementById("gameHiScore")!.innerHTML =
    `<span class="score__label">HI-SCORE</span><span class="score__value">${hiScore}</span>`;
}
