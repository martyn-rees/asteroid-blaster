import { renderShip } from "../render.js";

const SHIP_GUN_LENGTH = 6;
const GUN_RELOAD_SPEED = 10;
const BULLET_SPEED = 6;
let gunReloadTimer = GUN_RELOAD_SPEED;
// add gunposition and gun power (gunSpeed)
// add helper functions to calculate gun position and bullet velocity based on ship position, rotation and speed. That way the bullet class doesn't have to know anything about the ship at all and is more reusable. We can also add different types of bullets with different speeds and just pass in the bullet type when we create the bullet and then calculate the bullet speed based on the bullet type. That way we can easily add new types of bullets to the game without having to change any of the existing code.
export default class Ship {
  constructor(pos, id) {
    this.maxSpeed = 4.0;
    this.friction = 0.005;
    this.thrust = 0.1;
    this.shipAngle = 0.0;
    this.directionAngle = 0.0;
    this.shipSpeed = 0;
    this.x = pos.x;
    this.y = pos.y;
    this.shipRotation = 0;
    this.shipThrust = false;
    this.id = id;
    this.r = 6;
    this.dr = Math.PI / 90;
    this.FULLRADIAN = 2 * Math.PI;
    this.dx = 0;
    this.dy = 0;
  }

  updateShipActions(thrust, rotateCounterClockwise, rotateClockwise) {
    this.shipThrust = thrust ? true : false;
    if (rotateCounterClockwise) {
      this.changeShipRotation(-this.dr);
    }
    if (rotateClockwise) {
      this.changeShipRotation(this.dr);
    }
  }

  update(SCREEN_WIDTH, SCREEN_HEIGHT) {
    // calculate x,y components of speed, thrust and friction
    let currentSpeedX = this.shipSpeed * Math.sin(this.directionAngle);
    let currentSpeedY = this.shipSpeed * Math.cos(this.directionAngle);
    let frictionX = this.friction * Math.sin(this.directionAngle);
    let frictionY = this.friction * Math.cos(this.directionAngle);
    let thrustX = 0;
    let thrustY = 0;
    if (this.shipThrust) {
      thrustX = this.thrust * Math.sin(this.shipAngle);
      thrustY = this.thrust * Math.cos(this.shipAngle);
    }

    let dx = currentSpeedX - frictionX + thrustX;
    let dy = currentSpeedY - frictionY + thrustY;

    // calculate x,y components of speed
    if (Math.abs(frictionX) > Math.abs(currentSpeedX)) {
      dx = thrustX;
    }

    if (Math.abs(frictionY) > Math.abs(currentSpeedY)) {
      dy = thrustY;
    }

    // shipSpeed
    this.shipSpeed = Math.sqrt(dx * dx + dy * dy);
    if (dy == 0) {
      this.directionAngle = Math.atan(dx / 0.01);
    } else {
      this.directionAngle = Math.atan(dx / dy); // directionAngle in radians
    }

    if (dy < 0) {
      // Add PI radians or 180 degrees
      this.directionAngle = this.directionAngle + 3.1415;
    }

    if (this.shipSpeed > this.maxSpeed) {
      this.shipSpeed = this.maxSpeed;
      dx = this.shipSpeed * Math.sin(this.directionAngle);
      dy = this.shipSpeed * Math.cos(this.directionAngle);
    }

    this.x += dx; //(shipSpeed*sin(shipAngle))
    this.y -= dy; //(shipSpeed*cos(shipAngle))
    this.dx = dx;
    this.dy = dy;

    //amend x,y values to keep ship on screen
    if (this.x < 0) {
      this.x = SCREEN_WIDTH;
    } else if (this.x > SCREEN_WIDTH) {
      this.x = 0;
    }

    if (this.y < 0) {
      this.y = SCREEN_HEIGHT;
    } else if (this.y > SCREEN_HEIGHT) {
      this.y = 0;
    }
  }

  changeShipRotation(dRot) {
    this.shipRotation += dRot;
    if (this.shipRotation < 0) {
      this.shipRotation = this.FULLRADIAN;
    } else if (this.shipRotation > this.FULLRADIAN) {
      this.shipRotation = 0;
    }
    this.shipAngle = this.shipRotation;
  }

  setShipThrust(bool) {
    shipThrust = bool;
  }

  // gun position should be added to ship. If a ship gets upgraded then it could have multiple guns and we can just pass in the gun position that we want to fire from when we create the bullet. That way the bullet class doesn't have to know anything about the ship at all and is more reusable.
  getGunPosition() {
    const x = this.x + SHIP_GUN_LENGTH * Math.sin(this.shipRotation);
    const y = this.y - SHIP_GUN_LENGTH * Math.cos(this.shipRotation);
    return { x, y };
  }
  getBulletVelocity() {
    // bullet speed should be related to gun power so that if we add power ups to the game then we can just increase the gun power and the bullet speed will increase accordingly. That way we don't have to change any of the bullet code when we add power ups to the game. We can also add different types of bullets with different speeds and just pass in the bullet type when we create the bullet and then calculate the bullet speed based on the bullet type. That way we can easily add new types of bullets to the game without having to change any of the existing code.
    const dx = this.dx + BULLET_SPEED * Math.sin(this.shipRotation);
    const dy = this.dy + BULLET_SPEED * Math.cos(this.shipRotation);
    return { dx, dy };
  }

  render() {
    renderShip(this.id, this.x, this.y, this.shipAngle, this.shipThrust);
  }
}
