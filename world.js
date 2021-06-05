/**
  * All boids are contained inside this world.
  */
const WORLD = {
  CANVAS_WIDTH: 1000,
  CANVAS_HEIGHT: 800,
  NUM_BOIDS: 50,
  TIME_SCALE: 0.05,
};

// List containing all boids in the world
var flock = [];
window.flock = flock;

/**
 * Add boid to the flock
*/
function appendFlock(boid) {
  flock.push(boid);
}

export { WORLD, appendFlock, flock };
