export interface WorldOptions {
    /**
     * Timescale for physics calculations and animation
     */
    timescale: number;

    /**
     * Width of display canvas in pixels
     */
    width: number;

    /**
     * Height of display canvas in pixels
     */
    height: number;
}

abstract class World {
    timescale: WorldOptions["timescale"];
    width: WorldOptions["width"];
    height: WorldOptions["height"]

    protected lastFrameTimestamp: DOMHighResTimeStamp = 0;

    constructor(container: HTMLElement, options: WorldOptions) {
        Object.assign(this, options);
        this.initializeCanvas(container);
    }

    public abstract initWorld(): void;

    public abstract animate(timestamp: DOMHighResTimeStamp): void;

    private initializeCanvas(container: HTMLElement) {
        const canvasElement = document.createElement("div");
        canvasElement.setAttribute("id", "canvas");
        canvasElement.classList.add("canvas");
        canvasElement.style.width = `${this.width}px`;
        canvasElement.style.height = `${this.height}px`;
        document.getElementById("canvas-container").appendChild(canvasElement);
    }
}

export default World;
