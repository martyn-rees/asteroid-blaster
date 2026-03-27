import Gun from "./gun";
import {
  calculateNewVelocity,
  changeRotation,
  getNewPosition,
  convertDegreestoRadians,
  convertRadiansToDegrees,
} from "../utils/maths";
import { transform } from "../utils/helper";
import { Position, Velocity, MotionState, Circle } from "./types";

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
  public rotation: number;
  public thrustPower: number;
  public velocity: Velocity;
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
    this.rotationSpeed = convertDegreestoRadians(shipSpecs.rotationSpeed);
    // ship state // point North
    this.rotation = 1.5 * Math.PI;
    this.thrustPower = 0;
    // velocity // point North
    this.velocity = { speed: 0, direction: 1.5 * Math.PI };
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
      velocity: this.velocity,
      rotation: this.rotation,
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
      this.rotation = changeRotation(-this.rotationSpeed, this.rotation);
    }
    if (rotateClockwise) {
      this.rotation = changeRotation(this.rotationSpeed, this.rotation);
    }
    this.isTriggerPressed = shoot;
  }

  update(transformXCallback?: Function, transformYCallback?: Function) {
    const maxSpeed = this.speedMax;
    let driftSpeed: number = this.velocity.speed - this.drag;
    if (driftSpeed < 0) driftSpeed = 0;
    const driftDirection = this.velocity.direction;
    const thrustDirection = this.rotation;

    // update Motion State
    const newVelocity: Velocity = calculateNewVelocity(
      { speed: driftSpeed, direction: driftDirection },
      { speed: this.thrustPower, direction: thrustDirection },
      maxSpeed,
    );
    const newPosition = getNewPosition(this.position, newVelocity);
    // use transforms to update position of rock on game screen
    // update x,y,velocity and direction of rotation
    this.position = transform(
      newPosition,
      transformXCallback,
      transformYCallback,
    );
    this.velocity = newVelocity;

    // update gun state
    if (this.gun !== null) {
      this.gun.motionState = {
        position: this.position,
        velocity: this.velocity,
        rotation: this.rotation,
      };
      this.gun.update(this.isTriggerPressed);
    }
  }
}
