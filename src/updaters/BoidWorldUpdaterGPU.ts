import BoidWorld from "../objects/BoidWorld";
import nearestNeighborKernel from "../kernels/nearestNeighborKernel";

class BoidWorldUpdaterGPU {
  static updateWorld(world: BoidWorld, deltaT: DOMHighResTimeStamp) {
    const positions = world.flock.map(({ position }) => [position.x, position.y]);

    const flockNeighbors = nearestNeighborKernel(positions) as number[][];
    for (let i = 0; i < world.flock.length; i += 1) {
      const boid = world.flock[i];
      boid.neighbors = new Set(
        flockNeighbors[i].reduce((neighbors, isNeighbor, neighbor) => {
          if (isNeighbor) {
            neighbors.push(world.flock[neighbor]);
          }
          return neighbors;
        }, []),
      );
      boid.update(world.flock, deltaT);
      boid.draw();
    }
  }
}

export default BoidWorldUpdaterGPU;
