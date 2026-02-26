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

export default class Gun {
  private gunSpecs: GunSpec;
  private gunReloadTimer: number;

  constructor(gunSpecs: GunSpec) {
    this.gunSpecs = gunSpecs;
    this.gunReloadTimer = 0;
  }

  update() {
    this.gunReloadTimer--;
  }

  // TODO: calculate gun position when off the x axis
  getGunPosition(shipLocation: Location, shipRotation: number): Location {
    const gunlength = this.gunSpecs.barrelLocation.y;
    const x = shipLocation.x + gunlength * Math.sin(shipRotation);
    const y = shipLocation.y - gunlength * Math.cos(shipRotation);
    return { x, y };
  }
  // gun is attached to ship so its velocity is the same as ship velocity
  // bullet velocity is related to gun speed (power) and direction that gun is pointing and relative to ships velocity
  getBulletVelocity(shipVelocity: Velocity, shipRotation: number) {
    const shipVelocityX = shipVelocity.speed * Math.sin(shipVelocity.direction);
    const shipVelocityY = shipVelocity.speed * Math.cos(shipVelocity.direction);
    const dx = shipVelocityX + this.gunSpecs.speed * Math.sin(shipRotation);
    const dy = shipVelocityY + this.gunSpecs.speed * Math.cos(shipRotation);
    return {
      dx,
      dy,
    };
  }

  reloadGun() {
    this.gunReloadTimer = this.gunSpecs.reloadTime;
  }

  isGunLoaded(): Boolean {
    return this.gunReloadTimer <= 0;
  }
}
