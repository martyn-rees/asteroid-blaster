import Gun, { MotionState } from "./gun";

const FULLDEGREE = 360;
type Directions = { degrees: number; radians: number };

type ShipSpecs = {
  speedMax: number;
  drag: number;
  thrustMax: number;
  radius: number;
  rotationSpeed: number;
};

export default class Ship {
  public id: string;
  public position: { x: number; y: number };
  private speedMax: number;
  private drag: number;
  private thrustMax: number;
  public r: number;
  private rotationSpeed: number;
  public rotation: Directions;
  public thrustPower: number;
  public direction: Directions;
  public shipSpeed: number;
  public gun: Gun | null;
  public isTriggerPressed: boolean;

  constructor(pos: { x: number; y: number }, id: string, shipSpecs: ShipSpecs) {
    this.id = id;
    // position
    this.position = pos;
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
    this.isTriggerPressed = false;
  }

  attachGun(gun: Gun) {
    this.gun = gun;
  }

  getShipMotionState(): MotionState {
    return {
      position: this.position,
      velocity: {
        speed: this.shipSpeed,
        direction: this.direction.radians,
      },
      rotation: this.rotation.radians,
    };
  }

  boundary(): { x: number; y: number; r: number } {
    return {
      x: this.position.x,
      y: this.position.y,
      r: this.r,
    };
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

  updateActions({
    thrust,
    rotateCounterClockwise,
    rotateClockwise,
    shoot,
  }: {
    thrust: boolean;
    rotateCounterClockwise: boolean;
    rotateClockwise: boolean;
    shoot: boolean;
  }) {
    this.thrustPower = thrust ? this.thrustMax : 0;
    if (rotateCounterClockwise) {
      this.changeShipRotation(-this.rotationSpeed);
    }
    if (rotateClockwise) {
      this.changeShipRotation(this.rotationSpeed);
    }
    this.isTriggerPressed = shoot;
  }

  update(transformXCallback?: Function, transformYCallback?: Function) {
    // update Motion State
    this.calculateNewVelocity();
    const newX =
      this.position.x + this.shipSpeed * Math.sin(this.direction.radians);
    const newY =
      this.position.y - this.shipSpeed * Math.cos(this.direction.radians);
    // use transforms to update position of rock on game screen
    this.position.x = transformXCallback ? transformXCallback(newX) : newX;
    this.position.y = transformYCallback ? transformYCallback(newY) : newY;

    // update gun state
    if (this.gun !== null) {
      this.gun.updateMotionState({
        position: this.position,
        velocity: { speed: this.shipSpeed, direction: this.direction.radians },
        rotation: this.rotation.radians,
      });
      this.gun.update(this.isTriggerPressed);
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
    renderCallback(
      this.id,
      this.position.x,
      this.position.y,
      this.rotation.degrees,
    );
    renderThrustCallback(this.thrustPower);
  }
}
