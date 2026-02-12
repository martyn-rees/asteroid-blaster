import { render } from "../render.js";
import { constrainNumber } from "../helper.js";

export default class Rock {
  static rockIDCounter = 0;
  constructor(x, y, r, velocity, size, rotationRate) {
    this.x = x;
    this.y = y;
    this.r = r;
    this.velocity = velocity;
    this.size = size;
    this.rotationRate = rotationRate;

    this.id = "rock" + Rock.rockIDCounter++;
    this.rotation = 0;
  }

  update(SCREEN_X, SCREEN_Y) {
    // bounce off walls
    /* if (this.x - this.r < 0) {
      this.velocity.dx = Math.abs(this.velocity.dx);
    } else if (this.x + this.r > SCREEN_X) {
      this.velocity.dx = -Math.abs(this.velocity.dx);
    }
    if (this.y - this.r < 0) {
      this.velocity.dy = Math.abs(this.velocity.dy);
    } else if (this.y + this.r > SCREEN_Y) {
      this.velocity.dy = -Math.abs(this.velocity.dy);
    }*/
    // warp to other side of screen
    let newX = this.x + this.velocity.dx;
    let newY = this.y + this.velocity.dy;
    this.x = newX;
    this.y = newY;
    this.rotation += this.rotationRate;
    this.x = constrainNumber(newX, 0, SCREEN_X);
    this.y = constrainNumber(newY, 0, SCREEN_Y);
  }

  render() {
    render(this.id, this.x, this.y, this.rotation);
  }
}
