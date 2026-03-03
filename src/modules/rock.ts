import { constrainNumber } from "../helper.js";

type RockSpec = {
  size: string;
  r: number;
  rotationRate: number;
};

export default class Rock {
  static rockIDCounter = 0;
  public id: string;
  public size: string;
  public r: number;
  public rotationRate: number;
  public velocity: { speed: number; direction: number };
  public x: number;
  public y: number;
  public rotation: number;

  constructor(
    initialPosition: { x: number; y: number },
    velocity: { speed: number; direction: number },
    rockSpecs: RockSpec,
  ) {
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

  convertDegreestoRadians(degrees: number) {
    return 0.0174533 * degrees;
  }

  boundary(): { x: number; y: number; r: number } {
    return {
      x: this.x,
      y: this.y,
      r: this.r,
    };
  }

  update(screenWidth: number, screenHeight: number) {
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

  render(renderCallback: Function) {
    renderCallback(this.id, this.x, this.y, this.rotation);
  }
}
