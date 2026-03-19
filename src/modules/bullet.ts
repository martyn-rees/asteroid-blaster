// bullet specifications
// endurance - a bullet only lasts for a short time after being fired. Count this down every frame (or time if using time based animation)
// when this time is up the bulletPower becomes 0 signifying that the bullet can be removed
// bulletPower can be any number and can be used to indicate damage it can inflict
// r is radius of bullet. larger bullets have a larger hit area
/*
    r: number = 2,
    endurance: number = 90,
    power: number = 1,
*/

import { Circle, Position, Velocity } from "./types";

// position is the x,y position on the game screen
// velocity should be speed and direction in radians
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
    bulletSpecs: { r: number; endurance: number; power: number };
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

  update(transformXCallback?: Function, transformYCallback?: Function) {
    this.endurance--;
    if (this.endurance <= 0) {
      this.bulletPower = 0;
    } else {
      const dx = this.velocity.speed * Math.cos(this.velocity.direction);
      const dy = this.velocity.speed * Math.sin(this.velocity.direction);
      let newX = this.position.x + dx;
      let newY = this.position.y + dy;
      this.position.x = transformXCallback ? transformXCallback(newX) : newX;
      this.position.y = transformYCallback ? transformYCallback(newY) : newY;
    }
  }

  render(renderCallback: Function) {
    renderCallback(this.id, this.position.x, this.position.y);
  }
}
