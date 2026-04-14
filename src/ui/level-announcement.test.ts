import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { showLevelAnnouncement } from "./level-announcement.ts";

const mockGameState = vi.hoisted(() => ({ state: "playing" as string }));
const mockChangeGameState = vi.hoisted(() => vi.fn());
const mockAddNewRocksForNewLevel = vi.hoisted(() => vi.fn());

vi.mock("../state/game-state.ts", () => ({
  get gameState() {
    return mockGameState;
  },
  changeGameState: mockChangeGameState,
}));

vi.mock("../entities/rock-factory.ts", () => ({
  addNewRocksForNewLevel: mockAddNewRocksForNewLevel,
}));

describe("showLevelAnnouncement", () => {
  const screenSize = { screenWidth: 800, screenHeight: 600 };
  const screenId = "gameScreen";

  beforeEach(() => {
    vi.useFakeTimers();
    mockGameState.state = "playing";

    const screen = document.createElement("div");
    screen.id = screenId;
    document.body.appendChild(screen);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
    document.body.innerHTML = "";
  });

  it("adds the announcement element to the screen", () => {
    showLevelAnnouncement({ level: 1, screenSize, screenId });
    expect(document.getElementById("levelAnnouncement")).not.toBeNull();
  });

  it("displays the correct level text", () => {
    showLevelAnnouncement({ level: 3, screenSize, screenId });
    expect(document.getElementById("levelAnnouncement")?.textContent).toBe("LEVEL 3");
  });

  it("applies the correct CSS classes to the announcement", () => {
    showLevelAnnouncement({ level: 1, screenSize, screenId });
    const el = document.getElementById("levelAnnouncement");
    expect(el?.className).toBe("level-announcement press-start-2p-regular");
  });

  it("removes the announcement from the DOM after 2 seconds", () => {
    showLevelAnnouncement({ level: 1, screenSize, screenId });
    vi.advanceTimersByTime(2000);
    expect(document.getElementById("levelAnnouncement")).toBeNull();
  });

  it("does not remove the announcement before 2 seconds", () => {
    showLevelAnnouncement({ level: 1, screenSize, screenId });
    vi.advanceTimersByTime(1999);
    expect(document.getElementById("levelAnnouncement")).not.toBeNull();
  });

  it("adds rocks after 2 seconds when state is playing", () => {
    showLevelAnnouncement({ level: 3, screenSize, screenId });
    vi.advanceTimersByTime(2000);
    expect(mockAddNewRocksForNewLevel).toHaveBeenCalledWith({
      level: 3,
      screenSize,
    });
  });

  it("does not add rocks if state changes before timer fires", () => {
    showLevelAnnouncement({ level: 1, screenSize, screenId });
    mockGameState.state = "gameover";
    vi.advanceTimersByTime(2000);
    expect(mockAddNewRocksForNewLevel).not.toHaveBeenCalled();
  });

  it("clears level pending after 2 seconds regardless of game state", () => {
    showLevelAnnouncement({ level: 1, screenSize, screenId });
    mockGameState.state = "gameover";
    vi.advanceTimersByTime(2000);
    expect(mockChangeGameState).toHaveBeenCalledWith({
      action: "clear level pending",
    });
  });
});
