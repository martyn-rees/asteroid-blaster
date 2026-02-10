import { render } from "../render.js";

export default class Rock {
  constructor(x, y, r, speed, id, size) {
    this.rotation = 0;
    this.dr = 2 * Math.random() - 1;
    this.id = id;
    this.x = x;
    this.y = y;
    this.r = r;
    let radians = Math.random() * Math.PI * 2;
    this.dx = speed * Math.sin(radians);
    this.dy = speed * Math.cos(radians);
    this.size = size;
  }

  update(SCREEN_X, SCREEN_Y) {
    if (this.x - this.r < 0) {
      this.dx = Math.abs(this.dx);
    } else if (this.x + this.r > SCREEN_X) {
      this.dx = -Math.abs(this.dx);
    }
    if (this.y - this.r < 0) {
      this.dy = Math.abs(this.dy);
    } else if (this.y + this.r > SCREEN_Y) {
      this.dy = -Math.abs(this.dy);
    }
    let newX = this.x + this.dx;
    let newY = this.y + this.dy;
    this.x = newX;
    this.y = newY;
    this.rotation += this.dr;
    //this.x = constrainNumber(newX, 0, SCREEN_X)
    //this.y = constrainNumber(newY, 0, SCREEN_Y)
  }

  render() {
    render(this.id, this.x, this.y, this.rotation);
  }
}
