import Ship from "./modules/ship.ts";
import Gun from "./modules/gun.ts";
import { shipSpecs, gunSpec } from "./gamedata.js";
import { changeGameState } from "./gameState.ts";

function initShip(pos: { x: number; y: number }): Ship {
  const ship = new Ship(pos, "ship", shipSpecs);
  const gun = new Gun(gunSpec);
  ship.attachGun(gun);
  return ship;
}

export function addNewShip(pos: { x: number; y: number }) {
  const ship: Ship = initShip(pos);
  changeGameState({ action: "add ship", gameElement: ship });
}
