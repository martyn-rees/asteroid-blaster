import { getNewPosition } from "../utils/physics.ts";
import { PositionTransform } from "../types.ts";
// use left-hand cartesian coords (standard screen coords with +ve y axis pointing down)
// rotation angles: 0 - east, 90 - south, 180 - west, 270 - north
import { Circle, GameEntity, Position, Velocity } from "../types.ts";
import { RockSize } from "../config/game-entity-specs.ts";

export default class Rock implements GameEntity {
  static rockIDCounter = 0;
  public index: number;
  public id: string;
  public size: RockSize;
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
    size: RockSize;
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

  update(transformPosition?: PositionTransform, dt: number = 1) {
    const newPosition = getNewPosition(this.position, this.velocity, dt);
    this.rotation += this.rotationRate * dt;
    this.position = transformPosition
      ? transformPosition(newPosition)
      : newPosition;
  }
}
