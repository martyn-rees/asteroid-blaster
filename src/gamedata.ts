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
  barrelOffset: { x: 0, y: 6 },
  muzzleSpeed: 6,
  reloadTime: 12,
};
type Range = { min: number; max: number };

type RockSpec = {
  description: string;
  value: number;
  radius: Range;
  speed: Range;
  rotationRate: Range;
};
type RockType = {
  [key: string]: RockSpec;
};

export const rockType: RockType = {
  large: {
    description: "large",
    value: 100,
    radius: { min: 60, max: 80 },
    speed: { min: 1, max: 2 },
    rotationRate: { min: 0.3, max: 0.8 },
  },
  medium: {
    description: "medium",
    value: 200,
    radius: { min: 25, max: 40 },
    speed: { min: 2.5, max: 3 },
    rotationRate: { min: 1.3, max: 2 },
  },
  small: {
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

/* get random valus for new asteroids */
function getRandomNumber(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

export function getRockData(size: string): {
  velocity: { speed: number; direction: number };
  r: number;
  rotationRate: number;
} {
  let rockProps: RockSpec = rockType[size];
  let speed = getRandomNumber(rockProps.speed.min, rockProps.speed.max);
  let r = getRandomNumber(rockProps.radius.min, rockProps.radius.max);
  // choose a random direction but avoid angles within 15 degrees to vertical or horizontal
  let direction = getRandomNumber(15, 75);
  let quadrant = 1 + Math.floor(Math.random() * 4);
  direction = direction * quadrant;
  let rotationRate = getRandomNumber(
    rockProps.rotationRate.min,
    rockProps.rotationRate.max,
  );
  rotationRate = Math.random() > 0.5 ? rotationRate : -rotationRate;
  let velocity = { speed, direction };
  return { velocity, r, rotationRate };
}
/* end of random values for new asteroids */

export function getRockValue(size: string): number {
  return rockType[size].value;
}
