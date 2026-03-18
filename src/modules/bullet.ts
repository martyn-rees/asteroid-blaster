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
// dxdy is the dx,dy change in position every frame.
// velocity should be speed and direction from which dx and dy can be calcualted
// left hand cartesian coords reverse y-asix
// directions: east 0, south Math.PI/2, west Math.PI, north 1.5 * Math.PI
export default class Bullet {
  static bulletIDCounter = 0;
  public id: string;
  public bulletPower: number;
  // TODO: remove dxdy when velocity calcualtions work
  public dxdy: { dx: number; dy: number };
  // TODO: calculations that create testdxdy should result in the same value as dxdy
  public testdxdy: { dx: number; dy: number };
  public velocity: Velocity;
  public position: Position;
  public endurance: number;
  public r: number;

  constructor(
    // TODO: remove dxdy and testdxdywhen velocity calculations work
    {
      initialPosition,
      dxdy,
      velocity,
      bulletSpecs,
    }: {
      initialPosition: Position;
      dxdy: {
        dx: number;
        dy: number;
      };
      velocity: Velocity;
      bulletSpecs: { r: number; endurance: number; power: number };
    },
  ) {
    Bullet.bulletIDCounter++;
    this.id = "bullet" + Bullet.bulletIDCounter;
    this.bulletPower = bulletSpecs.power;
    // TODO: remove dxdy when velocity calcualtions work
    this.dxdy = { dx: dxdy.dx, dy: dxdy.dy };
    const newdx = velocity.speed * Math.cos(velocity.direction);
    const newdy = velocity.speed * Math.sin(velocity.direction);
    this.testdxdy = { dx: newdx, dy: newdy };
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
      // OLD CALULCATIONS
      let newX = this.position.x + this.dxdy.dx;
      let newY = this.position.y + this.dxdy.dy;
      // use transforms to update position of bullet on game screen
      this.position.x = transformXCallback ? transformXCallback(newX) : newX;
      this.position.y = transformYCallback ? transformYCallback(newY) : newY;
      // NEW CALCULATIONS CAUSE ERROR
      const testDx = this.velocity.speed * Math.sin(this.velocity.direction);
      const testDy = this.velocity.speed * Math.cos(this.velocity.direction);
      this.testdxdy = { dx: testDx, dy: testDy };
      //let testNewX = this.position.x + testDx;
      //let testNewY = this.position.y - testDy;
      //this.position.x = transformXCallback ? transformXCallback(testNewX) : testNewX;
      //this.position.y = transformYCallback ? transformYCallback(testNewY) : testNewY;
    }
  }

  render(renderCallback: Function) {
    renderCallback(this.id, this.position.x, this.position.y);
  }
}
