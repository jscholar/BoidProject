# BoidProject
Boids is an artificial life program that simulates the behavior of birds, fish, and swarms.

<br>

## Overview
---

Live Preview: https://jscholar.github.io/BoidProject/


**BOID CONTROLLER**

**Toggles**

Note: Toggles will only be performed on the boid of interest whom is colored black, however, it is a representation of the whole flock.

Field Of View - Displays a highlighted region representing the boid's field of view. The highlighted region is where the boid can see and detect other boids. There is a blind spot located behind the boid where the boid is not able to see or detect other boids.

Separation Vector - Displays the direction and magnitude that the boid is steering (Green). The boid calculates the position of all other boids inside its field of view, averages it, and then steers in the opposite direction in order to avoid it. The closer a neighboring boid is, the stronger the repulsion.

Cohesion Vector - Displays the direction and magnitude that the boid is steering (Blue). The boid calculates the center of mass by calculating the average position of the boids inside its field of view and then steers towards it.

Alignment Vector - Displays the direction and magnitude that the boid is steering (Yellow). The boid calculates the average velocity of all boids inside its field of view and then steers towards it.

Neighbor Lines - Displays a line to and from any neighboring boid within the boid's field of view (Red). The boid calculates the distance of all other boids and if its position is within its vision range, it is considered a neighbor.

**Sliders**

Note: Sliders will affect every boid in the flock. A bigger coefficient correlates to a more strongly weighted behavior. All coefficient values are arbitrary.

Field of View - The view range of each boid. 1 indicates a blind boid, while 300 represents a boid who is able to 300 pixels out in a 360 degree radius, excluding the blind spot.

Separation Coefficient - How strongly a boid will separate from its neighbors. A coefficient of 0 indicates that a boid will not make any attempts to move away from incoming boids, while a 50 indicates that a boid will strongly repel from other boids.

Cohesion Coefficient - How strongly a boid will steer towards its neighbors. A coefficient of 0 indicates that a boid will not make any attempts to move towards its neighbors, while a 50 indicates that a boid will strongly steers towards the center of mass of its neighbors.

Alignment Coefficient - How strongly a boid will steer to align with its neighbor's general direction. A coefficient of 0 indicates that a boid will not make any attempts to align with its neighbors, while a 50 indicates that a boid will strongly steer in the general direction of its neighbors.

<br>

## Contributing
---
### Getting Started
1. Install the npm libraries

> `npm install`

2. Build the project

> // To build the project into `/lib`:
>
> `npm run build`

<br>

> // To build the project into `/lib` and watches for changes. Recommened to use this in development alongside a live-server:
>
>`npm run build-watch`
