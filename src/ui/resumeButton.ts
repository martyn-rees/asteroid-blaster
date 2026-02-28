export function createResumeButton(buttonCallback: Function): HTMLElement {
  // <button id="resumeButton" class="pause-button press-start-2p-regular">resume</button>
  let button = document.createElement("button");
  button.textContent = "resume";
  button.setAttribute("id", "resumeButton");
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
