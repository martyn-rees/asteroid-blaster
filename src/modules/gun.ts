// gun specs of gun that can be attached to ship
type Location = {
  x: number;
  y: number;
};

type Velocity = {
  speed: number;
  direction: number;
};

type GunSpec = {
  barrelLocation: Location;
  speed: number;
  reloadTime: number;
};

export type GunState =
  | "nogun"
  | "loaded"
  | "firing"
  | "reloading"
  | "malfunction";

export default class Gun {
  private gunSpecs: GunSpec;
  private gunReloadTimer: number;
  public state: GunState;

  constructor(gunSpecs: GunSpec) {
    this.gunSpecs = gunSpecs;
    this.gunReloadTimer = 0;
    this.state = "loaded";
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
  private getGunPosition(
    shipLocation: Location,
    shipRotation: number,
  ): Location {
    const gunlength = this.gunSpecs.barrelLocation.y;
    const x = shipLocation.x + gunlength * Math.sin(shipRotation);
    const y = shipLocation.y - gunlength * Math.cos(shipRotation);
    return { x, y };
  }
  // gun is attached to ship so its velocity is the same as ship velocity
  // bullet velocity is related to gun speed (power) and direction that gun is pointing and relative to ships velocity
  private getBulletVelocity(shipVelocity: Velocity, shipRotation: number) {
    const shipVelocityX = shipVelocity.speed * Math.sin(shipVelocity.direction);
    const shipVelocityY = shipVelocity.speed * Math.cos(shipVelocity.direction);
    const dx = shipVelocityX + this.gunSpecs.speed * Math.sin(shipRotation);
    const dy = shipVelocityY + this.gunSpecs.speed * Math.cos(shipRotation);
    return {
      dx,
      dy,
    };
  }

  public getNewBullet(
    shipLocation: Location,
    shipVelocity: Velocity,
    shipRotation: number,
  ): { bulletPosition: Location; bulletVelocity: { dx: number; dy: number } } {
    const bulletPosition: Location = this.getGunPosition(
      shipLocation,
      shipRotation,
    );
    const bulletVelocity = this.getBulletVelocity(shipVelocity, shipRotation);
    this.reloadGun();
    return { bulletPosition, bulletVelocity };
  }

  gunFired() {
    this.state = "firing";
  }

  reloadGun() {
    this.gunReloadTimer = this.gunSpecs.reloadTime;
    this.state = "reloading";
  }

  isGunLoaded(): Boolean {
    return this.state === "loaded";
  }
}
