import { describe, it, expect, vi } from "vitest";
import { createButton } from "./button.ts";

function createStartButton(onClick: () => void): HTMLElement {
  return createButton({
    label: "start",
    id: "startButton",
    className: "start-button",
    onClick,
  });
}

describe("createButton", () => {
  it("returns a button element with the correct id", () => {
    const el = createStartButton(vi.fn());
    expect(el.getAttribute("id")).toBe("startButton");
  });

  it("includes the supplied className and the font class", () => {
    const el = createStartButton(vi.fn());
    expect(el.getAttribute("class")).toContain("start-button");
    expect(el.getAttribute("class")).toContain("press-start-2p-regular");
  });

  it("sets the button label text", () => {
    const el = createStartButton(vi.fn());
    expect(el.textContent).toBe("start");
  });

  it("calls onClick when clicked", () => {
    const onClick = vi.fn();
    const el = createStartButton(onClick);
    el.click();
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("fires onClick only once even if clicked multiple times", () => {
    const onClick = vi.fn();
    const el = createStartButton(onClick);
    el.click();
    el.click();
    el.click();
    expect(onClick).toHaveBeenCalledOnce();
  });
});
