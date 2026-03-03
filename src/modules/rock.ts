type RockSpec = {
  size: string;
  r: number;
  rotationRate: number;
};

export default class Rock {
  static rockIDCounter = 0;
  public id: string;
  public size: string;
  public r: number;
  public rotationRate: number;
  public velocity: { speed: number; direction: number };
  public x: number;
  public y: number;
  public rotation: number;

  constructor(
    initialPosition: { x: number; y: number },
    velocity: { speed: number; direction: number },
    rockSpecs: RockSpec,
  ) {
    // constant values for life of this rock
    this.id = "rock" + Rock.rockIDCounter++;
    this.size = rockSpecs.size;
    this.r = rockSpecs.r;
    this.rotationRate = rockSpecs.rotationRate;

    // these values change per frame
    this.velocity = velocity;
    this.x = initialPosition.x;
    this.y = initialPosition.y;
    this.rotation = 0;
  }

  convertDegreestoRadians(degrees: number) {
    return 0.0174533 * degrees;
  }

  boundary(): { x: number; y: number; r: number } {
    return {
      x: this.x,
      y: this.y,
      r: this.r,
    };
  }

  update(transformXCallback?: Function, transformYCallback?: Function) {
    // update new location of rock based on velocity
    const radians = this.convertDegreestoRadians(this.velocity.direction);
    const dx = this.velocity.speed * Math.sin(radians);
    const dy = this.velocity.speed * Math.cos(radians);
    let newX = this.x + dx;
    let newY = this.y + dy;
    this.rotation += this.rotationRate;
    // use transforms to update position of rock on game screen
    this.x = transformXCallback ? transformXCallback(newX) : newX;
    this.y = transformYCallback ? transformYCallback(newY) : newY;
  }

  render(renderCallback: Function) {
    renderCallback(this.id, this.x, this.y, this.rotation);
  }
}
