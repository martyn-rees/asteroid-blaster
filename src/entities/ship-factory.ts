import Ship from "./ship.ts";
import Gun from "./gun.ts";
import { shipSpecs, gunSpecs } from "../config/game-entity-specs.ts";
import { changeGameState } from "../state/game-state.ts";
import { addShipControlEvents } from "../input/ship-actions.ts";

export function addNewShip(pos: { x: number; y: number }) {
  const ship = new Ship(pos, "ship", shipSpecs);
  const gunSpec = gunSpecs.single; // for now just use the first gun spec, but this could be extended to allow different ships with different guns
  const guns = gunSpec.map((spec) => new Gun(spec));
  ship.attachGuns(guns);
  changeGameState({ action: "add ship", payload: ship });
  addShipControlEvents();
}
