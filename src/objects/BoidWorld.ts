import World from "./World";

import { Boid } from "../scripts/boid";
import { BoidWorldOptions } from "../@types/BoidWorld";

import onComputeModeChange from "../interface/computeMode";
import BoidWorldUpdaterGPU from "../updaters/BoidWorldUpdaterGPU";
import BoidWorldUpdaterCPU from "../updaters/BoidWorldUpdaterCPU";
import { UpdaterComputeMode } from "../@types/Updaters";

class BoidWorld extends World {
  numBoids: number;

  initialBoids: number;

  flock: Boid[] = [];

  computeMode: UpdaterComputeMode = UpdaterComputeMode.GPU;

  constructor(container: HTMLElement, options: BoidWorldOptions) {
    super(container, options);
    this.numBoids = options.initialNumBoids;
    this.initialBoids = options.initialNumBoids;

    this.animate = this.animate.bind(this);
    this.handleComputeModeChange = this.handleComputeModeChange.bind(this);
    
    onComputeModeChange(this.handleComputeModeChange)
  }

  public initWorld() {
    for (let i = 0; i < this.initialBoids; i += 1) {
      this.flock.push(
        new Boid({ id: i, isHighlighted: i === 0, world: this }),
      );
    }
  }

  public animate(timestamp: DOMHighResTimeStamp) {
    let deltaT = (timestamp - this.lastFrameTimestamp) * this.timescale;
    deltaT = Math.min(deltaT, 50);

    if (this.computeMode === UpdaterComputeMode.GPU) {
      BoidWorldUpdaterGPU.updateWorld(this, deltaT);
    } else {
      BoidWorldUpdaterCPU.updateWorld(this, deltaT);
    }

    this.lastFrameTimestamp = timestamp;
    window.requestAnimationFrame(this.animate);
  }

  private handleComputeModeChange(computeMode: UpdaterComputeMode) {
    console.log(computeMode);
    this.computeMode = computeMode;
  }
}

export default BoidWorld;
