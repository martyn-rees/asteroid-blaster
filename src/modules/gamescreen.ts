export default class GameScreen {
  public id: string;
  public width: number;
  public height: number;

  constructor(id: string, w: number, h: number) {
    this.id = id;
    this.width = w;
    this.height = h;
  }

  set screenSize({ w, h }: { w: number; h: number }) {
    this.width = w;
    this.height = h;
  }

  get screenSize(): { screenWidth: number; screenHeight: number } {
    return { screenWidth: this.width, screenHeight: this.height };
  }

  get screenCentre(): { x: number; y: number } {
    return { x: this.width / 2, y: this.height / 2 };
  }
}
