import { describe, it, expect, vi } from "vitest";
import { createEndScreen } from "./endscreen.ts";

describe("createEndScreen", () => {
  it("returns an element with id endScreen", () => {
    const el = createEndScreen(0, 0, vi.fn());
    expect(el.getAttribute("id")).toBe("endScreen");
  });

  it("displays the current score", () => {
    const el = createEndScreen(450, 0, vi.fn());
    expect(el.innerHTML).toContain("450");
  });

  it("displays the hi-score", () => {
    const el = createEndScreen(0, 1200, vi.fn());
    expect(el.innerHTML).toContain("1200");
  });

  it("displays both score and hi-score when they differ", () => {
    const el = createEndScreen(300, 900, vi.fn());
    expect(el.innerHTML).toContain("300");
    expect(el.innerHTML).toContain("900");
  });

  it("calls onRestart when the restart button is clicked", () => {
    const onRestart = vi.fn();
    const el = createEndScreen(0, 0, onRestart);
    (el.querySelector("#restartButton") as HTMLElement).click();
    expect(onRestart).toHaveBeenCalledOnce();
  });

  it("calls onRestart only once even if the button is clicked multiple times", () => {
    const onRestart = vi.fn();
    const el = createEndScreen(0, 0, onRestart);
    const button = el.querySelector("#restartButton") as HTMLElement;
    button.click();
    button.click();
    expect(onRestart).toHaveBeenCalledOnce();
  });
});
