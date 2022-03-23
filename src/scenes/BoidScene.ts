import { Scene } from "three";
import Boid from "../objects/Boid";

class BoidScene extends Scene {
  constructor() {
    super();
  }

  init() {
    console.log("Initializing Boid Scene");
  }

  addBoid() {
    this.add();
  }
}

export default BoidScene;
