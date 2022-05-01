import { Boid } from '../scripts/boid'
import World, { WorldOptions } from './World'

import nearestNeighborKernel from '../kernels/nearestNeighborKernel'

export interface BoidWorldOptions extends WorldOptions {
  /**
   * Initial number of boids in the world
   */
  initialBoids: number
}

class BoidWorld extends World {
  numBoids: number
  initialBoids: number
  flock: Boid[] = []

  constructor (container: HTMLElement, options: BoidWorldOptions) {
    super(container, options)
    this.numBoids = this.initialBoids = options.initialBoids

    this.animate = this.animate.bind(this)
  }

  public initWorld () {
    for (let i = 0; i < this.initialBoids; i++) {
      this.flock.push(
        new Boid({ id: i, isHighlighted: i === 0 ? true : false })
      )
    }
  }

  public animate (timestamp: DOMHighResTimeStamp) {
    let deltaT = (timestamp - this.lastFrameTimestamp) * this.timescale
    deltaT = Math.min(deltaT, 50)

    const positions = this.flock.map(({ position }) => [position.x, position.y])

    const flockNeighbors = nearestNeighborKernel(positions) as number[][]
    for (let i = 0; i < this.flock.length; i++) {
      const boid = this.flock[i]
      boid.neighbors = new Set(
        flockNeighbors[i].reduce((neighbors, isNeighbor, neighbor) => {
          if (isNeighbor) {
            neighbors.push(this.flock[neighbor])
          }
          return neighbors
        }, [])
      )
      boid.update(this.flock, deltaT)
      boid.draw()
    }

    this.lastFrameTimestamp = timestamp
    window.requestAnimationFrame(this.animate)
  }
}

export default BoidWorld
