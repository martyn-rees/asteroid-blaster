import { vi, describe, it, expect, beforeEach } from "vitest";
import { checkLevelComplete } from "./level.ts";
import Viewport from "../entities/viewport.ts";
import type { GameState } from "../state/game-state.ts";
import type Ship from "../entities/ship.ts";
import type Rock from "../entities/rock.ts";

const mockChangeGameState = vi.hoisted(() => vi.fn());
const mockStartLevel = vi.hoisted(() => vi.fn());

vi.mock("../state/game-state.ts", () => ({
  changeGameState: mockChangeGameState,
}));

vi.mock("../ui/level-start.ts", () => ({
  startLevel: mockStartLevel,
}));

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

function makeMockRock(id: string): Rock {
  return { id, boundary: vi.fn(() => ({ x: 0, y: 0, r: 50 })) } as unknown as Rock;
}

function makeShip(state: "active" | "exploding" | "destroyed" = "active"): Ship {
  return { state, boundary: vi.fn(() => ({ x: 0, y: 0, r: 10 })) } as unknown as Ship;
}

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
