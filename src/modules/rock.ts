export default class Rock {
  static rockIDCounter = 0;
  public id: string;
  public size: string;
  public r: number;
  public rotationRate: number;
  private velocity: { speed: number; direction: number };
  private position: { x: number; y: number };
  public rotation: number;

  constructor({
    initialPosition,
    initialVelocity,
    size,
    r,
    rotationRate,
  }: {
    initialPosition: { x: number; y: number };
    initialVelocity: { speed: number; direction: number };
    size: string;
    r: number;
    rotationRate: number;
  }) {
    // constant values for life of this rock
    this.id = "rock" + Rock.rockIDCounter++;
    this.size = size;
    this.r = r;
    this.rotationRate = rotationRate;

    // these values change per frame
    this.velocity = {
      speed: initialVelocity.speed,
      direction: initialVelocity.direction,
    };
    this.position = { x: initialPosition.x, y: initialPosition.y };
    this.rotation = 0;
  }

  public getPosition(): { x: number; y: number } {
    return this.position;
  }

  convertDegreestoRadians(degrees: number) {
    return 0.0174533 * degrees;
  }

  boundary(): { x: number; y: number; r: number } {
    return {
      x: this.position.x,
      y: this.position.y,
      r: this.r,
    };
  }

  update(transformXCallback?: Function, transformYCallback?: Function) {
    // update new position of rock based on velocity
    const radians = this.convertDegreestoRadians(this.velocity.direction);
    const dx = this.velocity.speed * Math.sin(radians);
    const dy = this.velocity.speed * Math.cos(radians);
    let newX = this.position.x + dx;
    let newY = this.position.y + dy;
    this.rotation += this.rotationRate;
    // use transforms to update position of rock on game screen
    this.position.x = transformXCallback ? transformXCallback(newX) : newX;
    this.position.y = transformYCallback ? transformYCallback(newY) : newY;
  }

  render(renderCallback: Function) {
    renderCallback(this.id, this.position.x, this.position.y, this.rotation);
  }
}
