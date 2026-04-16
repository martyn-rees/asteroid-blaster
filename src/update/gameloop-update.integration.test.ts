import { describe, it, expect, beforeEach } from "vitest";
import { changeGameState, gameState } from "../state/game-state.ts";
import { processCollisions } from "./gameloop-update.ts";
import Rock, { resetRockIDCounter } from "../entities/rock.ts";
import Bullet, { resetBulletIDCounter } from "../entities/bullet.ts";
import Ship from "../entities/ship.ts";
import { shipSpecs, bulletSpecs } from "../config/game-entity-specs.ts";

// No mocks — real changeGameState, real testCollision, real explodeRock.
// Placing rock and bullet at the same coordinates guarantees a collision
// (distance = 0, always less than the sum of any two radii).

const CENTRE = { x: 400, y: 200 };
const AWAY = { x: 0, y: 0 };

function makeShip(pos = AWAY) {
  return new Ship(pos, "ship", shipSpecs);
}

function makeLargeRock(pos = CENTRE) {
  return new Rock({
    initialPosition: pos,
    initialVelocity: { speed: 0, direction: 0 },
    size: "large",
    r: 60,
    rotationRate: 0,
  });
}

function makeMediumRock(pos = CENTRE) {
  return new Rock({
    initialPosition: pos,
    initialVelocity: { speed: 0, direction: 0 },
    size: "medium",
    r: 30,
    rotationRate: 0,
  });
}

function makeSmallRock(pos = CENTRE) {
  return new Rock({
    initialPosition: pos,
    initialVelocity: { speed: 0, direction: 0 },
    size: "small",
    r: 12,
    rotationRate: 0,
  });
}

function makeBullet(pos = CENTRE) {
  return new Bullet({
    initialPosition: pos,
    velocity: { speed: 0, direction: 0 },
    bulletSpecs,
  });
}

describe("processCollisions — integration", () => {
  beforeEach(() => {
    changeGameState({ action: "reset game" });
    resetRockIDCounter();
    resetBulletIDCounter();
  });

  describe("bullet hits large rock", () => {
    it("removes the rock and the bullet", () => {
      const rock = makeLargeRock();
      const bullet = makeBullet();
      const ship = makeShip();
      changeGameState({ action: "add ship", payload: ship });
      changeGameState({ action: "add rock", payload: rock });
      changeGameState({ action: "add bullet", payload: bullet });

      processCollisions(ship, { ...gameState.rocks }, () => gameState);

      expect(gameState.rocks).not.toHaveProperty(rock.id);
      expect(gameState.bullets).not.toHaveProperty(bullet.id);
    });

    it("adds the correct score", () => {
      const rock = makeLargeRock();
      const bullet = makeBullet();
      const ship = makeShip();
      changeGameState({ action: "add ship", payload: ship });
      changeGameState({ action: "add rock", payload: rock });
      changeGameState({ action: "add bullet", payload: bullet });

      processCollisions(ship, { ...gameState.rocks }, () => gameState);

      expect(gameState.score).toBe(100); // large rock value from game-entity-specs
    });

    it("spawns 2 medium rocks at the explosion site (level 1 largeRockExplosions = 2)", () => {
      const rock = makeLargeRock();
      const bullet = makeBullet();
      const ship = makeShip();
      changeGameState({ action: "add ship", payload: ship });
      changeGameState({ action: "add rock", payload: rock });
      changeGameState({ action: "add bullet", payload: bullet });

      processCollisions(ship, { ...gameState.rocks }, () => gameState);

      const mediumRocks = Object.values(gameState.rocks).filter(
        (r) => r.size === "medium",
      );
      expect(mediumRocks).toHaveLength(2);
      mediumRocks.forEach((r) => expect(r.position).toEqual(CENTRE));
    });
  });

  describe("bullet hits medium rock", () => {
    it("removes the rock and bullet and adds the correct score", () => {
      const rock = makeMediumRock();
      const bullet = makeBullet();
      const ship = makeShip();
      changeGameState({ action: "add ship", payload: ship });
      changeGameState({ action: "add rock", payload: rock });
      changeGameState({ action: "add bullet", payload: bullet });

      processCollisions(ship, { ...gameState.rocks }, () => gameState);

      expect(gameState.rocks).not.toHaveProperty(rock.id);
      expect(gameState.bullets).not.toHaveProperty(bullet.id);
      expect(gameState.score).toBe(200); // medium rock value
    });

    it("spawns no child rocks at level 1 (mediumRockExplosions = 0)", () => {
      const rock = makeMediumRock();
      const bullet = makeBullet();
      const ship = makeShip();
      changeGameState({ action: "add ship", payload: ship });
      changeGameState({ action: "add rock", payload: rock });
      changeGameState({ action: "add bullet", payload: bullet });

      processCollisions(ship, { ...gameState.rocks }, () => gameState);

      expect(Object.keys(gameState.rocks)).toHaveLength(0);
    });
  });

  describe("bullet hits small rock", () => {
    it("removes the rock and bullet, adds the correct score, spawns no child rocks", () => {
      const rock = makeSmallRock();
      const bullet = makeBullet();
      const ship = makeShip();
      changeGameState({ action: "add ship", payload: ship });
      changeGameState({ action: "add rock", payload: rock });
      changeGameState({ action: "add bullet", payload: bullet });

      processCollisions(ship, { ...gameState.rocks }, () => gameState);

      expect(Object.keys(gameState.rocks)).toHaveLength(0);
      expect(gameState.score).toBe(300); // small rock value
    });
  });

  describe("snapshot behaviour", () => {
    it("one bullet can only destroy one rock per frame", () => {
      // Two rocks at the same position — bullet should only consume one
      const rock1 = makeLargeRock(CENTRE);
      const rock2 = makeLargeRock(CENTRE);
      const bullet = makeBullet(CENTRE);
      const ship = makeShip();
      changeGameState({ action: "add ship", payload: ship });
      changeGameState({ action: "add rock", payload: rock1 });
      changeGameState({ action: "add rock", payload: rock2 });
      changeGameState({ action: "add bullet", payload: bullet });

      processCollisions(ship, { ...gameState.rocks }, () => gameState);

      const largeRocksRemaining = Object.values(gameState.rocks).filter(
        (r) => r.size === "large",
      );
      expect(largeRocksRemaining).toHaveLength(1);
    });
  });
});
