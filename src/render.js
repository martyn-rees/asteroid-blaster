const renderType = "css";

export const render = (id, x, y, rotation) => {
  let el = document.getElementById(id);
  el.style.left = x + "px";
  el.style.top = y + "px";
  if (rotation) {
    el.style.transform = `rotate(${rotation}deg)`;
  }
};

export const renderShip = (id, x, y, shipAngle, shipThrust) => {
  const thrustDisplay = shipThrust ? "block" : "none";
  document.getElementById("thrust").style.display = thrustDisplay;

  let degrees = (shipAngle * 180) / Math.PI;
  render(id, x, y, degrees);
};

export function renderScreen(ship, rocks, bullets, gameScreen) {
  ship.render();
  for (var rock in rocks.rockList) {
    rocks.rockList[rock].render();
  }
  for (var bullet in bullets.bulletList) {
    bullets.bulletList[bullet].update(gameScreen.width, gameScreen.height);
    bullets.bulletList[bullet].render();
  }
}
