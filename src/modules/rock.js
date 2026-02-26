import { constrainNumber } from "../helper.js";

export default class Rock {
  static rockIDCounter = 0;
  constructor(initialPosition, velocity, rockSpecs) {
    // constant values for life of this rock
    this.id = "rock" + Rock.rockIDCounter++;
    this.size = rockSpecs.size;
    this.r = rockSpecs.r;
    this.rotationRate = rockSpecs.rotationRate;

    // these values change per frame
    this.velocity = velocity;
    this.x = initialPosition.x;
    this.y = initialPosition.y;
    this.rotation = 0;
  }

  // alternatrive to warping to other side of screen
  /*bounceOffWalls(screenWidth, screenHeight) {
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
  }*/

  convertDegreestoRadians(degrees) {
    return 0.0174533 * degrees;
  }

  update(screenWidth, screenHeight) {
    // update new location of rock based on velocity
    const radians = this.convertDegreestoRadians(this.velocity.direction);
    const dx = this.velocity.speed * Math.sin(radians);
    const dy = this.velocity.speed * Math.cos(radians);
    let newX = this.x + dx;
    let newY = this.y + dy;

    this.rotation += this.rotationRate;
    this.x = constrainNumber(newX, 0, screenWidth);
    this.y = constrainNumber(newY, 0, screenHeight);
  }

  render(renderCallback) {
    renderCallback(this.id, this.x, this.y, this.rotation);
  }
}
