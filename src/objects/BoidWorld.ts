import { Boid } from "../scripts/boid";
import World, { WorldOptions } from "./World";

export interface BoidWorldOptions extends WorldOptions {
    /**
     * Initial number of boids in the world
     */
    initialBoids: number;
}

class BoidWorld extends World {
    numBoids: number;
    initialBoids: number;
    flock: Boid[] = [];

    constructor(container: HTMLElement, options: BoidWorldOptions) {
        super(container, options);
        this.numBoids = this.initialBoids = options.initialBoids;

        this.animate = this.animate.bind(this);
    }

    public initWorld() {
        for (let i = 0; i < this.initialBoids; i++) {
            this.flock.push(new Boid({ id: i, isHighlighted: i === 0 ? true : false }));
        }
    }

    public animate(timestamp: DOMHighResTimeStamp) {
        let deltaT = (timestamp - this.lastFrameTimestamp) * this.timescale;
        deltaT = Math.min(deltaT, 50);

        for (let i = 0; i < this.flock.length; i++) {
            const boid = this.flock[i];
            boid.update(this.flock, deltaT);
            boid.draw();
        }

        this.lastFrameTimestamp = timestamp;
        window.requestAnimationFrame(this.animate);
    }
}

export default BoidWorld;
