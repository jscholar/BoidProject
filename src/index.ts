import * as THREE from "three";
import BoidScene from "./scenes/BoidScene"

function main() {
  const boidScene = new BoidScene();
  boidScene.init();
}

window.onload = main;
