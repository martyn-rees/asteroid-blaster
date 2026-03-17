export function createButton({
  label,
  id,
  className,
  buttonCallback,
}: {
  label: string;
  id: string;
  className: string;
  buttonCallback: Function;
}): HTMLElement {
  // eg. <button id="startButton" class="start-button press-start-2p-regular">start</button>
  let button = document.createElement("button");
  button.textContent = label;
  button.setAttribute("id", id);
  button.setAttribute("class", `${className} press-start-2p-regular`);
  button.addEventListener(
    "click",
    function () {
      buttonCallback();
    },
    { once: true },
  );
  return button;
}
