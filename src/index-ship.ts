import Ship from "./modules/ship.ts";
import Gun from "./modules/gun.ts";
import { shipSpecs, gunSpec } from "./gamedata.js";
import { changeGameState } from "./state/gameState.ts";
import { addShipControlEvents } from "./actions/actions.ts";

export function addNewShip(pos: { x: number; y: number }) {
  const ship = new Ship(pos, "ship", shipSpecs);
  const gun = new Gun(gunSpec);
  ship.attachGun(gun);
  addShipControlEvents();
  changeGameState({ action: "add ship", gameElement: ship });
}
