import BoidWorld from "../objects/BoidWorld";

class BoidWorldUpdaterCPU {
  static updateWorld(world: BoidWorld, deltaT: DOMHighResTimeStamp) {

    for (let i = 0; i < world.flock.length; i++) {
      const boid = world.flock[i];
      boid.findNeighborsWithinRange(world.flock);
      boid.update(world.flock, deltaT);
      boid.draw();
    }
  }
}

export default BoidWorldUpdaterCPU;
