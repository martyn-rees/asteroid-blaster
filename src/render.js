const renderType = "css";

// change position and rotation to element already on screen
// TODO maybe provide additonalCLass property which could be used for examples such as ships thrust
// could be Display.update
export const render = (id, x, y, rotation) => {
  let el = document.getElementById(id);
  el.style.left = x + "px";
  el.style.top = y + "px";
  if (rotation) {
    el.style.transform = `rotate(${rotation}deg)`;
  }
};

// TODO this is basically the same as render but also displays ships thrust
// maybe remove this function and call another generic function to display ships thrust
// could provide
export const renderShip = (id, x, y, rotation, shipThrust) => {
  const thrustDisplay = shipThrust ? "block" : "none";
  document.getElementById("thrust").style.display = thrustDisplay;
  render(id, x, y, rotation);
};

// disply game elements, ship, rocks and bullets
// TODO: pass in gameElelemtns object with single items and arrays which get displayed using generic functions
// TODO - why does ony bullets use the update function
export function renderScreen(ship, rockList, bulletList, gameScreen) {
  ship.render(); // this calls render method in ship class which calls renderShip above whch calls render
  for (var rock in rockList) {
    rockList[rock].render(); // this calls render method in rock class which calls render above
  }
  for (var bullet in bulletList) {
    bulletList[bullet].update(gameScreen.width, gameScreen.height);
    bulletList[bullet].render();
  }
}

// DOM functions
export function addElementToGameWindow(newEl, screenId) {
  let screenNode = document.getElementById(screenId);
  screenNode.appendChild(newEl);
}

// create a div with id and class and internal style as parent for SVG graphic
// could be Display.add
export function createGameElement(id, className, style, graphicSVG) {
  let elContainer = document.createElement("div");
  elContainer.setAttribute("id", id);
  elContainer.setAttribute("class", className);
  if (style) {
    elContainer.setAttribute("style", style);
  }
  if (graphicSVG) {
    elContainer.innerHTML = graphicSVG;
  }
  return elContainer;
}

// remove DOM element with matching ID
// could be Display.remove
export function removeNode(elId) {
  let elNode = document.getElementById(elId);
  elNode.parentNode.removeChild(elNode);
}
// end of DOM functions
