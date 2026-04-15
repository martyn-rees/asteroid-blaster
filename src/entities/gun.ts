// using left-handed cartesian coords, y-axis is inverted to match canvas coords, rotation 0 points to the right (East) and increases clockwise

import {
  getComponentVelocity,
  getDirectionRadians,
  getNewPositionWithOffset,
} from "../utils/physics.ts";
import { Position, Velocity } from "../types.ts";

export type GunState =
  | "nogun"
  | "loaded"
  | "firing"
  | "reloading"
  | "malfunction";

export default class Gun {
  static gunIDCounter = 0;
  public id: string;
  private gunReloadTimer: number;
  public state: GunState;
  private muzzleOffset: Position;
  private muzzleSpeed: number;
  private reloadTime: number;
  private position: Position;
  private velocity: Velocity;
  private rotation: number;

  constructor({
    muzzleOffset,
    muzzleSpeed,
    reloadTime,
  }: {
    muzzleOffset: Position;
    muzzleSpeed: number;
    reloadTime: number;
  }) {
    this.id = "gun" + Gun.gunIDCounter++;
    this.muzzleOffset = muzzleOffset;
    this.muzzleSpeed = muzzleSpeed;
    this.reloadTime = reloadTime;
    this.gunReloadTimer = 0;
    this.state = "loaded";
    this.position = { x: 0, y: 0 };
    this.velocity = { speed: 0, direction: 0 };
    this.rotation = 0;
  }

  private updateGunLocation(position: Position) {
    this.position = position;
  }

  private updateGunVelocity(velocity: Velocity) {
    this.velocity = velocity;
  }

  private updateGunRotation(rotation: number) {
    this.rotation = rotation;
  }

  set motionState({
    position,
    velocity,
    rotation,
  }: {
    position?: Position;
    velocity?: Velocity;
    rotation?: number;
  }) {
    position && this.updateGunLocation(position);
    velocity && this.updateGunVelocity(velocity);
    rotation && this.updateGunRotation(rotation);
  }

  // updates gun state not position.
  update(shoot: boolean, dt: number = 1) {
    if (shoot && this.state === "loaded") {
      this.state = "firing";
    }

    if (this.state === "reloading") {
      this.gunReloadTimer -= dt;
      if (this.gunReloadTimer <= 0) {
        this.state = "loaded";
      }
    }
  }

  get muzzlePosition(): Position {
    const muzzlePosition: Position = getNewPositionWithOffset(
      this.position,
      this.rotation,
      this.muzzleOffset,
    );
    return muzzlePosition;
  }

  public getInitialMotionStateOfBullet(): {
    bulletPosition: Position;
    bulletVelocity: Velocity;
  } {
    const bulletPosition: Position = this.muzzlePosition;
    const v1 = {
      speed: this.velocity.speed,
      direction: this.velocity.direction,
    };
    const v2 = { speed: this.muzzleSpeed, direction: this.rotation };
    const bulletDxDy = getComponentVelocity(v1, v2);
    // create velocity of bullet fired from moving gun
    const newSpeed = Math.sqrt(bulletDxDy.dx ** 2 + bulletDxDy.dy ** 2);
    const newDirection = getDirectionRadians(bulletDxDy.dx, bulletDxDy.dy);
    const bulletVelocity = { speed: newSpeed, direction: newDirection };

    this.reloadGun();
    return { bulletPosition, bulletVelocity };
  }

  reloadGun() {
    this.gunReloadTimer = this.reloadTime;
    this.state = "reloading";
  }
}
