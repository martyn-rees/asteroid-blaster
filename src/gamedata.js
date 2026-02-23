export const bulletSpecs = {
  r: 2,
  endurance: 90,
  power: 1,
};
export const shipSpecs = {
  maxSpeed: 4.0,
  drag: 0.005,
  thrust: 0.1,
  radius: 6,
  rotationSpeed: 2,
};
export const gunSpec = {
  barrelLocation: { x: 0, y: 6 },
  speed: 6,
  reloadTime: 10,
};
export const rockType = {
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
