import Ship from "./entities/ship.ts";
import Gun from "./entities/gun.ts";
import { shipSpecs, gunSpec } from "./assets/gamedata.js";
import { changeGameState } from "./state/gameState.ts";
import { addShipControlEvents } from "./actions/actions.ts";

export function addNewShip(pos: { x: number; y: number }) {
  const ship = new Ship(pos, "ship", shipSpecs);
  const gun = new Gun(gunSpec);
  ship.attachGun(gun);
  addShipControlEvents();
  changeGameState({ action: "add ship", payload: ship });
}
