import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  addShipControlEvents,
  removeShipControlEvents,
  getShipActions,
} from "./ship-actions.ts";

function keyDown(code: string) {
  window.dispatchEvent(new KeyboardEvent("keydown", { code }));
}

function keyUp(code: string) {
  window.dispatchEvent(new KeyboardEvent("keyup", { code }));
}

describe("ship-actions", () => {
  beforeEach(() => {
    addShipControlEvents();
  });

  afterEach(() => {
    // resets module-level shipActions and detaches listeners
    removeShipControlEvents();
  });

  describe("getShipActions", () => {
    it("returns all actions as false before any key is pressed", () => {
      expect(getShipActions()).toEqual({
        thrust: false,
        shoot: false,
        rotateClockwise: false,
        rotateCounterClockwise: false,
      });
    });
  });

  describe("keydown events", () => {
    it("sets rotateCounterClockwise on ArrowLeft", () => {
      keyDown("ArrowLeft");
      expect(getShipActions().rotateCounterClockwise).toBe(true);
    });

    it("sets rotateClockwise on ArrowRight", () => {
      keyDown("ArrowRight");
      expect(getShipActions().rotateClockwise).toBe(true);
    });

    it("sets thrust on ArrowUp", () => {
      keyDown("ArrowUp");
      expect(getShipActions().thrust).toBe(true);
    });

    it("sets shoot on KeyS", () => {
      keyDown("KeyS");
      expect(getShipActions().shoot).toBe(true);
    });

    it("ignores unbound keys", () => {
      keyDown("KeyZ");
      expect(getShipActions()).toEqual({
        thrust: false,
        shoot: false,
        rotateClockwise: false,
        rotateCounterClockwise: false,
      });
    });
  });

  describe("keyup events", () => {
    it("clears rotateCounterClockwise on ArrowLeft release", () => {
      keyDown("ArrowLeft");
      keyUp("ArrowLeft");
      expect(getShipActions().rotateCounterClockwise).toBe(false);
    });

    it("clears rotateClockwise on ArrowRight release", () => {
      keyDown("ArrowRight");
      keyUp("ArrowRight");
      expect(getShipActions().rotateClockwise).toBe(false);
    });

    it("clears thrust on ArrowUp release", () => {
      keyDown("ArrowUp");
      keyUp("ArrowUp");
      expect(getShipActions().thrust).toBe(false);
    });

    it("clears shoot on KeyS release", () => {
      keyDown("KeyS");
      keyUp("KeyS");
      expect(getShipActions().shoot).toBe(false);
    });
  });

  describe("simultaneous keys", () => {
    it("tracks multiple keys held at the same time", () => {
      keyDown("ArrowLeft");
      keyDown("ArrowUp");
      expect(getShipActions()).toMatchObject({
        rotateCounterClockwise: true,
        thrust: true,
      });
    });

    it("releasing one key does not clear the others", () => {
      keyDown("ArrowLeft");
      keyDown("ArrowUp");
      keyUp("ArrowLeft");
      expect(getShipActions().rotateCounterClockwise).toBe(false);
      expect(getShipActions().thrust).toBe(true);
    });
  });

  describe("removeShipControlEvents", () => {
    it("resets all actions to false", () => {
      keyDown("ArrowUp");
      keyDown("KeyS");
      removeShipControlEvents();
      expect(getShipActions()).toEqual({
        thrust: false,
        shoot: false,
        rotateClockwise: false,
        rotateCounterClockwise: false,
      });
    });

    it("detaches listeners so further key events have no effect", () => {
      removeShipControlEvents();
      keyDown("ArrowUp");
      expect(getShipActions().thrust).toBe(false);
    });
  });
});
