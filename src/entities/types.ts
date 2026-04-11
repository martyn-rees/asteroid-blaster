export type RockSize = "large" | "medium" | "small";

export type EdgeSide = "top" | "right" | "bottom" | "left";

export type SoundEffect = "shoot" | "rock-explosion";

export type GamePhase = "start" | "playing" | "paused" | "gameover";

export type BoundaryTransform = (n: number) => number;

export type Position = {
  x: number;
  y: number;
};

export type Velocity = {
  speed: number;
  direction: number;
};

export type MotionState = {
  position: Position;
  velocity: Velocity;
  rotation: number;
};

export type Circle = {
  x: number;
  y: number;
  r: number;
};
