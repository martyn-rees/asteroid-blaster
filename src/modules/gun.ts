// reverse y-axis (scren coords) compared to y axis (maths coords)
// sin(angle) and tan(angle) reverse sign
// cos(angle) remains unchanged
// angles increase clockwise (reverse y-axis), increase counter-clockwise (positive y-axis)

// gun specs of gun that can be attached to ship

import { getDirectionRadians } from "../maths";
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
  private barrelOffset: Position;
  private muzzleSpeed: number;
  private reloadTime: number;
  private position: Position;
  private velocity: Velocity;
  private rotation: number;

  constructor({
    barrelOffset,
    muzzleSpeed,
    reloadTime,
  }: {
    barrelOffset: Position;
    muzzleSpeed: number;
    reloadTime: number;
  }) {
    this.barrelOffset = barrelOffset;
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

  updateMotionState({
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
    const gunlength = this.barrelOffset.y;
    const x = parseFloat(
      (this.position.x + gunlength * Math.cos(this.rotation)).toFixed(1),
    );
    const y = parseFloat(
      (this.position.y + gunlength * Math.sin(this.rotation)).toFixed(1),
    );
    return { x, y };
  }

  // --- methods related to bullet motionstate when gun is fired
  // TODO: this should be replaced with returning real speed and velocity
  // bullet velocity is related to gun's motion state plus rotation and power of gun
  private getBulletDxDy(): { dx: number; dy: number } {
    // Convert speed and direction to velocity components (vx, vy)
    const gunVx = this.velocity.speed * Math.cos(this.velocity.direction);
    const gunVy = this.velocity.speed * Math.sin(this.velocity.direction);
    const bulletVx = this.muzzleSpeed * Math.cos(this.rotation);
    const bulletVy = this.muzzleSpeed * Math.sin(this.rotation);
    // Create component velocity of bullet
    let dx: number = parseFloat((gunVx + bulletVx).toFixed(1));
    let dy: number = parseFloat((gunVy + bulletVy).toFixed(1));
    if (dx == -0) {
      dx = 0;
    }

    return {
      dx,
      dy,
    };
  }

  public getInitialMotionStateOfBullet(): {
    bulletPosition: Position;
    bulletDxDy: { dx: number; dy: number };
    bulletVelocity: Velocity;
  } {
    const bulletPosition: Position = this.getMuzzlePosition();
    const bulletDxDy = this.getBulletDxDy();
    // create velocity of bullet fired from moving gun
    const newSpeed = Math.sqrt(bulletDxDy.dx ** 2 + bulletDxDy.dy ** 2);
    // TODO: write test to check if this is correct
    //const newDirection = Math.atan2(bulletDxDy.dy, bulletDxDy.dx);
    const newDirection = getDirectionRadians(bulletDxDy.dx, bulletDxDy.dy);
    const bulletVelocity = { speed: newSpeed, direction: newDirection };

    this.reloadGun();
    // TODO: could remove dxdy if motionState works
    return { bulletPosition, bulletDxDy, bulletVelocity };
  }

  reloadGun() {
    this.gunReloadTimer = this.reloadTime;
    this.state = "reloading";
  }
}
