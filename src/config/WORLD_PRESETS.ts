/* eslint-disable import/prefer-default-export */
import { BoidWorldOptions } from "../@types/BoidWorld";

export const DEFAULT_BOID_WORLD: BoidWorldOptions = {
  initialNumBoids: 200,
  timescale: 0.1,
  width: window.screen.width - 100,
  height: window.screen.height - 100,
};
