export default class GameScreen {
  constructor(id, w, h) {
    this.id = id;
    this.width = w;
    this.height = h;
  }

  setGameScreenDimensions(w, h) {
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

  getRandomEdgePosition(edge) {
    let { x, y } = this.getRandomScreenPosition();
    switch (edge) {
      case "top":
        return { x: x, y: 0 };
      case "right":
        return { x: this.width, y: y };
      case "bottom":
        return { x: x, y: this.height };
      case "left":
        return { x: 0, y: y };
    }
  }
}
