import { Size } from "../types.ts";

export default class Viewport {
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
        this.matchElementSize(element);
        this.setupResizeObserver(element);
      }
    }
  }

  set size({ width, height }: Size) {
    this.width = width;
    this.height = height;
  }

  get size(): Size {
    return { width: this.width, height: this.height };
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
    this.removeResizeObserver();
    this.resizeObserver = new ResizeObserver(() =>
      this.matchElementSize(element),
    );
    this.resizeObserver.observe(element);
  }

  private matchElementSize(element: HTMLElement) {
    this.size = {
      width: element.offsetWidth,
      height: element.offsetHeight,
    };
  }
}
