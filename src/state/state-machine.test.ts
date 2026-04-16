import { vi, describe, it, expect, beforeEach } from "vitest";
import { handleStateTransition } from "./state-machine.ts";
import Viewport from "../entities/viewport.ts";

const mockOnEnter = vi.hoisted(() => vi.fn());
const mockOnExit = vi.hoisted(() => vi.fn());
const mockSetUpLevel = vi.hoisted(() => vi.fn());
const mockRemoveFromScreen = vi.hoisted(() => vi.fn());

vi.mock("../events/events.ts", () => ({
  onEnter: mockOnEnter,
  onExit: mockOnExit,
  setUpLevel: mockSetUpLevel,
}));

vi.mock("../render/dom-render.ts", () => ({
  removeFromScreen: mockRemoveFromScreen,
}));

const gameScreen = new Viewport("gameScreen", 800, 400);
const onResetTimer = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
});

describe("start state", () => {
  it("calls onEnter('start') when entering from empty state", () => {
    handleStateTransition("start", "", gameScreen, onResetTimer);
    expect(mockOnEnter).toHaveBeenCalledWith("start", gameScreen);
  });

  it("calls onEnter('start') when entering from gameover and removes end screen", () => {
    handleStateTransition("start", "gameover", gameScreen, onResetTimer);
    expect(mockRemoveFromScreen).toHaveBeenCalledWith("endScreen");
    expect(mockOnEnter).toHaveBeenCalledWith("start", gameScreen);
  });

  it("removes end screen before calling onEnter when coming from gameover", () => {
    const callOrder: string[] = [];
    mockRemoveFromScreen.mockImplementation(() => callOrder.push("removeFromScreen"));
    mockOnEnter.mockImplementation(() => callOrder.push("onEnter"));
    handleStateTransition("start", "gameover", gameScreen, onResetTimer);
    expect(callOrder).toEqual(["removeFromScreen", "onEnter"]);
  });

  it("does not call onEnter when already in start state", () => {
    handleStateTransition("start", "start", gameScreen, onResetTimer);
    expect(mockOnEnter).not.toHaveBeenCalled();
  });

  it("does not reset the timer", () => {
    handleStateTransition("start", "", gameScreen, onResetTimer);
    expect(onResetTimer).not.toHaveBeenCalled();
  });
});

describe("playing state", () => {
  it("calls onExit, setUpLevel, onEnter and resets timer when coming from start", () => {
    handleStateTransition("playing", "start", gameScreen, onResetTimer);
    expect(mockOnExit).toHaveBeenCalledWith("start", gameScreen);
    expect(mockSetUpLevel).toHaveBeenCalledWith(gameScreen);
    expect(mockOnEnter).toHaveBeenCalledWith("playing", gameScreen);
    expect(onResetTimer).toHaveBeenCalled();
  });

  it("calls onExit, onEnter and resets timer when resuming from paused — no setUpLevel", () => {
    handleStateTransition("playing", "paused", gameScreen, onResetTimer);
    expect(mockOnExit).toHaveBeenCalledWith("paused", gameScreen);
    expect(mockOnEnter).toHaveBeenCalledWith("playing", gameScreen);
    expect(onResetTimer).toHaveBeenCalled();
    expect(mockSetUpLevel).not.toHaveBeenCalled();
  });

  it("calls onExit before setUpLevel before onEnter when coming from start", () => {
    const callOrder: string[] = [];
    mockOnExit.mockImplementation(() => callOrder.push("onExit"));
    mockSetUpLevel.mockImplementation(() => callOrder.push("setUpLevel"));
    mockOnEnter.mockImplementation(() => callOrder.push("onEnter"));
    handleStateTransition("playing", "start", gameScreen, onResetTimer);
    expect(callOrder).toEqual(["onExit", "setUpLevel", "onEnter"]);
  });

  it("does nothing when coming from playing", () => {
    handleStateTransition("playing", "playing", gameScreen, onResetTimer);
    expect(mockOnEnter).not.toHaveBeenCalled();
    expect(mockOnExit).not.toHaveBeenCalled();
    expect(mockSetUpLevel).not.toHaveBeenCalled();
    expect(onResetTimer).not.toHaveBeenCalled();
  });
});

describe("paused state", () => {
  it("calls onEnter('paused') when coming from playing", () => {
    handleStateTransition("paused", "playing", gameScreen, onResetTimer);
    expect(mockOnEnter).toHaveBeenCalledWith("paused", gameScreen);
  });

  it("does not reset the timer", () => {
    handleStateTransition("paused", "playing", gameScreen, onResetTimer);
    expect(onResetTimer).not.toHaveBeenCalled();
  });

  it("does nothing when not coming from playing", () => {
    handleStateTransition("paused", "paused", gameScreen, onResetTimer);
    expect(mockOnEnter).not.toHaveBeenCalled();
  });
});

describe("gameover state", () => {
  it("calls onEnter('gameover') when coming from playing", () => {
    handleStateTransition("gameover", "playing", gameScreen, onResetTimer);
    expect(mockOnEnter).toHaveBeenCalledWith("gameover", gameScreen);
  });

  it("does not reset the timer", () => {
    handleStateTransition("gameover", "playing", gameScreen, onResetTimer);
    expect(onResetTimer).not.toHaveBeenCalled();
  });

  it("does nothing when not coming from playing", () => {
    handleStateTransition("gameover", "gameover", gameScreen, onResetTimer);
    expect(mockOnEnter).not.toHaveBeenCalled();
  });
});
