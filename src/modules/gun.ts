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
  private getGunPosition(): Position {
    const gunlength = this.barrelOffset.y;
    const x = this.position.x + gunlength * Math.sin(this.rotation);
    const y = this.position.y - gunlength * Math.cos(this.rotation);
    return { x, y };
  }

  // bullet velocity is related to gun's motion state plus rotarion and power of gun
  private getBulletVelocity() {
    const velocityX = this.velocity.speed * Math.sin(this.velocity.direction);
    const velocityY = this.velocity.speed * Math.cos(this.velocity.direction);
    const dx = velocityX + this.power * Math.sin(this.rotation);
    const dy = velocityY + this.power * Math.cos(this.rotation);
    return {
      dx,
      dy,
    };
  }

  public getNewBullet(): {
    bulletPosition: Position;
    bulletVelocity: { dx: number; dy: number };
  } {
    const bulletPosition: Position = this.getGunPosition();
    const bulletVelocity = this.getBulletVelocity();
    this.reloadGun();
    return { bulletPosition, bulletVelocity };
  }

  reloadGun() {
    this.gunReloadTimer = this.reloadTime;
    this.state = "reloading";
  }
}
