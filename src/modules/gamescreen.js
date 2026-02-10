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

  resizeGameScreenSize() {
    let gameScreen = document.getElementById(this.id);
    this.width = gameScreen.offsetWidth;
    this.height = gameScreen.offsetHeight;
  }

  addToGameWindow = (newEl) => {
    let gameScreen = document.getElementById(this.id);
    gameScreen.appendChild(newEl);
  };

  removeNode = (elId) => {
    let elNode = document.getElementById(elId);
    elNode.parentNode.removeChild(elNode);
  };
}
