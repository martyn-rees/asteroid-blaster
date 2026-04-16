import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { showLevelAnnouncement } from "./level-announcement.ts";

const mockGameState = vi.hoisted(() => ({ state: "playing" as string }));
const mockChangeGameState = vi.hoisted(() => vi.fn());

vi.mock("../state/game-state.ts", () => ({
  get gameState() {
    return mockGameState;
  },
  changeGameState: mockChangeGameState,
}));

describe("showLevelAnnouncement", () => {
  const screenId = "gameScreen";
  const onComplete = vi.fn();

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
    showLevelAnnouncement({ level: 1, screenId, onComplete });
    expect(document.getElementById("levelAnnouncement")).not.toBeNull();
  });

  it("displays the correct level text", () => {
    showLevelAnnouncement({ level: 3, screenId, onComplete });
    expect(document.getElementById("levelAnnouncement")?.textContent).toBe("LEVEL 3");
  });

  it("applies the correct CSS classes to the announcement", () => {
    showLevelAnnouncement({ level: 1, screenId, onComplete });
    const el = document.getElementById("levelAnnouncement");
    expect(el?.className).toBe("level-announcement press-start-2p-regular");
  });

  it("removes the announcement from the DOM after 2 seconds", () => {
    showLevelAnnouncement({ level: 1, screenId, onComplete });
    vi.advanceTimersByTime(2000);
    expect(document.getElementById("levelAnnouncement")).toBeNull();
  });

  it("does not remove the announcement before 2 seconds", () => {
    showLevelAnnouncement({ level: 1, screenId, onComplete });
    vi.advanceTimersByTime(1999);
    expect(document.getElementById("levelAnnouncement")).not.toBeNull();
  });

  it("calls onComplete after 2 seconds when state is playing", () => {
    showLevelAnnouncement({ level: 3, screenId, onComplete });
    vi.advanceTimersByTime(2000);
    expect(onComplete).toHaveBeenCalledOnce();
  });

  it("does not call onComplete if state is gameover when timer fires", () => {
    showLevelAnnouncement({ level: 1, screenId, onComplete });
    mockGameState.state = "gameover";
    vi.advanceTimersByTime(2000);
    expect(onComplete).not.toHaveBeenCalled();
  });

  it("calls onComplete when state is paused when timer fires", () => {
    showLevelAnnouncement({ level: 1, screenId, onComplete });
    mockGameState.state = "paused";
    vi.advanceTimersByTime(2000);
    expect(onComplete).toHaveBeenCalledOnce();
  });

  it("clears level pending after 2 seconds when state is playing", () => {
    showLevelAnnouncement({ level: 1, screenId, onComplete });
    vi.advanceTimersByTime(2000);
    expect(mockChangeGameState).toHaveBeenCalledWith({
      action: "clear level pending",
    });
  });

  it("does not clear level pending if state is gameover when timer fires", () => {
    showLevelAnnouncement({ level: 1, screenId, onComplete });
    mockGameState.state = "gameover";
    vi.advanceTimersByTime(2000);
    expect(mockChangeGameState).not.toHaveBeenCalledWith({
      action: "clear level pending",
    });
  });

  it("clears level pending when state is paused when timer fires", () => {
    showLevelAnnouncement({ level: 1, screenId, onComplete });
    mockGameState.state = "paused";
    vi.advanceTimersByTime(2000);
    expect(mockChangeGameState).toHaveBeenCalledWith({
      action: "clear level pending",
    });
  });
});
