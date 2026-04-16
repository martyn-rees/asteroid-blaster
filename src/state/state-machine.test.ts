import { vi, describe, it, expect, beforeEach } from "vitest";
import { handleStateTransition } from "./state-machine.ts";
import Viewport from "../entities/viewport.ts";

const mockOnEnter = vi.hoisted(() => vi.fn());
const mockOnExit = vi.hoisted(() => vi.fn());
const mockSetUpLevel = vi.hoisted(() => vi.fn());

vi.mock("../events/events.ts", () => ({
  onEnter: mockOnEnter,
  onExit: mockOnExit,
  setUpLevel: mockSetUpLevel,
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

  it("calls onExit('gameover') then onEnter('start') when coming from gameover", () => {
    const callOrder: string[] = [];
    mockOnExit.mockImplementation(() => callOrder.push("onExit"));
    mockOnEnter.mockImplementation(() => callOrder.push("onEnter"));
    handleStateTransition("start", "gameover", gameScreen, onResetTimer);
    expect(mockOnExit).toHaveBeenCalledWith("gameover", gameScreen);
    expect(mockOnEnter).toHaveBeenCalledWith("start", gameScreen);
    expect(callOrder).toEqual(["onExit", "onEnter"]);
  });

  it("does not call onExit when entering from empty state", () => {
    handleStateTransition("start", "", gameScreen, onResetTimer);
    expect(mockOnExit).not.toHaveBeenCalled();
  });

  it("does nothing when already in start state", () => {
    handleStateTransition("start", "start", gameScreen, onResetTimer);
    expect(mockOnEnter).not.toHaveBeenCalled();
    expect(mockOnExit).not.toHaveBeenCalled();
  });

  it("does not reset the timer", () => {
    handleStateTransition("start", "", gameScreen, onResetTimer);
    expect(onResetTimer).not.toHaveBeenCalled();
  });
});

describe("playing state", () => {
  it("calls onExit, setUpLevel, onEnter and resets timer when coming from start", () => {
    const callOrder: string[] = [];
    mockOnExit.mockImplementation(() => callOrder.push("onExit"));
    mockSetUpLevel.mockImplementation(() => callOrder.push("setUpLevel"));
    mockOnEnter.mockImplementation(() => callOrder.push("onEnter"));
    handleStateTransition("playing", "start", gameScreen, onResetTimer);
    expect(mockOnExit).toHaveBeenCalledWith("start", gameScreen);
    expect(mockSetUpLevel).toHaveBeenCalledWith(gameScreen);
    expect(mockOnEnter).toHaveBeenCalledWith("playing", gameScreen);
    expect(onResetTimer).toHaveBeenCalled();
    expect(callOrder).toEqual(["onExit", "setUpLevel", "onEnter"]);
  });

  it("calls onExit, onEnter and resets timer when resuming from paused — no setUpLevel", () => {
    handleStateTransition("playing", "paused", gameScreen, onResetTimer);
    expect(mockOnExit).toHaveBeenCalledWith("paused", gameScreen);
    expect(mockOnEnter).toHaveBeenCalledWith("playing", gameScreen);
    expect(onResetTimer).toHaveBeenCalled();
    expect(mockSetUpLevel).not.toHaveBeenCalled();
  });

  it("calls onExit before onEnter when resuming from paused", () => {
    const callOrder: string[] = [];
    mockOnExit.mockImplementation(() => callOrder.push("onExit"));
    mockOnEnter.mockImplementation(() => callOrder.push("onEnter"));
    handleStateTransition("playing", "paused", gameScreen, onResetTimer);
    expect(callOrder).toEqual(["onExit", "onEnter"]);
  });

  it("does nothing when already in playing state", () => {
    handleStateTransition("playing", "playing", gameScreen, onResetTimer);
    expect(mockOnEnter).not.toHaveBeenCalled();
    expect(mockOnExit).not.toHaveBeenCalled();
    expect(mockSetUpLevel).not.toHaveBeenCalled();
    expect(onResetTimer).not.toHaveBeenCalled();
  });
});

describe("paused state", () => {
  it("calls onExit('playing') then onEnter('paused') when coming from playing", () => {
    const callOrder: string[] = [];
    mockOnExit.mockImplementation(() => callOrder.push("onExit"));
    mockOnEnter.mockImplementation(() => callOrder.push("onEnter"));
    handleStateTransition("paused", "playing", gameScreen, onResetTimer);
    expect(mockOnExit).toHaveBeenCalledWith("playing", gameScreen);
    expect(mockOnEnter).toHaveBeenCalledWith("paused", gameScreen);
    expect(callOrder).toEqual(["onExit", "onEnter"]);
  });

  it("does not reset the timer", () => {
    handleStateTransition("paused", "playing", gameScreen, onResetTimer);
    expect(onResetTimer).not.toHaveBeenCalled();
  });

  it("does nothing when already in paused state", () => {
    handleStateTransition("paused", "paused", gameScreen, onResetTimer);
    expect(mockOnEnter).not.toHaveBeenCalled();
    expect(mockOnExit).not.toHaveBeenCalled();
  });
});

describe("gameover state", () => {
  it("calls onExit('playing') then onEnter('gameover') when coming from playing", () => {
    const callOrder: string[] = [];
    mockOnExit.mockImplementation(() => callOrder.push("onExit"));
    mockOnEnter.mockImplementation(() => callOrder.push("onEnter"));
    handleStateTransition("gameover", "playing", gameScreen, onResetTimer);
    expect(mockOnExit).toHaveBeenCalledWith("playing", gameScreen);
    expect(mockOnEnter).toHaveBeenCalledWith("gameover", gameScreen);
    expect(callOrder).toEqual(["onExit", "onEnter"]);
  });

  it("does not reset the timer", () => {
    handleStateTransition("gameover", "playing", gameScreen, onResetTimer);
    expect(onResetTimer).not.toHaveBeenCalled();
  });

  it("does nothing when already in gameover state", () => {
    handleStateTransition("gameover", "gameover", gameScreen, onResetTimer);
    expect(mockOnEnter).not.toHaveBeenCalled();
    expect(mockOnExit).not.toHaveBeenCalled();
  });
});
