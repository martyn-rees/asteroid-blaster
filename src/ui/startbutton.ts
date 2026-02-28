export function createStartButton(buttonCallback: Function): HTMLElement {
  //<button id="startButton" class="start-button press-start-2p-regular">start</button>
  let button = document.createElement("button");
  button.textContent = "start";
  button.setAttribute("id", "startButton");
  button.setAttribute("class", "start-button press-start-2p-regular");
  button.addEventListener(
    "click",
    function () {
      buttonCallback();
    },
    { once: true },
  );
  return button;
}
