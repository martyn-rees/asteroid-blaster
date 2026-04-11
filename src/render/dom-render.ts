// change position and rotation to element already on screen
// TODO maybe provide additonalCLass property which could be used for examples such as ships thrust
// could be Display.update
export const redrawOnScreen = (
  id: string,
  x: number,
  y: number,
  rotation?: number,
) => {
  let el: HTMLElement = document.getElementById(id)!;
  el.style.left = x + "px";
  el.style.top = y + "px";
  if (rotation) {
    el.style.transform = `rotate(${rotation}rad)`;
  }
};

export function displayScore(score: number) {
  document.getElementById("gameScore")!.innerHTML = "SCORE: " + score;
}

export const renderThrust = (thrustPower: number) => {
  const thrustStyle = thrustPower > 0 ? "block" : "none";
  document.getElementById("thrust")!.style.display = thrustStyle;
};

// DOM functions
export function addToScreen(newEl: HTMLElement, screenId: string) {
  let screenNode = document.getElementById(screenId);
  if (screenNode) {
    screenNode.appendChild(newEl);
  } else {
    console.error("no parent node with id:", screenId);
  }
}

// create a div with id and class and internal style as parent for SVG graphic
// could be Display.add
export function createElement(
  id: string,
  className: string,
  style: string | null,
  graphicSVG: string | null,
): HTMLElement {
  let divElement = document.createElement("div");
  divElement.setAttribute("id", id);
  divElement.setAttribute("class", className);
  if (style) {
    divElement.setAttribute("style", style);
  }
  if (graphicSVG) {
    divElement.innerHTML = graphicSVG;
  }
  return divElement;
}

export function createRockElement({
  id,
  r,
  asteroidImage,
  size,
}: {
  id: string;
  r: number;
  asteroidImage: string;
  size: string;
}): HTMLElement {
  let rockStyle = `height:${2 * r}px; width:${2 * r}px; margin-left:-${r}px; margin-top:-${r}px;`;
  const rockClass = size === "small" ? "rock" : "rock glow";

  const el = createElement(id, rockClass, rockStyle, asteroidImage);
  return el;
}

export function removeFromScreen(elId: string) {
  let elNode: HTMLElement | null = document.getElementById(elId);
  if (elNode) {
    if (elNode.parentNode) {
      elNode.parentNode.removeChild(elNode);
    } else {
      console.error("Error: No parent node for element with id:", elId);
    }
  } else {
    console.error("Error: can't find element with id:", elId);
  }
}

export function getSoundForAction(action: string): string {
  if (action === "shoot") {
    return "./sounds/shoot.wav";
  } else if (action === "rock-explosion") {
    return "./sounds/rock-explosion.mp3";
  } else {
    console.error(`Sound action ${action} not recognised`);
    return "";
  }
}

export function playSound(soundDescription: string) {
  const soundurl: string = getSoundForAction(soundDescription);
  if (soundurl !== "") {
    const sound = new Audio(soundurl);
    sound.volume = 0.1;
    sound.load();
    sound.play();
  }
}
