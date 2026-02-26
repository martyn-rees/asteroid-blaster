const FULLDEGREE = 360;
type Directions = { degrees: number; radians: number };
type ShipSpecs = {
  speedMax: number;
  drag: number;
  thrustMax: number;
  radius: number;
  rotationSpeed: number;
};
type GunType = {
  getGunPosition: Function;
  getBulletVelocity: Function;
  update: Function;
};

export default class Ship {
  public id: string;
  public x: number;
  public y: number;
  private speedMax: number;
  private drag: number;
  private thrustMax: number;
  public r: number;
  private rotationSpeed: number;
  public rotation: Directions;
  public thrustPower: number;
  public direction: Directions;
  public shipSpeed: number;
  public gun: GunType | null;

  constructor(pos: { x: number; y: number }, id: string, shipSpecs: ShipSpecs) {
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
    this.gun = null;
  }

  attachGun(gun: GunType) {
    this.gun = gun;
  }

  // calculate iniital position and velocity of bullet when ship's gun is fired
  gunFired() {
    const shipLocation = { x: this.x, y: this.y };
    const shipRotation = this.rotation.radians;
    const shipVelocity = {
      speed: this.shipSpeed,
      direction: this.direction.radians,
    };

    const bulletPosition = this.gun!.getGunPosition(shipLocation, shipRotation);
    const bulletVelocity = this.gun!.getBulletVelocity(
      shipVelocity,
      shipRotation,
    );
    return { bulletPosition, bulletVelocity };
  }

  //TODO: ACTIONS should be moved in to update(ACTIONS)
  updateShipActions(
    thrust: boolean,
    rotateCounterClockwise: boolean,
    rotateClockwise: boolean,
  ) {
    this.thrustPower = thrust ? this.thrustMax : 0;
    if (rotateCounterClockwise) {
      this.changeShipRotation(-this.rotationSpeed);
    }
    if (rotateClockwise) {
      this.changeShipRotation(this.rotationSpeed);
    }
  }

  convertDegreestoRadians(degrees: number) {
    return 0.0174533 * degrees;
  }
  convertRadiansToDegrees(radians: number) {
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
    if (this.shipSpeed > this.speedMax) {
      this.shipSpeed = this.speedMax;
    }

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
  }

  // TODO: consider moving screen dimensions out of here
  // instead create a function to get and set ship location
  // in index.js get ship location and if needed reset location if off screen
  // this ship shouldn't care about screen dimensions to give it the option of adding a scrolling screen
  update(SCREEN_WIDTH: number, SCREEN_HEIGHT: number) {
    if (this.gun !== null) {
      this.gun.update();
    }

    this.calculateNewVelocity();
    this.x += this.shipSpeed * Math.sin(this.direction.radians);
    this.y -= this.shipSpeed * Math.cos(this.direction.radians);

    //amend x,y values to keep ship on screen
    // this moves to screen edge but should move the amount it's past the screen boundary e.g. this.x -= SCREEN_WIDTH
    if (this.x < 0) {
      this.x += SCREEN_WIDTH;
    } else if (this.x > SCREEN_WIDTH) {
      this.x -= SCREEN_WIDTH;
    }

    if (this.y < 0) {
      this.y += SCREEN_HEIGHT;
    } else if (this.y > SCREEN_HEIGHT) {
      this.y -= SCREEN_HEIGHT;
    }
  }

  changeShipRotation(dRot: number) {
    this.rotation.degrees += dRot;
    if (this.rotation.degrees < 0) {
      this.rotation.degrees += FULLDEGREE;
    } else if (this.rotation.degrees >= FULLDEGREE) {
      this.rotation.degrees -= FULLDEGREE;
    }
    this.rotation.radians = this.convertDegreestoRadians(this.rotation.degrees);
  }

  render(renderCallback: Function, renderThrustCallback: Function) {
    renderCallback(this.id, this.x, this.y, this.rotation.degrees);
    renderThrustCallback(this.thrustPower);
  }
}
