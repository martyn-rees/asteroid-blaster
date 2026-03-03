import { constrainNumber } from "../helper.js";

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

// position is the x,y location on the game screen
// velocity is the dx,dy change in position every frame. This is calculated when the bullet is created based on the ship's position, rotation and speed and the bullet's speed.
// velocity should be speed and direction from which dx and dy can be calcualted
export default class Bullet {
  static bulletIDCounter = 0;
  public id: string;
  public bulletPower: number;
  public velocity: { dx: number; dy: number };
  public position: { x: number; y: number };
  public endurance: number;
  public r: number;

  constructor(
    initialPosition: { x: number; y: number },
    initialVelocity: {
      dx: number;
      dy: number;
      initialSpeed?: number;
      initialDirection?: number;
    },
    bulletSpecs: { r: number; endurance: number; power: number },
  ) {
    Bullet.bulletIDCounter++;
    this.id = "bullet" + Bullet.bulletIDCounter;
    this.bulletPower = bulletSpecs.power;
    this.velocity = { dx: initialVelocity.dx, dy: initialVelocity.dy };
    this.position = { x: initialPosition.x, y: initialPosition.y };
    this.endurance = bulletSpecs.endurance;
    this.r = bulletSpecs.r;
  }

  boundary(): { x: number; y: number; r: number } {
    return {
      x: this.position.x,
      y: this.position.y,
      r: this.r,
    };
  }

  update(SCREEN_WIDTH: number, SCREEN_HEIGHT: number) {
    this.endurance--;
    if (this.endurance <= 0) {
      this.bulletPower = 0;
    } else {
      let newX = this.position.x + this.velocity.dx;
      let newY = this.position.y - this.velocity.dy;
      this.position.x = constrainNumber(newX, 0, SCREEN_WIDTH);
      this.position.y = constrainNumber(newY, 0, SCREEN_HEIGHT);
    }
  }

  render(renderCallback: Function) {
    renderCallback(this.id, this.position.x, this.position.y);
  }
}
