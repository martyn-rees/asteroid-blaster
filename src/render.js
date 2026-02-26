const renderType = "css";

// change position and rotation to element already on screen
// TODO maybe provide additonalCLass property which could be used for examples such as ships thrust
// could be Display.update
export const updateElement = (id, x, y, rotation) => {
  let el = document.getElementById(id);
  el.style.left = x + "px";
  el.style.top = y + "px";
  if (rotation) {
    el.style.transform = `rotate(${rotation}deg)`;
  }
};

export const renderThrust = (thrustPower) => {
  const thrustStyle = thrustPower > 0 ? "block" : "none";
  document.getElementById("thrust").style.display = thrustStyle;
};

// DOM functions
export function addElement(newEl, screenId) {
  let screenNode = document.getElementById(screenId);
  screenNode.appendChild(newEl);
}

// create a div with id and class and internal style as parent for SVG graphic
// could be Display.add
export function createElement(id, className, style, graphicSVG) {
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
export function deleteElement(elId) {
  let elNode = document.getElementById(elId);
  elNode.parentNode.removeChild(elNode);
}
// end of DOM functions
