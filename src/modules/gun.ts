// gun specs of gun that can be attached to ship
// TODO: set position, velocity and rotation of gun nozzzle

// TODO: Position and Velocity types should be shared across modules
type Position = {
  x: number;
  y: number;
};

type Velocity = {
  speed: number;
  direction: number;
};

export type MotionState = {
  position: Position;
  velocity: Velocity;
  rotation: number;
};

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
  private power: number;
  private reloadTime: number;
  private position: Position;
  private velocity: Velocity;
  private rotation: number;

  constructor({
    barrelOffset,
    power,
    reloadTime,
  }: {
    barrelOffset: Position;
    power: number;
    reloadTime: number;
  }) {
    this.barrelOffset = barrelOffset;
    this.power = power;
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
  private getGunPosition({
    position,
    rotation,
  }: {
    position: Position;
    rotation: number;
  }): Position {
    const gunlength = this.barrelOffset.y;
    const x = position.x + gunlength * Math.sin(rotation);
    const y = position.y - gunlength * Math.cos(rotation);
    return { x, y };
  }
  // gun is attached to ship so its velocity is the same as ship velocity
  // bullet velocity is related to gun speed (power) and direction that gun is pointing and relative to ships velocity
  private getBulletVelocity(shipVelocity: Velocity, shipRotation: number) {
    const shipVelocityX = shipVelocity.speed * Math.sin(shipVelocity.direction);
    const shipVelocityY = shipVelocity.speed * Math.cos(shipVelocity.direction);
    const dx = shipVelocityX + this.power * Math.sin(shipRotation);
    const dy = shipVelocityY + this.power * Math.cos(shipRotation);
    return {
      dx,
      dy,
    };
  }

  public getNewBullet({ position, velocity, rotation }: MotionState): {
    bulletPosition: Position;
    bulletVelocity: { dx: number; dy: number };
  } {
    const bulletPosition: Position = this.getGunPosition({
      position,
      rotation,
    });
    const bulletVelocity = this.getBulletVelocity(velocity, rotation);
    this.reloadGun();
    return { bulletPosition, bulletVelocity };
  }

  reloadGun() {
    this.gunReloadTimer = this.reloadTime;
    this.state = "reloading";
  }
}
