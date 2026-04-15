import Ship from "./ship.ts";
import Gun from "./gun.ts";
import { shipSpecs, gunSpec } from "../assets/game-entity-specs.ts";
import { changeGameState } from "../state/game-state.ts";
import { addShipControlEvents } from "../input/ship-actions.ts";

export function addNewShip(pos: { x: number; y: number }) {
  const ship = new Ship(pos, "ship", shipSpecs);
  const gun = new Gun(gunSpec);
  ship.attachGun(gun);
  changeGameState({ action: "add ship", payload: ship });
  addShipControlEvents();
}
