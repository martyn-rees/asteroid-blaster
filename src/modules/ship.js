import { renderShip } from "../render.js";

const FULLRADIAN = 2 * Math.PI;

// spaceShip specifications
/*
maxSpeed: 4.0,
drag: 0.005,
thrust (acceleration): 0.1,
radius (size): 6,
rotationSpeed: Math.PI / 90, // radians per frame
*/

/* gun specs */
//const gunSpecs = { barrelLocation: { x: 0, y: 6 }, speed: 6, reloadTime: 10 };

// add gunposition and gun power (gunSpeed)
// add helper functions to calculate gun position and bullet velocity based on ship position, rotation and speed. That way the bullet class doesn't have to know anything about the ship at all and is more reusable. We can also add different types of bullets with different speeds and just pass in the bullet type when we create the bullet and then calculate the bullet speed based on the bullet type. That way we can easily add new types of bullets to the game without having to change any of the existing code.
export default class Ship {
  constructor(pos, id, shipSpecs) {
    // ship specifications - this can be passed in for different ships
    this.maxSpeed = shipSpecs.maxSpeed;
    this.drag = shipSpecs.drag;
    this.thrust = shipSpecs.thrust;
    this.r = shipSpecs.radius;
    this.dr = shipSpecs.rotationSpeed;
    // ship state
    this.shipRotation = 0;
    // velocity
    this.directionOfTravel = 0.0;
    this.shipSpeed = 0; // shipSpeed and direction are the velocity
    this.dx = 0;
    this.dy = 0;
    // position
    this.x = pos.x;
    this.y = pos.y;

    this.shipThrust = false;

    this.id = id;

    this.gunSpecs = { barrelLocation: { x: 0, y: 0 }, speed: 0, reloadTime: 0 };
    this.gunReloadTimer = 0;
  }

  attachGun(gunSpecs) {
    this.gunSpecs = gunSpecs;
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
    this.gunReloadTimer--;
    // calculate x,y components of speed, thrust and drag
    /*let currentSpeedX = this.shipSpeed * Math.sin(this.directionOfTravel);
    let currentSpeedY = this.shipSpeed * Math.cos(this.directionOfTravel);
    let dragX = this.drag * Math.sin(this.directionOfTravel);
    let dragY = this.drag * Math.cos(this.directionOfTravel);
*/
    const driftSpeed =
      this.shipSpeed > this.drag ? this.shipSpeed - this.drag : 0;
    const driftX = driftSpeed * Math.sin(this.directionOfTravel);
    const driftY = driftSpeed * Math.cos(this.directionOfTravel);

    let thrustX = 0;
    let thrustY = 0;
    // TODO: use degrees and convert to radians
    if (this.shipThrust) {
      thrustX = this.thrust * Math.sin(this.shipRotation);
      thrustY = this.thrust * Math.cos(this.shipRotation);
    }

    let dx = driftX + thrustX;
    let dy = driftY + thrustY;

    // shipSpeed
    this.shipSpeed = Math.sqrt(dx * dx + dy * dy);
    if (dy == 0) {
      this.directionOfTravel = Math.atan(dx / 0.01);
    } else {
      this.directionOfTravel = Math.atan(dx / dy); // directionOfTravel in radians
    }

    if (dy < 0) {
      // Add PI radians or 180 degrees
      this.directionOfTravel = this.directionOfTravel + 3.1415;
    }

    if (this.shipSpeed > this.maxSpeed) {
      this.shipSpeed = this.maxSpeed;
      dx = this.shipSpeed * Math.sin(this.directionOfTravel);
      dy = this.shipSpeed * Math.cos(this.directionOfTravel);
    }

    this.x += dx; //(shipSpeed*sin(shipRotation))
    this.y -= dy; //(shipSpeed*cos(shipRotation))
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

  // TODO: keep this as degrees 0-360
  changeShipRotation(dRot) {
    this.shipRotation += dRot;
    if (this.shipRotation < 0) {
      this.shipRotation += FULLRADIAN;
    } else if (this.shipRotation > FULLRADIAN) {
      this.shipRotation -= FULLRADIAN;
    }
  }

  setShipThrust(bool) {
    shipThrust = bool;
  }

  /* GUN functions */
  // gun position should be added to ship. If a ship gets upgraded then it could have multiple guns and we can just pass in the gun position that we want to fire from when we create the bullet. That way the bullet class doesn't have to know anything about the ship at all and is more reusable.
  getGunPosition() {
    const gunlength = this.gunSpecs.barrelLocation.y;
    // TODO: use degrees and convert to radians
    const x = this.x + gunlength * Math.sin(this.shipRotation);
    const y = this.y - gunlength * Math.cos(this.shipRotation);
    return { x, y };
  }
  getBulletVelocity() {
    // bullet velocity is bullet speed in the direction of shipRotation plus velocity of ship
    // bullet speed should be related to gun power so that if we add power ups to the game then we can just increase the gun power and the bullet speed will increase accordingly. That way we don't have to change any of the bullet code when we add power ups to the game. We can also add different types of bullets with different speeds and just pass in the bullet type when we create the bullet and then calculate the bullet speed based on the bullet type. That way we can easily add new types of bullets to the game without having to change any of the existing code.
    // shipSpeed
    // TODO: use degrees and convert to radians
    const dx = this.dx + this.gunSpecs.speed * Math.sin(this.shipRotation);
    const dy = this.dy + this.gunSpecs.speed * Math.cos(this.shipRotation);
    return {
      dx,
      dy,
      initialSpeed: this.gunSpecs.speed,
      initialDirection: this.shipRotation,
    };
  }

  reloadGun() {
    this.gunReloadTimer = this.gunSpecs.reloadTime;
  }

  isGunLoaded() {
    return this.gunReloadTimer <= 0;
  }
  /* end of GUN functions */

  // TODO: use gegrees
  render() {
    renderShip(this.id, this.x, this.y, this.shipRotation, this.shipThrust);
  }
}
