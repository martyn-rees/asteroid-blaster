import { render } from "../render.js";
import { constrainNumber } from "../helper.js";

export default class Rock {
  static rockIDCounter = 0;
  constructor(initialPosition, r, velocity, size, rotationRate) {
    this.id = "rock" + Rock.rockIDCounter++;
    this.x = initialPosition.x;
    this.y = initialPosition.y;
    this.r = r;
    this.velocity = velocity;
    this.size = size;
    this.rotationRate = rotationRate;
    this.rotation = 0;
  }

  // alternatrive to warping to other side of screen
  bounceOffWalls(screenWidth, screenHeight) {
    if (this.x - this.r < 0) {
      this.velocity.dx = Math.abs(this.velocity.dx);
    } else if (this.x + this.r > screenWidth) {
      this.velocity.dx = -Math.abs(this.velocity.dx);
    }
    if (this.y - this.r < 0) {
      this.velocity.dy = Math.abs(this.velocity.dy);
    } else if (this.y + this.r > screenHeight) {
      this.velocity.dy = -Math.abs(this.velocity.dy);
    }
  }

  update(screenWidth, screenHeight) {
    // update new location of rock based on velocity
    const dx = this.velocity.speed * Math.sin(this.velocity.directionOfTravel);
    const dy = this.velocity.speed * Math.cos(this.velocity.directionOfTravel);
    let newX = this.x + dx;
    let newY = this.y + dy;
    // check if newX or NewY have collided with screen edge
    /* if (newX < 0 || newX > screenWidth) {
      this.velocity.directionOfTravel =
        Math.PI - this.velocity.directionOfTravel;
      //this.x = constrainNumber(newX, 0, screenWidth);
    }
    if (newY < 0 || newY > screenHeight) {
      this.velocity.directionOfTravel = -this.velocity.directionOfTravel;
      //this.y = constrainNumber(newY, 0, screenHeight);
    }*/
    this.rotation += this.rotationRate;
    this.x = constrainNumber(newX, 0, screenWidth);
    this.y = constrainNumber(newY, 0, screenHeight);
  }

  render() {
    render(this.id, this.x, this.y, this.rotation);
  }
}
