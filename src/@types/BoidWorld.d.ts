import { WorldOptions } from "./World";

export interface BoidWorldOptions extends WorldOptions {
  /**
     * Initial number of boids in the world
     */
  initialNumBoids: number
}
