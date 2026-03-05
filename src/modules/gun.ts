// gun specs of gun that can be attached to ship
// TODO: set location, velocity and rotation of gun nozzzle

// TODO: Location and Velocity types should be shared across modules
type Location = {
  x: number;
  y: number;
};

type Velocity = {
  speed: number;
  direction: number;
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
  private barrelOffset: Location;
  private power: number;
  private reloadTime: number;
  private location: Location;
  private velocity: Velocity;
  private rotation: number;

  constructor({
    barrelOffset,
    power,
    reloadTime,
  }: {
    barrelOffset: Location;
    power: number;
    reloadTime: number;
  }) {
    this.barrelOffset = barrelOffset;
    this.power = power;
    this.reloadTime = reloadTime;
    this.gunReloadTimer = 0;
    this.state = "loaded";
    this.location = { x: 0, y: 0 };
    this.velocity = { speed: 0, direction: 0 };
    this.rotation = 0;
  }

  update() {
    if (this.state == "reloading") {
      this.gunReloadTimer--;
      if (this.gunReloadTimer <= 0) {
        this.state = "loaded";
      }
    }
  }

  // TODO: calculate gun position when off the x axis
  private getGunPosition({
    location,
    rotation,
  }: {
    location: Location;
    rotation: number;
  }): Location {
    const gunlength = this.barrelOffset.y;
    const x = location.x + gunlength * Math.sin(rotation);
    const y = location.y - gunlength * Math.cos(rotation);
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

  public getNewBullet({
    location,
    velocity,
    rotation,
  }: {
    location: Location;
    velocity: Velocity;
    rotation: number;
  }): { bulletPosition: Location; bulletVelocity: { dx: number; dy: number } } {
    const bulletPosition: Location = this.getGunPosition({
      location,
      rotation,
    });
    const bulletVelocity = this.getBulletVelocity(velocity, rotation);
    this.reloadGun();
    return { bulletPosition, bulletVelocity };
  }

  gunFired() {
    this.state = "firing";
  }

  reloadGun() {
    this.gunReloadTimer = this.reloadTime;
    this.state = "reloading";
  }

  isGunLoaded(): Boolean {
    return this.state === "loaded";
  }
}
