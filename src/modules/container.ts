export default class Container {
  public id: string;
  public width: number;
  public height: number;
  private resizeObserver: ResizeObserver | null = null;

  constructor(id: string, w: number, h: number) {
    this.id = id;
    this.width = w;
    this.height = h;

    // Keep size in sync with the DOM element on initial load and on resize using ResizeObserver
    if (globalThis.document) {
      const element: HTMLElement | null = document.getElementById(this.id);
      if (element) {
        this.setDimensionsFromElement(element);
        this.setupResizeObserver(element);
      }
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

  removeResizeObserver() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
  }

  private setupResizeObserver(element: HTMLElement) {
    this.resizeObserver = new ResizeObserver(() => {
      this.setDimensionsFromElement(element);
    });
    this.resizeObserver.observe(element);
  }

  private setDimensionsFromElement(element: HTMLElement) {
    this.dimensions = {
      w: element.offsetWidth,
      h: element.offsetHeight,
    };
  }
}
