// reverse y-axis (scren coords) compared to y axis (maths coords)
// sin(angle) and tan(angle) reverse sign
// cos(angle) remains unchanged
// angles increase clockwise (reverse y-axis), increase counter-clockwise (positive y-axis)

// gun specs of gun that can be attached to ship

import { getComponentVelocity, getDirectionRadians } from "../maths";
import { Position, Velocity } from "./types";

export type GunState =
  | "nogun"
  | "loaded"
  | "firing"
  | "reloading"
  | "malfunction";

export default class Gun {
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

  get motionStateGun(): {
    position: Position;
    velocity: Velocity;
    rotation: number;
  } {
    return {
      position: this.position,
      velocity: this.velocity,
      rotation: this.rotation,
    };
  }

  // updates gun state not position.
  update(shoot: boolean) {
    if (shoot && this.state === "loaded") {
      this.state = "firing";
    }

    if (this.state == "reloading") {
      this.gunReloadTimer--;
      if (this.gunReloadTimer <= 0) {
        this.state = "loaded";
      }
    }
  }

  // TODO: calculate gun position when off the x axis
  private getMuzzlePosition(): Position {
    const gunlength = this.muzzleOffset.y;
    const x = parseFloat(
      (this.position.x + gunlength * Math.cos(this.rotation)).toFixed(1),
    );
    const y = parseFloat(
      (this.position.y + gunlength * Math.sin(this.rotation)).toFixed(1),
    );
    return { x, y };
  }

  public getInitialMotionStateOfBullet(): {
    bulletPosition: Position;
    bulletVelocity: Velocity;
  } {
    const bulletPosition: Position = this.getMuzzlePosition();
    const v1 = {
      speed: this.velocity.speed,
      direction: this.velocity.direction,
    };
    const v2 = { speed: this.muzzleSpeed, direction: this.rotation };
    const bulletDxDy = getComponentVelocity(v1, v2);
    // create velocity of bullet fired from moving gun
    const newSpeed = Math.sqrt(bulletDxDy.dx ** 2 + bulletDxDy.dy ** 2);
    // TODO: write test to check if this is correct
    //const newDirection = Math.atan2(bulletDxDy.dy, bulletDxDy.dx);
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
