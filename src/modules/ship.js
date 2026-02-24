import { renderThrust, updateElement } from "../render.js";

const FULLDEGREE = 360;
export default class Ship {
  constructor(pos, id, shipSpecs) {
    this.id = id;
    // position
    this.x = pos.x;
    this.y = pos.y;
    // ship specifications - this can be passed in for different ships
    this.speedMax = shipSpecs.speedMax;
    this.drag = shipSpecs.drag;
    this.thrustMax = shipSpecs.thrustMax;
    this.r = shipSpecs.radius;
    this.rotationSpeed = shipSpecs.rotationSpeed;
    // ship state
    this.rotation = { degrees: 0, radians: 0 };
    this.thrustPower = 0;
    // velocity
    this.direction = { degrees: 0, radians: 0 };
    this.shipSpeed = 0;
    // gun specifications - this can be passed in for different gunpower and position. Need to use array if more than one gun
    this.gunSpecs = { barrelLocation: { x: 0, y: 0 }, speed: 0, reloadTime: 0 };
    this.gunReloadTimer = 0;
  }

  attachGun(gunSpecs) {
    this.gunSpecs = gunSpecs;
  }

  updateShipActions(thrust, rotateCounterClockwise, rotateClockwise) {
    this.thrustPower = thrust ? this.thrustMax : 0;
    if (rotateCounterClockwise) {
      this.changeShipRotation(-this.rotationSpeed);
    }
    if (rotateClockwise) {
      this.changeShipRotation(this.rotationSpeed);
    }
  }

  convertDegreestoRadians(degrees) {
    return 0.0174533 * degrees;
  }
  convertRadiansToDegrees(radians) {
    return 57.2958 * radians;
  }
  // calculate new speed and direction
  calculateNewVelocity() {
    const driftSpeed =
      this.shipSpeed > this.drag ? this.shipSpeed - this.drag : 0;
    const driftX = driftSpeed * Math.sin(this.direction.radians);
    const driftY = driftSpeed * Math.cos(this.direction.radians);

    const thrustX = this.thrustPower * Math.sin(this.rotation.radians);
    const thrustY = this.thrustPower * Math.cos(this.rotation.radians);

    let dx = driftX + thrustX;
    let dy = driftY + thrustY;

    // shipSpeed
    this.shipSpeed = Math.sqrt(dx * dx + dy * dy);
    if (dy == 0) {
      dy = -0.001;
    }
    this.direction.radians = Math.atan(dx / dy);
    this.direction.degrees = this.convertRadiansToDegrees(
      this.direction.radians,
    );

    if (dy < 0) {
      // Add PI radians or 180 degrees
      this.direction.degrees += 180;
      this.direction.radians += Math.PI;
    }

    if (this.shipSpeed > this.speedMax) {
      this.shipSpeed = this.speedMax;
    }
  }

  update(SCREEN_WIDTH, SCREEN_HEIGHT) {
    this.gunReloadTimer--;

    this.calculateNewVelocity();
    this.x += this.shipSpeed * Math.sin(this.direction.radians);
    this.y -= this.shipSpeed * Math.cos(this.direction.radians);

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
    this.rotation.degrees += dRot;
    if (this.rotation.degrees < 0) {
      this.rotation.degrees += FULLDEGREE;
    } else if (this.rotation.degrees > FULLDEGREE) {
      this.rotation.degrees -= FULLDEGREE;
    }
    this.rotation.radians = this.convertDegreestoRadians(this.rotation.degrees);
  }

  /* GUN functions */
  // If a ship gets upgraded then it could have multiple guns and we can just pass in the gun position that we want to fire from when we create the bullet.
  getGunPosition() {
    const gunlength = this.gunSpecs.barrelLocation.y;
    const x = this.x + gunlength * Math.sin(this.rotation.radians);
    const y = this.y - gunlength * Math.cos(this.rotation.radians);
    return { x, y };
  }
  getBulletVelocity() {
    // bullet velocity is bullet speed in the direction of ship rotation plus velocity of ship
    // bullet speed should be related to gun power so that if we add power ups to the game then we can just increase the gun power and the bullet speed will increase accordingly.
    // That way we don't have to change any of the bullet code when we add power ups to the game.
    // We can also add different types of bullets with different speeds and just pass in the bullet type when we create the bullet and then calculate the bullet speed based on the bullet type. That way we can easily add new types of bullets to the game without having to change any of the existing code.
    // shipSpeed
    const shipVelocityX = this.shipSpeed * Math.sin(this.direction.radians);
    const shipVelocityY = this.shipSpeed * Math.cos(this.direction.radians);

    const dx =
      shipVelocityX + this.gunSpecs.speed * Math.sin(this.rotation.radians);
    const dy =
      shipVelocityY + this.gunSpecs.speed * Math.cos(this.rotation.radians);
    return {
      dx,
      dy,
      initialSpeed: this.gunSpecs.speed,
      initialDirection: this.rotation,
    };
  }

  reloadGun() {
    this.gunReloadTimer = this.gunSpecs.reloadTime;
  }

  isGunLoaded() {
    return this.gunReloadTimer <= 0;
  }
  /* end of GUN functions */

  render() {
    updateElement(this.id, this.x, this.y, this.rotation.degrees);
    renderThrust(this.thrustPower);
  }
}
