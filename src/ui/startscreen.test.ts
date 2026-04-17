import { describe, it, expect, vi } from "vitest";
import { createStartScreen } from "./startscreen.ts";

describe("createStartScreen", () => {
  it("returns an element with id startScreen", () => {
    const el = createStartScreen(vi.fn());
    expect(el.getAttribute("id")).toBe("startScreen");
  });

  it("renders arrow keys as arrow symbols", () => {
    const el = createStartScreen(vi.fn());
    expect(el.innerHTML).toContain("←");
    expect(el.innerHTML).toContain("→");
    expect(el.innerHTML).toContain("↑");
  });

  it("renders KeyX bindings as the single letter", () => {
    // shoot is bound to KeyS — should display as S not KeyS
    const el = createStartScreen(vi.fn());
    expect(el.innerHTML).toContain(">S<");
    expect(el.innerHTML).not.toContain("KeyS");
  });

  it("includes labels for all four actions", () => {
    const el = createStartScreen(vi.fn());
    expect(el.innerHTML).toContain("rotate");
    expect(el.innerHTML).toContain("thrust");
    expect(el.innerHTML).toContain("shoot");
  });

  it("calls onStart when the start button is clicked", () => {
    const onStart = vi.fn();
    const el = createStartScreen(onStart);
    (el.querySelector("#startButton") as HTMLElement).click();
    expect(onStart).toHaveBeenCalledOnce();
  });

  it("calls onStart only once even if the button is clicked multiple times", () => {
    const onStart = vi.fn();
    const el = createStartScreen(onStart);
    const button = el.querySelector("#startButton") as HTMLElement;
    button.click();
    button.click();
    expect(onStart).toHaveBeenCalledOnce();
  });
});
