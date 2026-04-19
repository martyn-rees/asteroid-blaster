import Gun from "./gun.ts";
import {
  calculateNewVelocity,
  changeRotation,
  getNewPosition,
} from "../utils/physics.ts";
import { transform, convertDegreesToRadians } from "../utils/maths.ts";
import {
  Position,
  UpdateOptions,
  Velocity,
  MotionState,
  Circle,
  GameEntity,
} from "../types.ts";

export type ShipState = "active" | "exploding" | "destroyed";

const EXPLOSION_DURATION = 90; // frames (~1.5s at 60fps)

type ShipSpecs = {
  speedMax: number;
  drag: number;
  thrustMax: number;
  radius: number;
  rotationSpeed: number;
};

export default class Ship implements GameEntity {
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
  public guns: Gun[];
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
    this.rotationSpeed = convertDegreesToRadians(shipSpecs.rotationSpeed);
    // ship state // point North
    this.rotation = 1.5 * Math.PI;
    this.thrustPower = 0;
    // velocity // point North
    this.velocity = { speed: 0, direction: 1.5 * Math.PI };
    this.guns = [];
    this.isTriggerPressed = false;
    this.explosionTimer = 0;
    this.rotateDirection = 0;
  }

  explode() {
    this.state = "exploding";
    this.explosionTimer = EXPLOSION_DURATION;
  }

  attachGuns(guns: Gun[]) {
    this.guns = guns;
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

  update({ onExitBounds, deltaTime = 1 }: UpdateOptions = {}) {
    if (this.state === "exploding") {
      this.explosionTimer -= deltaTime;
      if (this.explosionTimer <= 0) this.state = "destroyed";
      return;
    }
    if (this.state === "destroyed") return;

    if (this.rotateDirection !== 0) {
      this.rotation = changeRotation(
        this.rotateDirection * this.rotationSpeed * deltaTime,
        this.rotation,
      );
    }

    const maxSpeed = this.speedMax;
    let driftSpeed: number = this.velocity.speed - this.drag * deltaTime;
    if (driftSpeed < 0) driftSpeed = 0;
    const driftDirection = this.velocity.direction;
    const thrustDirection = this.rotation;

    const newVelocity: Velocity = calculateNewVelocity(
      { speed: driftSpeed, direction: driftDirection },
      { speed: this.thrustPower * deltaTime, direction: thrustDirection },
      maxSpeed,
    );
    const newPosition = getNewPosition(this.position, newVelocity, deltaTime);
    this.position = transform(newPosition, onExitBounds);
    this.velocity = newVelocity;

    for (const gun of this.guns) {
      gun.motionState = {
        position: this.position,
        velocity: this.velocity,
        rotation: this.rotation,
      };
      gun.update(this.isTriggerPressed, deltaTime);
    }
  }
}
