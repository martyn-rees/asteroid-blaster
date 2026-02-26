export default class GameScreen {
  public id: number;
  public width: number;
  public height: number;

  constructor(id: number, w: number, h: number) {
    this.id = id;
    this.width = w;
    this.height = h;
  }

  setGameScreenDimensions(w: number, h: number) {
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

  getRandomEdgePosition(edge: string) {
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
