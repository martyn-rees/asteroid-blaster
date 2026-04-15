import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { hideCursor, showCursor } from "./cursor-events.ts";

describe("cursor-events", () => {
  const screenId = "gameScreen";

  beforeEach(() => {
    vi.useFakeTimers();
    const screen = document.createElement("div");
    screen.id = screenId;
    document.body.appendChild(screen);
  });

  afterEach(() => {
    // reset module-level state before tearing down the DOM
    showCursor(screenId);
    vi.useRealTimers();
    document.body.innerHTML = "";
  });

  describe("hideCursor", () => {
    it("sets cursor to none immediately", () => {
      hideCursor(screenId);
      expect(document.getElementById(screenId)!.style.cursor).toBe("none");
    });

    it("does nothing if the element does not exist", () => {
      expect(() => hideCursor("nonexistent")).not.toThrow();
    });

    it("attaches a mousemove handler after a 100ms delay", () => {
      const el = document.getElementById(screenId)!;
      const addEventSpy = vi.spyOn(el, "addEventListener");
      hideCursor(screenId);
      expect(addEventSpy).not.toHaveBeenCalled();
      vi.advanceTimersByTime(100);
      expect(addEventSpy).toHaveBeenCalledWith("mousemove", expect.any(Function));
    });
  });

  describe("showCursor", () => {
    it("sets cursor to default", () => {
      hideCursor(screenId);
      showCursor(screenId);
      expect(document.getElementById(screenId)!.style.cursor).toBe("default");
    });

    it("is safe to call before hideCursor", () => {
      expect(() => showCursor(screenId)).not.toThrow();
    });

    it("does nothing if the element does not exist", () => {
      expect(() => showCursor("nonexistent")).not.toThrow();
    });
  });

  describe("mousemove behaviour", () => {
    it("restores cursor to default on mousemove", () => {
      const el = document.getElementById(screenId)!;
      hideCursor(screenId);
      vi.advanceTimersByTime(100);
      el.dispatchEvent(new MouseEvent("mousemove"));
      expect(el.style.cursor).toBe("default");
    });

    it("re-hides cursor 2 seconds after mousemove", () => {
      const el = document.getElementById(screenId)!;
      hideCursor(screenId);
      vi.advanceTimersByTime(100);
      el.dispatchEvent(new MouseEvent("mousemove"));
      vi.advanceTimersByTime(2000);
      expect(el.style.cursor).toBe("none");
    });

    it("does not re-hide cursor before 2 seconds have elapsed", () => {
      const el = document.getElementById(screenId)!;
      hideCursor(screenId);
      vi.advanceTimersByTime(100);
      el.dispatchEvent(new MouseEvent("mousemove"));
      vi.advanceTimersByTime(1999);
      expect(el.style.cursor).toBe("default");
    });

    it("showCursor removes the mousemove handler", () => {
      const el = document.getElementById(screenId)!;
      hideCursor(screenId);
      vi.advanceTimersByTime(100);
      showCursor(screenId);
      el.dispatchEvent(new MouseEvent("mousemove"));
      // cursor stays default — handler was removed
      expect(el.style.cursor).toBe("default");
    });

    it("showCursor cancels the re-hide timer set by mousemove", () => {
      const el = document.getElementById(screenId)!;
      hideCursor(screenId);
      vi.advanceTimersByTime(100);
      el.dispatchEvent(new MouseEvent("mousemove"));
      showCursor(screenId);
      vi.advanceTimersByTime(2000);
      // timer was cancelled — cursor stays default
      expect(el.style.cursor).toBe("default");
    });
  });
});
