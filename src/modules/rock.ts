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
    return 0.01745329252 * degrees;
  }

  boundary(): Circle {
    return {
      x: this.position.x,
      y: this.position.y,
      r: this.r,
    };
  }

  // return new position rounds to 1 decimal place
  calculateNewPosition({
    position,
    velocity,
  }: {
    position: Position;
    velocity: Velocity;
  }): Position {
    const radians = this.convertDegreestoRadians(velocity.direction);
    const dx = velocity.speed * Math.cos(radians);
    const dy = velocity.speed * Math.sin(radians);
    // toFixed returns a string .e.g. "1.5", the pre-pended plus turns it back in to a number 1.5 (losing any trailing 0's)
    let x = +(position.x + dx).toFixed(1);
    let y = +(position.y + dy).toFixed(1);
    return { x, y };
  }

  update(transformXCallback?: Function, transformYCallback?: Function) {
    const newPosition = this.calculateNewPosition({
      position: this.position,
      velocity: this.velocity,
    });
    this.rotation += this.rotationRate;
    // use transforms to update position of rock on game screen
    this.position.x = transformXCallback
      ? transformXCallback(newPosition.x)
      : newPosition.x;
    this.position.y = transformYCallback
      ? transformYCallback(newPosition.y)
      : newPosition.y;
  }

  render(renderCallback: Function) {
    renderCallback(this.id, this.position.x, this.position.y, this.rotation);
  }
}
