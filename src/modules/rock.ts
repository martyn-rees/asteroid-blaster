// use left-hand cartesian coords (standard screen coords with +ve y axis pointing down)
// rotation angles: 0 - east, 90 - south, 180 - west, 270 - north
import { Circle, Position, Velocity } from "./types";

export default class Rock {
  static rockIDCounter = 0;
  public id: string;
  public size: string;
  public r: number;
  public rotationRate: number;
  private velocity: Velocity;
  private position: Position;
  public rotation: number;

  constructor({
    initialPosition,
    initialVelocity,
    size,
    r,
    rotationRate,
  }: {
    initialPosition: Position;
    initialVelocity: Velocity;
    size: string;
    r: number;
    rotationRate: number;
  }) {
    // constant values for life of this rock
    this.id = "rock" + Rock.rockIDCounter++;
    this.size = size;
    this.r = r;
    this.rotationRate = rotationRate;

    // these values change per frame
    this.velocity = {
      speed: initialVelocity.speed,
      direction: initialVelocity.direction,
    };
    this.position = { x: initialPosition.x, y: initialPosition.y };
    this.rotation = 0;
  }

  public get rockPosition(): Position {
    return this.position;
  }

  convertDegreestoRadians(degrees: number) {
    return 0.0174533 * degrees;
  }

  boundary(): Circle {
    return {
      x: this.position.x,
      y: this.position.y,
      r: this.r,
    };
  }

  update(transformXCallback?: Function, transformYCallback?: Function) {
    const radians = this.convertDegreestoRadians(this.velocity.direction);
    const dx = this.velocity.speed * Math.cos(radians);
    const dy = this.velocity.speed * Math.sin(radians);
    let newX = this.position.x + dx;
    let newY = this.position.y + dy;
    this.rotation += this.rotationRate;
    // use transforms to update position of rock on game screen
    this.position.x = transformXCallback ? transformXCallback(newX) : newX;
    this.position.y = transformYCallback ? transformYCallback(newY) : newY;
  }

  render(renderCallback: Function) {
    renderCallback(this.id, this.position.x, this.position.y, this.rotation);
  }
}
