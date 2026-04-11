import { getNewPosition } from "../utils/maths-motionstate.ts";
// use left-hand cartesian coords (standard screen coords with +ve y axis pointing down)
// rotation angles: 0 - east, 90 - south, 180 - west, 270 - north
import { Circle, Position, Velocity } from "./types.ts";

export default class Rock {
  static rockIDCounter = 0;
  public index: number;
  public id: string;
  public size: string;
  public r: number;
  public rotationRate: number;
  public velocity: Velocity;
  public position: Position;
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
    this.index = Rock.rockIDCounter++;
    this.id = "rock" + this.index;
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

  boundary(): Circle {
    return {
      x: this.position.x,
      y: this.position.y,
      r: this.r,
    };
  }

  update(
    transformXCallback?: Function,
    transformYCallback?: Function,
    dt: number = 1,
  ) {
    const newPosition = getNewPosition(this.position, this.velocity, dt);
    this.rotation += this.rotationRate * dt;
    // use transforms to update position of rock on game screen
    this.position.x = transformXCallback
      ? transformXCallback(newPosition.x)
      : newPosition.x;
    this.position.y = transformYCallback
      ? transformYCallback(newPosition.y)
      : newPosition.y;
  }
}
