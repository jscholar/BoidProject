import { GPU } from "gpu.js"
import { DEFAULT_BOID_WORLD } from "../config/WORLD_PRESETS";
import { Boid } from "../scripts/boid";

import { distance2D } from "../scripts/utils";

const gpu = new GPU({ mode: "gpu" });

// Compute distance comparisons in parallel
// Returns:
// 0 - The boid is NOT a neighbor
// 1 - The boid IS a neighbor
const nearestNeighbor2D = gpu.createKernel(function(positions: number[][]) {
    if (this.thread.x === this.thread.y) return 0;

    const deltaX = positions[this.thread.y][0] - positions[this.thread.x][0];
    const deltaY = positions[this.thread.y][1] - positions[this.thread.x][1];
    const distance = Math.sqrt(
        Math.pow(deltaX, 2)
        + Math.pow(deltaY, 2)
    );

    return distance < this.constants.boidRange ? 1 : 0;
}).setOutput([DEFAULT_BOID_WORLD.initialBoids, DEFAULT_BOID_WORLD.initialBoids]).setConstants({ boidRange: 150 });

export default nearestNeighbor2D;
