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
}
