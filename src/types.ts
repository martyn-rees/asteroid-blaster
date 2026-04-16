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

export type Size = {
  width: number;
  height: number;
};

export interface GameEntity {
  id: string;
  update(transformPosition?: PositionTransform, dt?: number): void;
  boundary(): Circle;
}
