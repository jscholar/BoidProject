import  "./styles/styles.css"
import { initUI } from "./scripts/control-ui";

import BoidWorld from "./objects/BoidWorld";
import { DEFAULT_BOID_WORLD} from "./config/WORLD_PRESETS";

function main() {
  const boidWorld = new BoidWorld(document.getElementById("canvas-container"), DEFAULT_BOID_WORLD);
  boidWorld.initWorld();

  initUI(boidWorld.flock);

  window.requestAnimationFrame(boidWorld.animate);
}

window.onload = main;
