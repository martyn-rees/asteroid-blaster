import Gun from "./gun.ts";
import { BoundaryTransform } from "../types.ts";
import {
  calculateNewVelocity,
  changeRotation,
  getNewPosition,
  convertDegreestoRadians,
} from "../utils/maths-motionstate.ts";
import { transform } from "../utils/maths.ts";
import { Position, Velocity, MotionState, Circle } from "../types.ts";

export type ShipState = "active" | "exploding" | "destroyed";

const EXPLOSION_DURATION = 90; // frames (~1.5s at 60fps)

type ShipSpecs = {
  speedMax: number;
  drag: number;
  thrustMax: number;
  radius: number;
  rotationSpeed: number;
};

export default class Ship {
  public id: string;
  public state: ShipState;
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
  private explosionTimer: number;
  private rotateDirection: -1 | 0 | 1;

  constructor(pos: Position, id: string, shipSpecs: ShipSpecs) {
    this.id = id;
    this.state = "active";
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
    this.explosionTimer = 0;
    this.rotateDirection = 0;
  }

  explode() {
    this.state = "exploding";
    this.explosionTimer = EXPLOSION_DURATION;
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

  setInput({
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
    this.rotateDirection = rotateCounterClockwise
      ? -1
      : rotateClockwise
        ? 1
        : 0;
    this.isTriggerPressed = shoot;
  }

  update(
    transformXCallback?: BoundaryTransform,
    transformYCallback?: BoundaryTransform,
    dt: number = 1,
  ) {
    if (this.state === "exploding") {
      this.explosionTimer -= dt;
      if (this.explosionTimer <= 0) this.state = "destroyed";
      return;
    }
    if (this.state === "destroyed") return;

    if (this.rotateDirection !== 0) {
      this.rotation = changeRotation(
        this.rotateDirection * this.rotationSpeed * dt,
        this.rotation,
      );
    }

    const maxSpeed = this.speedMax;
    let driftSpeed: number = this.velocity.speed - this.drag * dt;
    if (driftSpeed < 0) driftSpeed = 0;
    const driftDirection = this.velocity.direction;
    const thrustDirection = this.rotation;

    // update Motion State
    const newVelocity: Velocity = calculateNewVelocity(
      { speed: driftSpeed, direction: driftDirection },
      { speed: this.thrustPower * dt, direction: thrustDirection },
      maxSpeed,
    );
    const newPosition = getNewPosition(this.position, newVelocity, dt);
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
      this.gun.update(this.isTriggerPressed, dt);
    }
  }
}
