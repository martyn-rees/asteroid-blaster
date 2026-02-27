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
type Range = { min: number; max: number };

export type RockSpec = {
  description: string;
  value: number;
  radius: Range;
  speed: Range;
  rotationRate: Range;
};
export type RockType = {
  [key: string]: RockSpec;
};

export const rockType: RockType = {
  LARGE: {
    description: "large",
    value: 100,
    radius: { min: 60, max: 80 },
    speed: { min: 1, max: 2 },
    rotationRate: { min: 0.3, max: 0.8 },
  },
  MEDIUM: {
    description: "medium",
    value: 200,
    radius: { min: 25, max: 40 },
    speed: { min: 2.5, max: 3 },
    rotationRate: { min: 1.3, max: 2 },
  },
  SMALL: {
    description: "small",
    value: 300,
    radius: { min: 10, max: 15 },
    speed: { min: 3, max: 4 },
    rotationRate: { min: 2, max: 3 },
  },
};
export const keyBindings = {
  rotateLeft: "ArrowLeft",
  rotateRight: "ArrowRight",
  thrust: "ArrowUp",
  shoot: "KeyS",
};
