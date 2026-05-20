export function createButton({
  label,
  id,
  className,
  onClick,
  svgContent,
}: {
  label: string;
  id: string;
  className: string;
  onClick: () => void;
  svgContent?: string;
}): HTMLElement {
  let button = document.createElement("button");
  button.setAttribute("id", id);
  button.setAttribute("class", `${className} press-start-2p-regular`);
  button.addEventListener("click", () => onClick(), { once: true });

  if (svgContent) {
    button.innerHTML = svgContent;
    const span = document.createElement("span");
    span.setAttribute("class", "visually-hidden");
    span.textContent = label;
    button.appendChild(span);
  } else {
    button.textContent = label;
  }

  return button;
}
