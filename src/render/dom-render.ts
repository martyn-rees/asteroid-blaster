import Rock from "../entities/rock.ts";
import Ship from "../entities/ship.ts";
import Bullet from "../entities/bullet.ts";
import Gun from "../entities/gun.ts";
import { asteroidsSVG, shipSVG } from "../assets/graphics.ts";

// change position and rotation to element already on screen
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

export function createRock(rock: Rock): HTMLElement {
  const rockSVG = asteroidsSVG[rock.index % asteroidsSVG.length];
  const rockStyle = `height:${2 * rock.r}px; width:${2 * rock.r}px; margin-left:-${rock.r}px; margin-top:-${rock.r}px;`;
  const rockClass = rock.size === "small" ? "rock" : "rock glow";
  return createElement(rock.id, rockClass, rockStyle, rockSVG);
}

export function createShip(ship: Ship): HTMLElement {
  return createElement(ship.id, "ship", null, shipSVG());
}

export function createBullet(bullet: Bullet): HTMLElement {
  return createElement(bullet.id, "bullet", null, null);
}

export function createGun(gun: Gun): HTMLElement {
  return createElement(gun.id, "gun", null, null);
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
