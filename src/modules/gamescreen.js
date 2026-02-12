export default class GameScreen {
  constructor(id, w, h) {
    this.id = id;
    this.width = w;
    this.height = h;
  }

  getScreenCentre() {
    return { x: this.width / 2, y: this.height / 2 };
  }

  getRandomScreenPosition() {
    return {
      x: Math.random() * this.width,
      y: Math.random() * this.height,
    };
  }

  getRandomEdgePosition() {
    let { x, y } = this.getRandomScreenPosition();
    // Randomly choose an edge (0=top, 1=right, 2=bottom, 3=left)
    let edge = Math.floor(Math.random() * 4);
    switch (edge) {
      case 0: // top
        return { x: x, y: 0 };
      case 1: // right
        return { x: this.width, y: y };
      case 2: // bottom
        return { x: x, y: this.height };
      case 3: // left
        return { x: 0, y: y };
    }
  }

  // DOM functions
  resizeGameScreenSize() {
    let gameScreen = document.getElementById(this.id);
    this.width = gameScreen.offsetWidth;
    this.height = gameScreen.offsetHeight;
  }

  addToGameWindow = (newEl) => {
    let gameScreen = document.getElementById(this.id);
    gameScreen.appendChild(newEl);
  };

  // createGameElement and removeNode do not use any properties of GameScreen, so they could be moved outside the class if desired
  createGameElement = (id, className, style, graphicSVG) => {
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
  };

  removeNode = (elId) => {
    let elNode = document.getElementById(elId);
    elNode.parentNode.removeChild(elNode);
  };
}
// end of DOM functions
