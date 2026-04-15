export type EdgeSide = "top" | "right" | "bottom" | "left";

export type GamePhase = "start" | "playing" | "paused" | "gameover";

export type Position = {
  x: number;
  y: number;
};

export type PositionTransform = (position: Position) => Position;

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
