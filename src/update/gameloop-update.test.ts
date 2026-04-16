import { vi, describe, it, expect, beforeEach } from "vitest";
import {
  spawnBulletIfFiring,
  processCollisions,
  checkLevelComplete,
} from "./gameloop-update.ts";
import Viewport from "../entities/viewport.ts";
import type { GameState } from "../state/game-state.ts";
import type Ship from "../entities/ship.ts";
import type Rock from "../entities/rock.ts";
import type Bullet from "../entities/bullet.ts";

const mockChangeGameState = vi.hoisted(() => vi.fn());
const mockExplodeRock = vi.hoisted(() => vi.fn());
const mockStartLevel = vi.hoisted(() => vi.fn());
const mockRemoveShipControlEvents = vi.hoisted(() => vi.fn());
const mockTestCollision = vi.hoisted(() => vi.fn());
const mockBulletConstructor = vi.hoisted(() => vi.fn());

vi.mock("../state/game-state.ts", () => ({
  changeGameState: mockChangeGameState,
}));

vi.mock("../entities/rock-factory.ts", () => ({
  explodeRock: mockExplodeRock,
}));

vi.mock("../ui/level-start.ts", () => ({
  startLevel: mockStartLevel,
}));

vi.mock("../input/ship-actions.ts", () => ({
  removeShipControlEvents: mockRemoveShipControlEvents,
}));

vi.mock("../utils/maths.ts", () => ({
  testCollision: mockTestCollision,
  constrainNumber: vi.fn((n: number) => n),
}));

vi.mock("../config/game-entity-specs.ts", () => ({
  rockType: {
    large: { value: 20 },
    medium: { value: 50 },
    small: { value: 100 },
  },
  bulletSpecs: { r: 2, endurance: 90, power: 1 },
}));

vi.mock("../entities/bullet.ts", () => ({
  default: mockBulletConstructor,
}));

// ─── Helpers ────────────────────────────────────────────────────────────────

function makeState(overrides: Partial<GameState> = {}): GameState {
  return {
    state: "playing",
    previousState: "",
    score: 0,
    hiScore: 0,
    level: 1,
    levelStartPending: false,
    ship: undefined,
    rocks: {},
    bullets: {},
    ...overrides,
  };
}

function makeMockRock(id: string, size: "large" | "medium" | "small" = "large") {
  return {
    id,
    size,
    boundary: vi.fn(() => ({ x: 0, y: 0, r: 50 })),
  } as unknown as Rock;
}

function makeMockBullet(id: string) {
  return {
    id,
    boundary: vi.fn(() => ({ x: 0, y: 0, r: 2 })),
    bulletPower: 1,
  } as unknown as Bullet;
}

function makeShip(state: "active" | "exploding" | "destroyed" = "active") {
  return {
    state,
    boundary: vi.fn(() => ({ x: 0, y: 0, r: 10 })),
    gun: null,
  } as unknown as Ship;
}

// ─── spawnBulletIfFiring ─────────────────────────────────────────────────────

describe("spawnBulletIfFiring", () => {
  const mockBulletInstance = { id: "bullet-mock" };

  function makeShipWithFiringGun() {
    return {
      state: "active",
      gun: {
        state: "firing",
        getInitialMotionStateOfBullet: vi.fn(() => ({
          bulletPosition: { x: 100, y: 100 },
          bulletVelocity: { speed: 6, direction: 0 },
        })),
      },
    } as unknown as Ship;
  }

  beforeEach(() => {
    vi.clearAllMocks();
    mockBulletConstructor.mockImplementation(function () {
      return mockBulletInstance;
    });
  });

  it("dispatches 'add bullet' when ship is active and gun is firing", () => {
    spawnBulletIfFiring(makeShipWithFiringGun());
    expect(mockChangeGameState).toHaveBeenCalledWith({
      action: "add bullet",
      payload: mockBulletInstance,
    });
  });

  it("does not spawn when ship state is not active", () => {
    const ship = { state: "exploding", gun: { state: "firing" } } as unknown as Ship;
    spawnBulletIfFiring(ship);
    expect(mockChangeGameState).not.toHaveBeenCalled();
  });

  it("does not spawn when ship has no gun", () => {
    const ship = { state: "active", gun: null } as unknown as Ship;
    spawnBulletIfFiring(ship);
    expect(mockChangeGameState).not.toHaveBeenCalled();
  });

  it("does not spawn when gun is not firing", () => {
    const ship = {
      state: "active",
      gun: { state: "loaded" },
    } as unknown as Ship;
    spawnBulletIfFiring(ship);
    expect(mockChangeGameState).not.toHaveBeenCalled();
  });
});

// ─── checkLevelComplete ──────────────────────────────────────────────────────

describe("checkLevelComplete", () => {
  const gameScreen = new Viewport("gameScreen", 800, 400);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("dispatches 'next level' and calls startLevel when all rocks are cleared", () => {
    let state = makeState({ rocks: {}, level: 1 });
    mockChangeGameState.mockImplementation(() => {
      state = { ...state, level: state.level + 1 };
    });

    checkLevelComplete(makeShip(), gameScreen, () => state);

    expect(mockChangeGameState).toHaveBeenCalledWith({ action: "next level" });
    expect(mockStartLevel).toHaveBeenCalledWith({
      level: 2,
      screenId: gameScreen.id,
      screenSize: gameScreen.size,
    });
  });

  it("calls startLevel with the level after the dispatch, not before", () => {
    let state = makeState({ rocks: {}, level: 3 });
    mockChangeGameState.mockImplementation(() => {
      state = { ...state, level: state.level + 1 };
    });

    checkLevelComplete(makeShip(), gameScreen, () => state);

    expect(mockStartLevel).toHaveBeenCalledWith(
      expect.objectContaining({ level: 4 }),
    );
  });

  it("does nothing when rocks remain", () => {
    const state = makeState({ rocks: { r1: makeMockRock("r1") } });
    checkLevelComplete(makeShip(), gameScreen, () => state);
    expect(mockChangeGameState).not.toHaveBeenCalled();
    expect(mockStartLevel).not.toHaveBeenCalled();
  });

  it("does nothing when ship is not active", () => {
    const state = makeState({ rocks: {} });
    checkLevelComplete(makeShip("exploding"), gameScreen, () => state);
    expect(mockChangeGameState).not.toHaveBeenCalled();
  });

  it("does nothing when game phase is not playing", () => {
    const state = makeState({ rocks: {}, state: "gameover" });
    checkLevelComplete(makeShip(), gameScreen, () => state);
    expect(mockChangeGameState).not.toHaveBeenCalled();
  });

  it("does nothing when levelStartPending is true", () => {
    const state = makeState({ rocks: {}, levelStartPending: true });
    checkLevelComplete(makeShip(), gameScreen, () => state);
    expect(mockChangeGameState).not.toHaveBeenCalled();
  });
});

// ─── processCollisions ───────────────────────────────────────────────────────

describe("processCollisions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("bullet hits rock", () => {
    it("deletes the bullet, scores, and explodes the rock", () => {
      const rock = makeMockRock("r1", "large");
      const bullet = makeMockBullet("b1");
      const state = makeState({ bullets: { b1: bullet }, level: 2 });

      mockTestCollision.mockReturnValue(true);

      processCollisions(makeShip(), { r1: rock }, () => state);

      expect(mockChangeGameState).toHaveBeenCalledWith({
        action: "delete bullet",
        payload: bullet,
      });
      expect(mockChangeGameState).toHaveBeenCalledWith({
        action: "score",
        payload: 20,
      });
      expect(mockExplodeRock).toHaveBeenCalledWith(rock, 2);
    });

    it("does not check ship collision when bullet already hit the rock", () => {
      const rock = makeMockRock("r1");
      const bullet = makeMockBullet("b1");
      const state = makeState({ bullets: { b1: bullet } });

      mockTestCollision.mockReturnValue(true);

      processCollisions(makeShip(), { r1: rock }, () => state);

      expect(mockTestCollision).toHaveBeenCalledTimes(1);
      expect(mockChangeGameState).not.toHaveBeenCalledWith({ action: "delete ship" });
      expect(mockRemoveShipControlEvents).not.toHaveBeenCalled();
    });

    it("scores the correct value for a medium rock", () => {
      const rock = makeMockRock("r1", "medium");
      const bullet = makeMockBullet("b1");
      const state = makeState({ bullets: { b1: bullet } });

      mockTestCollision.mockReturnValue(true);

      processCollisions(makeShip(), { r1: rock }, () => state);

      expect(mockChangeGameState).toHaveBeenCalledWith({
        action: "score",
        payload: 50,
      });
    });
  });

  describe("rock hits ship", () => {
    it("deletes ship, removes controls, scores, and explodes rock", () => {
      const rock = makeMockRock("r1", "medium");
      const state = makeState({ bullets: {}, level: 1 });

      mockTestCollision.mockReturnValue(true);

      processCollisions(makeShip(), { r1: rock }, () => state);

      expect(mockChangeGameState).toHaveBeenCalledWith({ action: "delete ship" });
      expect(mockRemoveShipControlEvents).toHaveBeenCalled();
      expect(mockChangeGameState).toHaveBeenCalledWith({
        action: "score",
        payload: 50,
      });
      expect(mockExplodeRock).toHaveBeenCalledWith(rock, 1);
    });

    it("does not check ship collision when ship is not active", () => {
      const rock = makeMockRock("r1");
      const state = makeState({ bullets: {} });

      processCollisions(makeShip("exploding"), { r1: rock }, () => state);

      expect(mockTestCollision).not.toHaveBeenCalled();
      expect(mockChangeGameState).not.toHaveBeenCalled();
    });
  });

  describe("no collision", () => {
    it("dispatches nothing when no rock collides with anything", () => {
      const rock = makeMockRock("r1");
      const bullet = makeMockBullet("b1");
      const state = makeState({ bullets: { b1: bullet } });

      mockTestCollision.mockReturnValue(false);

      processCollisions(makeShip(), { r1: rock }, () => state);

      expect(mockChangeGameState).not.toHaveBeenCalled();
      expect(mockExplodeRock).not.toHaveBeenCalled();
    });
  });

  describe("multi-rock frame", () => {
    it("does not test a deleted bullet against subsequent rocks", () => {
      const rock1 = makeMockRock("r1");
      const rock2 = makeMockRock("r2");
      const bullet = makeMockBullet("b1");

      let state = makeState({ bullets: { b1: bullet }, level: 1 });

      // Simulate the real delete: remove bullet from state when dispatcher is called
      mockChangeGameState.mockImplementation((action: { action: string; payload?: Bullet }) => {
        if (action.action === "delete bullet") {
          const { [action.payload!.id]: _, ...rest } = state.bullets;
          state = { ...state, bullets: rest };
        }
      });

      // bullet hits r1; all subsequent calls miss
      mockTestCollision.mockReturnValueOnce(true).mockReturnValue(false);

      processCollisions(makeShip(), { r1: rock1, r2: rock2 }, () => state);

      // Two calls: r1 vs bullet (hit), r2 vs ship (miss — no bullets left for r2)
      // If the bullet were not removed from state, there would be a third call: r2 vs bullet
      expect(mockTestCollision).toHaveBeenCalledTimes(2);
    });

    it("scores independently for each rock hit", () => {
      const rock1 = makeMockRock("r1", "large");
      const rock2 = makeMockRock("r2", "small");
      const bullet1 = makeMockBullet("b1");
      const bullet2 = makeMockBullet("b2");

      let state = makeState({ bullets: { b1: bullet1, b2: bullet2 }, level: 1 });

      mockChangeGameState.mockImplementation((action: { action: string; payload?: Bullet }) => {
        if (action.action === "delete bullet") {
          const { [action.payload!.id]: _, ...rest } = state.bullets;
          state = { ...state, bullets: rest };
        }
      });

      mockTestCollision.mockReturnValue(true);

      processCollisions(makeShip(), { r1: rock1, r2: rock2 }, () => state);

      const scoreDispatches = mockChangeGameState.mock.calls.filter(
        ([arg]) => arg.action === "score",
      );
      expect(scoreDispatches).toHaveLength(2);
      const scoreValues = scoreDispatches.map(([arg]) => arg.payload);
      expect(scoreValues).toContain(20);
      expect(scoreValues).toContain(100);
    });
  });
});
