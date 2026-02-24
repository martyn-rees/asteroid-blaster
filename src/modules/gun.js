// gun specs of gun that can be attached to ship
export default class Gun {
  constructor(gunSpecs) {
    this.gunSpecs = gunSpecs;
    this.gunReloadTimer = 0;
  }

  update() {
    this.gunReloadTimer--;
  }

  // TODO: calculate gun position when off the x axis
  getGunPosition(shipLocation, shipRotation) {
    const gunlength = this.gunSpecs.barrelLocation.y;
    const x = shipLocation.x + gunlength * Math.sin(shipRotation);
    const y = shipLocation.y - gunlength * Math.cos(shipRotation);
    return { x, y };
  }
  // gun is attached to ship so its velocity is the same as ship velocity
  // bullet velocity is related to gun speed (power) and direction that gun is pointing and relative to ships velocity
  getBulletVelocity(shipVelocity, shipRotation) {
    const shipVelocityX = shipVelocity.speed * Math.sin(shipVelocity.direction);
    const shipVelocityY = shipVelocity.speed * Math.cos(shipVelocity.direction);
    const dx = shipVelocityX + this.gunSpecs.speed * Math.sin(shipRotation);
    const dy = shipVelocityY + this.gunSpecs.speed * Math.cos(shipRotation);
    return {
      dx,
      dy,
      initialSpeed: this.gunSpecs.speed,
      initialDirection: this.rotation,
    };
  }

  reloadGun() {
    this.gunReloadTimer = this.gunSpecs.reloadTime;
  }

  isGunLoaded() {
    return this.gunReloadTimer <= 0;
  }
}
