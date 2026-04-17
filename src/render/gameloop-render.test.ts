import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { gameLoopRender, resetRenderer } from "./gameloop-render.ts";
import Ship from "../entities/ship.ts";
import Rock, { resetRockIDCounter } from "../entities/rock.ts";
import Bullet, { resetBulletIDCounter } from "../entities/bullet.ts";
import type { GameState } from "../state/game-state.ts";
import { shipSpecs, bulletSpecs } from "../config/game-entity-specs.ts";
import { renderConfig } from "../config/config.ts";

// playSound uses new Audio() which is unavailable in happy-dom.
// displayScore and resetFPS are side effects irrelevant to DOM diff logic.
const mockPlaySound = vi.hoisted(() => vi.fn());
const mockDisplayScore = vi.hoisted(() => vi.fn());
const mockResetFPS = vi.hoisted(() => vi.fn());

vi.mock("./sound-render.ts", () => ({ playSound: mockPlaySound }));
vi.mock("./score-render.ts", () => ({
  displayScore: mockDisplayScore,
  displayHiScore: vi.fn(),
}));
vi.mock("./fps.ts", () => ({ resetFPS: mockResetFPS, resumeFPS: vi.fn() }));

const SCREEN_ID = "gameScreen";

function makeGameState(overrides: Partial<GameState> = {}): GameState {
  return {
    state: "playing",
    previousState: "",
    score: 0,
    hiScore: 0,
    level: 1,
    levelStartPending: false,
    ship: undefined,
    rocks: {},
    bullets: {},
    ...overrides,
  };
}

function makeShip(pos = { x: 100, y: 100 }): Ship {
  return new Ship(pos, "ship", shipSpecs);
}

function makeRock(): Rock {
  return new Rock({
    initialPosition: { x: 200, y: 200 },
    initialVelocity: { speed: 0, direction: 0 },
    size: "large",
    r: 60,
    rotationRate: 0,
  });
}

function makeBullet(): Bullet {
  return new Bullet({
    initialPosition: { x: 300, y: 300 },
    velocity: { speed: 0, direction: 0 },
    bulletSpecs,
  });
}

describe("gameloop-render", () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="${SCREEN_ID}"></div>
      <div id="thrust"></div>
    `;
    renderConfig.frameSkip = 1;
    vi.clearAllMocks();
    resetRockIDCounter();
    resetBulletIDCounter();
  });

  afterEach(() => {
    resetRenderer();
    renderConfig.frameSkip = 2; // restore to config default
    document.body.innerHTML = "";
  });

  describe("gameLoopRender", () => {
    describe("ships", () => {
      it("adds a ship element when the ship is active", () => {
        const ship = makeShip();
        gameLoopRender(makeGameState({ ship }), SCREEN_ID);
        expect(document.getElementById(ship.id)).not.toBeNull();
      });

      it("does not add a ship element when there is no ship in state", () => {
        gameLoopRender(makeGameState(), SCREEN_ID);
        expect(document.querySelectorAll(".ship")).toHaveLength(0);
      });

      it("does not add a duplicate ship element on subsequent frames", () => {
        const ship = makeShip();
        const state = makeGameState({ ship });
        gameLoopRender(state, SCREEN_ID);
        gameLoopRender(state, SCREEN_ID);
        expect(document.querySelectorAll(".ship")).toHaveLength(1);
      });

      it("updates ship position on subsequent frames", () => {
        const ship = makeShip({ x: 100, y: 100 });
        gameLoopRender(makeGameState({ ship }), SCREEN_ID);

        ship.position = { x: 200, y: 150 };
        gameLoopRender(makeGameState({ ship }), SCREEN_ID);

        const el = document.getElementById(ship.id)!;
        expect(el.style.left).toBe("200px");
        expect(el.style.top).toBe("150px");
      });

      it("adds a shipExplosion element when the ship transitions to exploding", () => {
        const ship = makeShip();
        gameLoopRender(makeGameState({ ship }), SCREEN_ID);

        ship.state = "exploding";
        gameLoopRender(makeGameState({ ship }), SCREEN_ID);

        expect(document.getElementById("shipExplosion")).not.toBeNull();
      });

      it("removes the ship element when the ship transitions to exploding", () => {
        const ship = makeShip();
        gameLoopRender(makeGameState({ ship }), SCREEN_ID);

        ship.state = "exploding";
        gameLoopRender(makeGameState({ ship }), SCREEN_ID);

        expect(document.getElementById(ship.id)).toBeNull();
      });

      it("removes the shipExplosion element when the ship reaches destroyed", () => {
        const ship = makeShip();
        gameLoopRender(makeGameState({ ship }), SCREEN_ID);
        ship.state = "exploding";
        gameLoopRender(makeGameState({ ship }), SCREEN_ID);
        ship.state = "destroyed";
        gameLoopRender(makeGameState({ ship }), SCREEN_ID);

        expect(document.getElementById("shipExplosion")).toBeNull();
      });
    });

    describe("rocks", () => {
      it("adds a rock element when a new rock appears in state", () => {
        const rock = makeRock();
        gameLoopRender(makeGameState({ rocks: { [rock.id]: rock } }), SCREEN_ID);
        expect(document.getElementById(rock.id)).not.toBeNull();
      });

      it("does not add a duplicate rock element on subsequent frames", () => {
        const rock = makeRock();
        const rocks = { [rock.id]: rock };
        gameLoopRender(makeGameState({ rocks }), SCREEN_ID);
        gameLoopRender(makeGameState({ rocks }), SCREEN_ID);
        expect(document.querySelectorAll(".rock")).toHaveLength(1);
      });

      it("removes a rock element when the rock is no longer in state", () => {
        const rock = makeRock();
        gameLoopRender(makeGameState({ rocks: { [rock.id]: rock } }), SCREEN_ID);
        gameLoopRender(makeGameState({ rocks: {} }), SCREEN_ID);
        expect(document.getElementById(rock.id)).toBeNull();
      });

      it("plays rock-explosion sound when a rock is removed", () => {
        const rock = makeRock();
        gameLoopRender(makeGameState({ rocks: { [rock.id]: rock } }), SCREEN_ID);
        gameLoopRender(makeGameState({ rocks: {} }), SCREEN_ID);
        expect(mockPlaySound).toHaveBeenCalledWith("rock-explosion");
      });

      it("does not play rock-explosion sound when a rock is added", () => {
        const rock = makeRock();
        gameLoopRender(makeGameState({ rocks: { [rock.id]: rock } }), SCREEN_ID);
        expect(mockPlaySound).not.toHaveBeenCalledWith("rock-explosion");
      });

      it("updates rock position on subsequent frames", () => {
        const rock = makeRock();
        const rocks = { [rock.id]: rock };
        gameLoopRender(makeGameState({ rocks }), SCREEN_ID);

        rock.position = { x: 400, y: 350 };
        gameLoopRender(makeGameState({ rocks }), SCREEN_ID);

        const el = document.getElementById(rock.id)!;
        expect(el.style.left).toBe("400px");
        expect(el.style.top).toBe("350px");
      });
    });

    describe("bullets", () => {
      it("adds a bullet element when a new bullet appears in state", () => {
        const bullet = makeBullet();
        gameLoopRender(
          makeGameState({ bullets: { [bullet.id]: bullet } }),
          SCREEN_ID,
        );
        expect(document.getElementById(bullet.id)).not.toBeNull();
      });

      it("plays shoot sound when a bullet is added", () => {
        const bullet = makeBullet();
        gameLoopRender(
          makeGameState({ bullets: { [bullet.id]: bullet } }),
          SCREEN_ID,
        );
        expect(mockPlaySound).toHaveBeenCalledWith("shoot");
      });

      it("removes a bullet element when the bullet is no longer in state", () => {
        const bullet = makeBullet();
        gameLoopRender(
          makeGameState({ bullets: { [bullet.id]: bullet } }),
          SCREEN_ID,
        );
        gameLoopRender(makeGameState({ bullets: {} }), SCREEN_ID);
        expect(document.getElementById(bullet.id)).toBeNull();
      });

      it("does not add a duplicate bullet element on subsequent frames", () => {
        const bullet = makeBullet();
        const bullets = { [bullet.id]: bullet };
        gameLoopRender(makeGameState({ bullets }), SCREEN_ID);
        gameLoopRender(makeGameState({ bullets }), SCREEN_ID);
        expect(document.querySelectorAll(".bullet")).toHaveLength(1);
      });
    });

    describe("score", () => {
      it("calls displayScore when the score changes", () => {
        gameLoopRender(makeGameState({ score: 0 }), SCREEN_ID);
        gameLoopRender(makeGameState({ score: 100 }), SCREEN_ID);
        expect(mockDisplayScore).toHaveBeenCalledWith(100);
      });

      it("does not call displayScore when the score is unchanged", () => {
        gameLoopRender(makeGameState({ score: 100 }), SCREEN_ID);
        vi.clearAllMocks();
        gameLoopRender(makeGameState({ score: 100 }), SCREEN_ID);
        expect(mockDisplayScore).not.toHaveBeenCalled();
      });
    });

    describe("frame skip", () => {
      it("returns true when the frame is rendered", () => {
        renderConfig.frameSkip = 1;
        expect(gameLoopRender(makeGameState(), SCREEN_ID)).toBe(true);
      });

      it("returns false and skips DOM updates on the skipped frame", () => {
        renderConfig.frameSkip = 2;
        const rock = makeRock();
        const skipped = gameLoopRender(
          makeGameState({ rocks: { [rock.id]: rock } }),
          SCREEN_ID,
        );
        expect(skipped).toBe(false);
        expect(document.getElementById(rock.id)).toBeNull();
      });

      it("renders on the frame after a skip", () => {
        renderConfig.frameSkip = 2;
        const rock = makeRock();
        const rocks = { [rock.id]: rock };
        gameLoopRender(makeGameState({ rocks }), SCREEN_ID); // skipped
        const rendered = gameLoopRender(makeGameState({ rocks }), SCREEN_ID);
        expect(rendered).toBe(true);
        expect(document.getElementById(rock.id)).not.toBeNull();
      });
    });
  });

  describe("resetRenderer", () => {
    it("removes all tracked ship elements from the DOM", () => {
      const ship = makeShip();
      gameLoopRender(makeGameState({ ship }), SCREEN_ID);
      resetRenderer();
      expect(document.getElementById(ship.id)).toBeNull();
    });

    it("removes all tracked rock elements from the DOM", () => {
      const rock = makeRock();
      gameLoopRender(makeGameState({ rocks: { [rock.id]: rock } }), SCREEN_ID);
      resetRenderer();
      expect(document.getElementById(rock.id)).toBeNull();
    });

    it("removes all tracked bullet elements from the DOM", () => {
      const bullet = makeBullet();
      gameLoopRender(
        makeGameState({ bullets: { [bullet.id]: bullet } }),
        SCREEN_ID,
      );
      resetRenderer();
      expect(document.getElementById(bullet.id)).toBeNull();
    });

    it("clears previousRender so entities are re-added as new on the next render", () => {
      const rock = makeRock();
      const rocks = { [rock.id]: rock };
      gameLoopRender(makeGameState({ rocks }), SCREEN_ID);
      resetRenderer();

      // Rebuild the screen after resetRenderer removed it
      document.body.innerHTML = `<div id="${SCREEN_ID}"></div><div id="thrust"></div>`;
      gameLoopRender(makeGameState({ rocks }), SCREEN_ID);

      expect(document.getElementById(rock.id)).not.toBeNull();
    });

    it("resets the frame skip counter so the next render is not skipped", () => {
      renderConfig.frameSkip = 2;
      gameLoopRender(makeGameState(), SCREEN_ID); // advances counter to 1
      resetRenderer(); // should reset counter to 0

      const rock = makeRock();
      // If counter were still at 1 this frame would render (counter 1 → 2 → reset).
      // If counter was reset to 0, this frame should skip (counter 0 → 1 → skip).
      const result = gameLoopRender(
        makeGameState({ rocks: { [rock.id]: rock } }),
        SCREEN_ID,
      );
      expect(result).toBe(false); // skipped — counter started fresh from 0
    });

    it("calls resetFPS", () => {
      resetRenderer();
      expect(mockResetFPS).toHaveBeenCalled();
    });
  });
});
