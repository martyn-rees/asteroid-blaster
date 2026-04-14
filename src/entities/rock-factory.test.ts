import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { addNewRocksForNewLevel, explodeRock } from "./rock-factory.ts";
import { levelData } from "../assets/gamedata.ts";
import Rock from "./rock.ts";

const mockGameState = vi.hoisted(() => ({ level: 1 as number }));
const mockChangeGameState = vi.hoisted(() => vi.fn());
const mockGetRandomEdgePosition = vi.hoisted(() => vi.fn());
const mockGetRandomRockProps = vi.hoisted(() => vi.fn());

vi.mock("../state/game-state.ts", () => ({
  get gameState() {
    return mockGameState;
  },
  changeGameState: mockChangeGameState,
}));

vi.mock("../utils/rock-randomizer.ts", () => ({
  getRandomEdgePosition: mockGetRandomEdgePosition,
  getRandomRockProps: mockGetRandomRockProps,
}));

vi.mock("./rock.ts", () => ({
  default: class {
    size: string;
    rockPosition: { x: number; y: number };
    id: string;
    constructor({ size, initialPosition }: { size: string; initialPosition: { x: number; y: number } }) {
      this.size = size;
      this.rockPosition = initialPosition;
      this.id = `mock-${size}`;
    }
  },
}));

function addedRocks() {
  return mockChangeGameState.mock.calls
    .filter(([arg]) => arg.action === "add rock")
    .map(([arg]) => arg.payload);
}

describe("addNewRocksForNewLevel", () => {
  const screenSize = { screenWidth: 800, screenHeight: 600 };

  beforeEach(() => {
    mockGetRandomEdgePosition.mockReturnValue({ x: 0, y: 0 });
    mockGetRandomRockProps.mockReturnValue({ velocity: {}, r: 70, rotationRate: 0.5 });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("spawns only large rocks", () => {
    addNewRocksForNewLevel({ level: 1, screenSize });
    expect(addedRocks().every((r) => r.size === "large")).toBe(true);
  });

  levelData.forEach(({ level, largeRocks }) => {
    it(`spawns ${largeRocks} large rocks for level ${level}`, () => {
      addNewRocksForNewLevel({ level, screenSize });
      expect(addedRocks()).toHaveLength(largeRocks);
    });
  });

  it("falls back to last level config for levels beyond levelData", () => {
    const lastLevel = levelData[levelData.length - 1];
    addNewRocksForNewLevel({ level: 99, screenSize });
    expect(addedRocks()).toHaveLength(lastLevel.largeRocks);
  });
});

describe("explodeRock", () => {
  beforeEach(() => {
    mockGameState.level = 2;
    mockGetRandomRockProps.mockReturnValue({ velocity: {}, r: 30, rotationRate: 1 });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  function makeMockRock(size: "large" | "medium" | "small") {
    return { rockPosition: { x: 100, y: 200 }, size, id: `test-${size}` } as unknown as Rock;
  }

  it("spawns medium rocks when a large rock explodes", () => {
    explodeRock(makeMockRock("large"));
    const rocks = addedRocks();
    expect(rocks).toHaveLength(levelData[1].largeRockExplosions);
    expect(rocks.every((r) => r.size === "medium")).toBe(true);
  });

  it("spawns small rocks when a medium rock explodes", () => {
    mockGameState.level = 3; // mediumRockExplosions: 3
    explodeRock(makeMockRock("medium"));
    const rocks = addedRocks();
    expect(rocks).toHaveLength(levelData[2].mediumRockExplosions);
    expect(rocks.every((r) => r.size === "small")).toBe(true);
  });

  it("spawns no rocks when a small rock explodes", () => {
    explodeRock(makeMockRock("small"));
    expect(addedRocks()).toHaveLength(0);
  });

  it("deletes the exploded rock", () => {
    const rock = makeMockRock("large");
    explodeRock(rock);
    expect(mockChangeGameState).toHaveBeenCalledWith({
      action: "delete rock",
      payload: rock,
    });
  });

  it("level 1 medium rocks produce no small rocks", () => {
    mockGameState.level = 1;
    explodeRock(makeMockRock("medium"));
    expect(addedRocks()).toHaveLength(0);
  });

  it("falls back to last level config for levels beyond levelData", () => {
    mockGameState.level = 99;
    explodeRock(makeMockRock("large"));
    const lastLevel = levelData[levelData.length - 1];
    expect(addedRocks()).toHaveLength(lastLevel.largeRockExplosions);
  });
});
