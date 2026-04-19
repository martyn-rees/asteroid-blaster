export const bulletSpecs = {
  r: 2,
  endurance: 90,
  power: 1,
};

export const shipSpecs = {
  speedMax: 4.0,
  drag: 0.005,
  thrustMax: 0.1,
  radius: 10,
  rotationSpeed: 2,
};

// muzzle offsets assume ship is facing East (rotation 0)
export type GunSpec = {
  muzzleOffset: { x: number; y: number };
  muzzleSpeed: number;
  reloadTime: number;
};

export const gunSpecs = {
  single: [{ muzzleOffset: { x: 10, y: 0 }, muzzleSpeed: 6, reloadTime: 12 }],
  double: [
    { muzzleOffset: { x: -4, y: -7 }, muzzleSpeed: 6, reloadTime: 12 },
    { muzzleOffset: { x: -4, y: 7 }, muzzleSpeed: 6, reloadTime: 12 },
  ],
  triple: [
    { muzzleOffset: { x: 10, y: 0 }, muzzleSpeed: 6, reloadTime: 12 },
    { muzzleOffset: { x: -4, y: -7 }, muzzleSpeed: 6, reloadTime: 24 },
    { muzzleOffset: { x: -4, y: 7 }, muzzleSpeed: 6, reloadTime: 24 },
  ],
} satisfies Record<string, GunSpec[]>;

export type GunLoadoutName = keyof typeof gunSpecs;

type Range = { min: number; max: number };

export type RockSize = "large" | "medium" | "small";

export type RockSpec = {
  description: RockSize;
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
