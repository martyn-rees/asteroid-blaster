const renderType = "css";

export const render = (id, x, y, rotation) => {
  let el = document.getElementById(id);
  el.style.left = x + "px";
  el.style.top = y + "px";
  if (rotation) {
    el.style.transform = `rotate(${rotation}deg)`;
  }
};

export const renderShip = (id, x, y, rotation, shipThrust) => {
  const thrustDisplay = shipThrust ? "block" : "none";
  document.getElementById("thrust").style.display = thrustDisplay;

  let degrees = (rotation * 180) / Math.PI;
  render(id, x, y, degrees);
};

export function renderScreen(ship, rockList, bulletList, gameScreen) {
  ship.render();
  for (var rock in rockList) {
    rockList[rock].render();
  }
  for (var bullet in bulletList) {
    bulletList[bullet].update(gameScreen.width, gameScreen.height);
    bulletList[bullet].render();
  }
}
