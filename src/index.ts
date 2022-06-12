import "./styles/styles.css";
import initUI from "./scripts/control-ui";

import BoidWorld from "./objects/BoidWorld";
import { DEFAULT_BOID_WORLD } from "./config/WORLD_PRESETS";

import FrameRateCalculator from "./utils/FrameRateCalculator";

function main() {
  const boidWorld = new BoidWorld(document.getElementById("canvas-container"), DEFAULT_BOID_WORLD);
  boidWorld.initWorld();

  initUI(boidWorld.flock);

  const frameRateCalculator = new FrameRateCalculator({
    callback(fps: number) {
      document.getElementById("fps").innerText = fps ? `${fps.toFixed(0)} FPS` : "N/A";
    },
  });

  frameRateCalculator.start();
  window.requestAnimationFrame(boidWorld.animate);
}

window.onload = main;
