import { keyBindings } from "../assets/gamedata.ts";

export type ShipActions = {
  thrust: boolean;
  rotateCounterClockwise: boolean;
  rotateClockwise: boolean;
  shoot: boolean;
};

let shipActions: ShipActions = {
  thrust: false,
  shoot: false,
  rotateClockwise: false,
  rotateCounterClockwise: false,
};

function resetShipActions() {
  shipActions = {
    thrust: false,
    shoot: false,
    rotateClockwise: false,
    rotateCounterClockwise: false,
  };
}

function shipControlKeyEvent(ev: KeyboardEvent, isKeyDown: boolean) {
  const key = ev.code;
  if (key === keyBindings.rotateLeft) {
    shipActions.rotateCounterClockwise = isKeyDown;
  }
  if (key === keyBindings.rotateRight) {
    shipActions.rotateClockwise = isKeyDown;
  }
  if (key === keyBindings.thrust) {
    shipActions.thrust = isKeyDown;
  }
  if (key === keyBindings.shoot) {
    shipActions.shoot = isKeyDown;
  }
}

function shipControlKeyEventDown(ev: KeyboardEvent) {
  shipControlKeyEvent(ev, true);
}

function shipControlKeyEventUp(ev: KeyboardEvent) {
  shipControlKeyEvent(ev, false);
}

export function addShipControlEvents() {
  window.addEventListener("keydown", shipControlKeyEventDown);
  window.addEventListener("keyup", shipControlKeyEventUp);
}

export function removeShipControlEvents() {
  window.removeEventListener("keydown", shipControlKeyEventDown);
  window.removeEventListener("keyup", shipControlKeyEventUp);
  resetShipActions();
}

export function getShipActions(): ShipActions {
  return shipActions;
}
