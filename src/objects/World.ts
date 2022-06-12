import { WorldOptions } from "../@types/World";

abstract class World {
  timescale: WorldOptions["timescale"];

  width: WorldOptions["width"];

  height: WorldOptions["height"];

  protected lastFrameTimestamp: DOMHighResTimeStamp = 0;

  canvasElement: HTMLElement;

  constructor(container: HTMLElement, options: WorldOptions) {
    Object.assign(this, options);
    this.initializeCanvas(container);
  }

  public abstract initWorld(): void;

  public abstract animate(timestamp: DOMHighResTimeStamp): void;

  private initializeCanvas(container: HTMLElement) {
    this.canvasElement = document.createElement("div");
    this.canvasElement.setAttribute("id", "canvas");
    this.canvasElement.classList.add("boid-world");
    this.canvasElement.style.width = `${this.width}px`;
    this.canvasElement.style.height = `${this.height}px`;
    container.appendChild(this.canvasElement);
  }
}

export default World;
