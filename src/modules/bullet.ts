import { Circle, Position, Velocity } from "./types";
import { getNewPosition } from "../utils/maths";
import { transform } from "../utils/helper";

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
export default class Bullet {
  static bulletIDCounter = 0;
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
    Bullet.bulletIDCounter++;
    this.id = "bullet" + Bullet.bulletIDCounter;
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
  update(transformX?: Function, transformY?: Function) {
    const newPosition = getNewPosition(this.position, this.velocity);
    const screenPosition = transform(newPosition, transformX, transformY);

    this.position = screenPosition;
    this.endurance--;
    if (this.endurance <= 0) {
      this.bulletPower = 0;
    }
  }
}
