import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { spawnRocks, explodeRock } from "./rock-factory.ts";
import Rock from "./rock.ts";

const mockChangeGameState = vi.hoisted(() => vi.fn());
const mockGetRandomEdgePosition = vi.hoisted(() => vi.fn());
const mockGetRandomRockProps = vi.hoisted(() => vi.fn());
const mockGetLevelConfig = vi.hoisted(() => vi.fn());

vi.mock("../state/game-state.ts", () => ({
  changeGameState: mockChangeGameState,
}));

vi.mock("./rock-randomizer.ts", () => ({
  getRandomRockProps: mockGetRandomRockProps,
}));

vi.mock("../utils/random-generators.ts", () => ({
  getRandomEdgePosition: mockGetRandomEdgePosition,
}));

vi.mock("../config/level-config.ts", () => ({
  getLevelConfig: mockGetLevelConfig,
}));

vi.mock("../config/game-entity-specs.ts", () => ({
  rockType: {
    large: {},
    medium: {},
    small: {},
  },
}));

vi.mock("./rock.ts", () => ({
  default: class {
    size: string;
    rockPosition: { x: number; y: number };
    id: string;
    constructor({
      size,
      initialPosition,
    }: {
      size: string;
      initialPosition: { x: number; y: number };
    }) {
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

describe("spawnRocks", () => {
  const screenSize = { width: 800, height: 600 };

  beforeEach(() => {
    mockGetRandomEdgePosition.mockReturnValue({ x: 0, y: 0 });
    mockGetRandomRockProps.mockReturnValue({
      velocity: {},
      r: 70,
      rotationRate: 0.5,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("spawns the correct number of large rocks from config", () => {
    mockGetLevelConfig.mockReturnValue({
      largeRocks: 4,
      mediumRocks: 0,
      smallRocks: 0,
    });
    spawnRocks({ level: 1, screenSize });
    expect(addedRocks().filter((r) => r.size === "large")).toHaveLength(4);
  });

  it("spawns the correct number of medium rocks from config", () => {
    mockGetLevelConfig.mockReturnValue({
      largeRocks: 0,
      mediumRocks: 3,
      smallRocks: 0,
    });
    spawnRocks({ level: 1, screenSize });
    expect(addedRocks().filter((r) => r.size === "medium")).toHaveLength(3);
  });

  it("spawns the correct number of small rocks from config", () => {
    mockGetLevelConfig.mockReturnValue({
      largeRocks: 0,
      mediumRocks: 0,
      smallRocks: 2,
    });
    spawnRocks({ level: 1, screenSize });
    expect(addedRocks().filter((r) => r.size === "small")).toHaveLength(2);
  });

  it("spawns rocks of multiple sizes from config", () => {
    mockGetLevelConfig.mockReturnValue({
      largeRocks: 2,
      mediumRocks: 1,
      smallRocks: 3,
    });
    spawnRocks({ level: 1, screenSize });
    const rocks = addedRocks();
    expect(rocks.filter((r) => r.size === "large")).toHaveLength(2);
    expect(rocks.filter((r) => r.size === "medium")).toHaveLength(1);
    expect(rocks.filter((r) => r.size === "small")).toHaveLength(3);
  });

  it("spawns no rocks when config returns zero for all sizes", () => {
    mockGetLevelConfig.mockReturnValue({
      largeRocks: 0,
      mediumRocks: 0,
      smallRocks: 0,
    });
    spawnRocks({ level: 1, screenSize });
    expect(addedRocks()).toHaveLength(0);
  });
});

describe("explodeRock", () => {
  beforeEach(() => {
    mockGetRandomRockProps.mockReturnValue({
      velocity: {},
      r: 30,
      rotationRate: 1,
    });
    mockGetRandomEdgePosition.mockReturnValue({ x: 0, y: 0 });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  function makeMockRock(size: "large" | "medium" | "small") {
    return {
      rockPosition: { x: 100, y: 200 },
      size,
      id: `test-${size}`,
    } as unknown as Rock;
  }

  it("spawns medium rocks when a large rock explodes", () => {
    mockGetLevelConfig.mockReturnValue({
      largeRockExplosions: 3,
      mediumRockExplosions: 2,
    });
    explodeRock(makeMockRock("large"), 1);
    const rocks = addedRocks();
    expect(rocks).toHaveLength(3);
    expect(rocks.every((r) => r.size === "medium")).toBe(true);
  });

  it("spawns small rocks when a medium rock explodes", () => {
    mockGetLevelConfig.mockReturnValue({
      largeRockExplosions: 2,
      mediumRockExplosions: 4,
    });
    explodeRock(makeMockRock("medium"), 1);
    const rocks = addedRocks();
    expect(rocks).toHaveLength(4);
    expect(rocks.every((r) => r.size === "small")).toBe(true);
  });

  it("spawns no rocks when a small rock explodes", () => {
    mockGetLevelConfig.mockReturnValue({
      largeRockExplosions: 2,
      mediumRockExplosions: 2,
    });
    explodeRock(makeMockRock("small"), 1);
    expect(addedRocks()).toHaveLength(0);
  });

  it("spawns no medium rocks when largeRockExplosions is zero", () => {
    mockGetLevelConfig.mockReturnValue({
      largeRockExplosions: 0,
      mediumRockExplosions: 2,
    });
    explodeRock(makeMockRock("large"), 1);
    expect(addedRocks()).toHaveLength(0);
  });

  it("spawns no small rocks when mediumRockExplosions is zero", () => {
    mockGetLevelConfig.mockReturnValue({
      largeRockExplosions: 2,
      mediumRockExplosions: 0,
    });
    explodeRock(makeMockRock("medium"), 1);
    expect(addedRocks()).toHaveLength(0);
  });

  it("deletes the exploded rock", () => {
    mockGetLevelConfig.mockReturnValue({
      largeRockExplosions: 2,
      mediumRockExplosions: 2,
    });
    const rock = makeMockRock("large");
    explodeRock(rock, 1);
    expect(mockChangeGameState).toHaveBeenCalledWith({
      action: "delete rock",
      payload: rock,
    });
  });
});
