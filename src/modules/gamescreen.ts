type EDGE = "top" | "right" | "bottom" | "left";
export default class GameScreen {
  public id: string;
  public width: number;
  public height: number;

  constructor(id: string, w: number, h: number) {
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

  private getRandomScreenPosition(): { x: number; y: number } {
    return {
      x: Math.floor(Math.random() * (this.width + 1)),
      y: Math.floor(Math.random() * (this.height + 1)),
    };
  }

  private getRandomEdge(): EDGE {
    const borders: EDGE[] = ["top", "right", "bottom", "left"];
    const edge: EDGE = borders[Math.floor(Math.random() * 4)];
    return edge;
  }

  getRandomEdgePosition(): { x: number; y: number } {
    let { x, y } = this.getRandomScreenPosition();
    let edge = this.getRandomEdge();
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
