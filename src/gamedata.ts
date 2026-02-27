export const bulletSpecs = {
  r: 2,
  endurance: 90,
  power: 1,
};
export const shipSpecs = {
  speedMax: 4.0,
  drag: 0.005,
  thrustMax: 0.1,
  radius: 6,
  rotationSpeed: 2,
};
export const gunSpec = {
  barrelLocation: { x: 0, y: 6 },
  speed: 6,
  reloadTime: 10,
};
export type RockSpec = {
  minRadius: number;
  maxRadius: number;
  minSpeed: number;
  maxSpeed: number;
  value: number;
};
export type RockType = {
  [key: string]: RockSpec;
};

export const rockType: RockType = {
  LARGE: {
    minRadius: 60,
    maxRadius: 80,
    minSpeed: 1,
    maxSpeed: 2,
    value: 100,
  },
  MEDIUM: {
    minRadius: 25,
    maxRadius: 40,
    minSpeed: 2.5,
    maxSpeed: 3,
    value: 200,
  },
  SMALL: {
    minRadius: 10,
    maxRadius: 15,
    minSpeed: 4,
    maxSpeed: 5,
    value: 300,
  },
};
export const keyBindings = {
  rotateLeft: 37,
  rotateRight: 39,
  thrust: 38,
  shoot: 83,
};
