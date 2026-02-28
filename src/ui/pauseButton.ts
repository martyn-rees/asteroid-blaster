export function createPauseButton(buttonCallback: Function): HTMLElement {
  // <button id="pause" class="pause-button press-start-2p-regular">pause</button>
  let button = document.createElement("button");
  button.textContent = "pause";
  button.setAttribute("id", "pauseButton");
  button.setAttribute("class", "pause-button press-start-2p-regular");
  button.addEventListener(
    "click",
    function () {
      buttonCallback();
    },
    { once: true },
  );
  return button;
}
