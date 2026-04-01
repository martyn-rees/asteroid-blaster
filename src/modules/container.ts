export default class Container {
  public id: string;
  public width: number;
  public height: number;

  constructor(id: string, w: number, h: number) {
    this.id = id;
    this.width = w;
    this.height = h;

    // TODO: use resizeObservorAPI on this element instead of window resize
    // Keep size in sync with the DOM element on initial load and on resize
    if (globalThis.document) {
      this.setDimensionsFromElement();
      window.addEventListener("resize", () => {
        this.setDimensionsFromElement();
      });
    }
  }

  set dimensions({ w, h }: { w: number; h: number }) {
    this.width = w;
    this.height = h;
  }

  get dimensions(): { screenWidth: number; screenHeight: number } {
    return { screenWidth: this.width, screenHeight: this.height };
  }

  get centre(): { x: number; y: number } {
    return { x: this.width / 2, y: this.height / 2 };
  }

  setDimensionsFromElement() {
    let screenNode: HTMLElement | null = document.getElementById(this.id);
    if (screenNode) {
      this.dimensions = {
        w: screenNode.offsetWidth,
        h: screenNode.offsetHeight,
      };
    }
  }
}
