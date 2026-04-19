import {
  Circle,
  GameEntity,
  Position,
  UpdateOptions,
  Velocity,
} from "../types.ts";
import { getNewPosition } from "../utils/physics.ts";
import { transform } from "../utils/maths.ts";

// bullet specifications
// endurance - a bullet only lasts for a short time after being fired. Count this down every frame (or time if using time based animation)
// when this time is up the bulletPower becomes 0 signifying that the bullet can be removed
// bulletPower can be any number and can be used to indicate damage it can inflict
// r is radius of bullet. larger bullets have a larger hit area
export type BulletSpec = {
  r: number;
  endurance: number;
  power: number;
};

// left hand cartesian coords reverse y-asix
// directions: east 0, south Math.PI/2, west Math.PI, north 1.5 * Math.PI
let bulletIDCounter = 0;

export function resetBulletIDCounter() {
  bulletIDCounter = 0;
}

export default class Bullet implements GameEntity {
  public id: string;
  public bulletPower: number;
  public velocity: Velocity;
  public position: Position;
  public endurance: number;
  public r: number;

  constructor({
    initialPosition,
    velocity,
    bulletSpecs,
  }: {
    initialPosition: Position;
    velocity: Velocity;
    bulletSpecs: BulletSpec;
  }) {
    bulletIDCounter++;
    this.id = "bullet" + bulletIDCounter;
    this.bulletPower = bulletSpecs.power;
    this.velocity = velocity;
    this.position = initialPosition;
    this.endurance = bulletSpecs.endurance;
    this.r = bulletSpecs.r;
  }

  boundary(): Circle {
    return {
      x: this.position.x,
      y: this.position.y,
      r: this.r,
    };
  }

  // change endurance, bulletPower and position
  update({ onExitBounds, deltaTime = 1 }: UpdateOptions = {}) {
    const newPosition = getNewPosition(this.position, this.velocity, deltaTime);
    this.position = transform(newPosition, onExitBounds);
    this.endurance -= deltaTime;
    if (this.endurance <= 0) {
      this.bulletPower = 0;
    }
  }
}
