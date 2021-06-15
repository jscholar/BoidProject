/**
  * All boids are contained inside this world.
  */
const WORLD = {
  CANVAS_WIDTH: screen.width,
  CANVAS_HEIGHT: screen.height * .93,
  NUM_BOIDS: (screen.width + screen.height) / 25,
  TIME_SCALE: 0.075,
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
