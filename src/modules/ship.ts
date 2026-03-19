import Gun from "./gun";
import {
  calculateNewVelocity,
  convertRadiansToDegrees,
  changeRotation,
} from "../maths";
import { Position, Velocity, Directions, MotionState, Circle } from "./types";

type ShipSpecs = {
  speedMax: number;
  drag: number;
  thrustMax: number;
  radius: number;
  rotationSpeed: number;
};

export default class Ship {
  public id: string;
  public position: Position;
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

  constructor(pos: Position, id: string, shipSpecs: ShipSpecs) {
    this.id = id;
    // position
    this.position = pos;
    // ship specifications - this can be passed in for different ships
    this.speedMax = shipSpecs.speedMax;
    this.drag = shipSpecs.drag;
    this.thrustMax = shipSpecs.thrustMax;
    this.r = shipSpecs.radius;
    this.rotationSpeed = shipSpecs.rotationSpeed;
    // ship state // point North
    this.rotation = { degrees: 270, radians: 1.5 * Math.PI };
    this.thrustPower = 0;
    // velocity // point North
    this.direction = { degrees: 270, radians: 1.5 * Math.PI };
    this.shipSpeed = 0;
    // gun specifications - this can be passed in for different gunpower and position. Need to use array if more than one gun
    this.gun = null;
    this.isTriggerPressed = false;
  }

  attachGun(gun: Gun) {
    this.gun = gun;
  }

  get motionState(): MotionState {
    return {
      position: this.position,
      velocity: {
        speed: this.shipSpeed,
        direction: this.direction.radians,
      },
      rotation: this.rotation.radians,
    };
  }

  boundary(): Circle {
    return {
      x: this.position.x,
      y: this.position.y,
      r: this.r,
    };
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
      this.rotation = changeRotation(
        -this.rotationSpeed,
        this.rotation.degrees,
      );
    }
    if (rotateClockwise) {
      this.rotation = changeRotation(this.rotationSpeed, this.rotation.degrees);
    }
    this.isTriggerPressed = shoot;
  }

  update(transformXCallback?: Function, transformYCallback?: Function) {
    const maxSpeed = this.speedMax;
    let driftSpeed: number = this.shipSpeed - this.drag;
    if (driftSpeed < 0) driftSpeed = 0;
    const driftDirection = this.direction.radians;
    const thrustDirection = this.rotation.radians;

    // update Motion State
    const newVelocity: Velocity = calculateNewVelocity(
      { speed: driftSpeed, direction: driftDirection },
      { speed: this.thrustPower, direction: thrustDirection },
      maxSpeed,
    );

    const radians = newVelocity.direction;
    const degrees = convertRadiansToDegrees(radians);
    const newX = this.position.x + newVelocity.speed * Math.cos(radians);
    const newY = this.position.y + newVelocity.speed * Math.sin(radians);
    // use transforms to update position of rock on game screen
    // update x,y,shipSpeed and direction
    this.position.x = transformXCallback ? transformXCallback(newX) : newX;
    this.position.y = transformYCallback ? transformYCallback(newY) : newY;
    this.shipSpeed = newVelocity.speed;
    this.direction = { degrees, radians };

    // update gun state
    if (this.gun !== null) {
      this.gun.motionState = {
        position: this.position,
        velocity: { speed: this.shipSpeed, direction: this.direction.radians },
        rotation: this.rotation.radians,
      };
      this.gun.update(this.isTriggerPressed);
    }
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
