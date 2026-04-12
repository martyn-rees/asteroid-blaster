import Ship from "./ship.ts";
import Gun from "./gun.ts";
import { shipSpecs, gunSpec } from "../assets/gamedata.ts";
import { changeGameState } from "../state/game-state.ts";

export function addNewShip(pos: { x: number; y: number }) {
  const ship = new Ship(pos, "ship", shipSpecs);
  const gun = new Gun(gunSpec);
  ship.attachGun(gun);
  changeGameState({ action: "add ship", payload: ship });
}
