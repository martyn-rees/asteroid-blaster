import {
  constrainNumber,
  translateToOppositeSideIfOutside,
} from "../helper.js";
import { render } from "../render.js";

// bulletLife (lifeLeft) - a bullet only lasts for a short time after being fired. Count this down every frame (or time if using time based animation)
// when this time is up the bulletPower becomes 0 signifying that the bullet can be removed
// bulletPower can be any number and can be used to indicate damage it can inflict
// r is radius of bullet. larger bullets have a larger hit area
// position is the x,y location on the game screen
// velocity is the dx,dy change in position every frame. This is calculated when the bullet is created based on the ship's position, rotation and speed and the bullet's speed.
export default class Bullet {
  constructor(id, position, velocity, r = 2, bulletLife = 90, bulletPower) {
    this.id = id;
    this.bulletPower = bulletPower;
    this.velocity = { dx: velocity.dx, dy: velocity.dy };
    this.position = { x: position.x, y: position.y };

    this.lifeLeft = bulletLife;
    this.r = r;
  }

  update(SCREEN_WIDTH, SCREEN_HEIGHT) {
    this.lifeLeft--;
    if (this.lifeLeft <= 0) {
      this.bulletPower = 0;
    } else {
      let newX = this.position.x + this.velocity.dx;
      let newY = this.position.y - this.velocity.dy;
      this.position.x = constrainNumber(newX, 0, SCREEN_WIDTH);
      this.position.y = constrainNumber(newY, 0, SCREEN_HEIGHT);

      /*this.position = translateToOppositeSideIfOutside(this.position, {
        w: SCREEN_WIDTH,
        h: SCREEN_HEIGHT,
      });*/
    }
  }

  render() {
    render(this.id, this.position.x, this.position.y);
  }
}
