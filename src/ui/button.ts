export function createButton({
  label,
  id,
  className,
  onClick,
}: {
  label: string;
  id: string;
  className: string;
  onClick: () => void;
}): HTMLElement {
  // eg. <button id="startButton" class="start-button press-start-2p-regular">start</button>
  let button = document.createElement("button");
  button.textContent = label;
  button.setAttribute("id", id);
  button.setAttribute("class", `${className} press-start-2p-regular`);
  button.addEventListener("click", () => onClick(), { once: true });
  return button;
}
