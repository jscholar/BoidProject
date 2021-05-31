import { WORLD, appendFlock, flock } from "./world.js";
import { HIGHLIGHT_CONFIG } from "./config.js";
import { distance2D, subtract2D, magnitude2D, normalize2D, scale2D, add2D } from "./utils.js";

// Boid object
class Boid {
    FOVEnabled = false;
    nearestNeigbhorEnabled = false;
    neighbors = new Set();
    neighborLineElements = {};

    separateSteerElement;
    cohereSteerElement;

    constructor({ id, isHighlighted }) {
        this.id = id;
        this.highlighted = isHighlighted;

        // Coefficients
        this.separationCoefficient = 1e-1;
        this.cohereCoefficient = 1e-1;

        // Model position vector
        this.position = [
            (Math.random() * WORLD.CANVAS_WIDTH), // The X position
            (Math.random() * WORLD.CANVAS_HEIGHT), // The Y position
        ];

        // Model velocity vector
        this.velocity = [
            Math.random() * 10 - 5,
            Math.random() * 10 - 5,
        ];

        // Model field of vision
        this.range = 150;

        this.initializeDOMElements(isHighlighted);
    }

    initializeDOMElements(isHighlighted) {
        // Add boid element
        this.boidElement = document.createElement("div");
        this.boidElement.setAttribute("id", "boid" + this.id);
        this.boidElement.classList.add("boids");
        document.getElementById("canvas").appendChild(this.boidElement);

        // Determines whether to draw FOV or other details
        if (isHighlighted) {
            this.toggleFOV();
            this.separateSteerElement = document.createElement("div");
            this.separateSteerElement.classList.add("steering-line");
            document.getElementById("canvas").appendChild(this.separateSteerElement);

            this.cohereSteerElement = document.createElement("div");
            this.cohereSteerElement.classList.add("cohere-line");
            document.getElementById("canvas").appendChild(this.cohereSteerElement);
        }
    }

    update(flock, deltaT) {
        this.findNeighborsWithinRange(flock);
        /**
         * Apply boid rules
         */
        this.separate(deltaT);
        this.cohere(deltaT);
        this.speedControl();
        this.moveBoid(deltaT);

    }

    /**
     * Move the boid's position
    */
    moveBoid(deltaT) {
        const { CANVAS_HEIGHT, CANVAS_WIDTH } = WORLD;
        const offset = 20;
        this.position = add2D(this.position, scale2D(this.velocity, deltaT));

        /**
         * If the boid has moved out of the canvas, wrap it back into the canvas
         */
        if (this.position[0] > CANVAS_WIDTH + offset) {
            this.position[0] = -offset;
        }
        else if (this.position[0] < -offset) {
            this.position[0] = CANVAS_WIDTH + offset;
        }

        if (this.position[1] > CANVAS_HEIGHT + offset) {
            this.position[1] = -offset;
        }
        else if (this.position[1] < -offset) {
            this.position[1] = CANVAS_HEIGHT + offset;
        }
    }

    toggleFOV() {
        if (!this.FOVEnabled) {
            this.FOVElement = document.createElement("div");
            this.FOVElement.classList.add("FOV");
            this.FOVElement.style.width = `${this.range * 2}px`;
            this.FOVElement.style.height = `${this.range * 2}px`;
            this.boidElement.appendChild(this.FOVElement);
        } else {
            this.FOVElement.remove();
        }

        this.FOVEnabled = !this.FOVEnabled
    }

    /**
     * Display boid into the DOM
     */
    draw() {
        if (this.highlighted) {
            this.drawNeighbors();
        }

        this.drawBoid();
    }

    logBoidDetails() {
        console.log("boid id: " + this.id);
        console.log("position x: " + this.positionX);
        console.log("position y: " + this.positionY);
        console.log("velocity x: " + this.velocityX);
        console.log("velocity y: " + this.velocityY);
    }

    /**
     * Draws the boid body
     */
    drawBoid() {
        const styles = {};

        const transforms = [];

        const [positionX, positionY] = this.position
        const positionTransform = `translate(${positionX}px, ${positionY}px)`;
        transforms.push(positionTransform);

        const [velocityX, velocityY] = this.velocity;

        const rotationInRadians = Math.atan2(velocityY, velocityX);
        const rotationTransform = `rotateZ(${rotationInRadians}rad)`;
        transforms.push(rotationTransform);

        styles.transform = transforms.join(" ");

        Object.entries(styles).forEach(([CSSProperty, value]) => {
            this.boidElement.style[CSSProperty] = value;
        });
    }

    /**
     * Draws lines to the neighbors
     */
    drawNeighbors() {
        /**
         * Clean now out of range boids
         */

        // Find which birds are now out of range
        const outOfRangeBoidIds = new Set(Object.keys(this.neighborLineElements));
        this.neighbors.forEach((neighborBoid) => {
            // Remove boids still in range
            outOfRangeBoidIds.delete(neighborBoid.id);
        });

        // Delete the line DOM elements for out of range boids and delete from the hash table
        outOfRangeBoidIds.forEach((outOfRangeBoidId) => {
            this.neighborLineElements[outOfRangeBoidId]?.remove();
            delete this.neighborLineElements[outOfRangeBoidId];
        })

        if (this.neighbors.size === 0) return;

        this.neighbors.forEach((neighborBoid) => this.drawLineToOtherBoid(neighborBoid));
    }

    drawLineToOtherBoid(otherBoid) {
        // Check hash table to see if the line DOM element is already created.
        let lineElement = this.neighborLineElements[otherBoid.id];
        if (!lineElement) {
            // If the DOM element is not created, then create it
            lineElement = document.createElement("div");
            lineElement.classList.add("neighbor-line");
            lineElement.setAttribute("id", `${this.id}-to-${otherBoid.id}`)

            // Record this DOM element in hash table
            this.neighborLineElements[otherBoid.id] = lineElement;
            document.getElementById("canvas").appendChild(lineElement);
        }

        const vectorToOtherBoid = subtract2D(this.position, otherBoid.position);
        const lineLength = magnitude2D(vectorToOtherBoid);

        // Determines the thickness/weight of the line
        const width = `${Math.sqrt(10 * (this.range - lineLength) / this.range)}px`;

        // Reduce opacity when distance is close to the range limit
        const opacity = `${100 * (this.range - lineLength) / this.range}%`;

        const styles = { width, opacity };
        this.drawLine(lineElement, vectorToOtherBoid, styles);
    }

    /**
     * Avoid nearby boids
     */
    separate(deltaT) {
        let totalSteer = [0, 0];

        this.neighbors.forEach((neighborBoid) => {
            let desiredVelocity = subtract2D(neighborBoid.position, this.position);

            let desiredSteer = subtract2D(this.velocity, desiredVelocity);
            const normalizedSteer = normalize2D(desiredSteer);

            const distance = distance2D(this.position, neighborBoid.position);

            // A number from 0.0 - 1.0
            const strengthRatio = Math.pow(1 - (distance / this.range), 2); 

            const steerStrength = strengthRatio * this.separationCoefficient;

            // Set strength of seperation according to distance (closer boids separate more strongly)
            totalSteer = add2D(totalSteer, scale2D(normalizedSteer, steerStrength));
        });

        if (this.highlighted) {
            this.drawLine(this.separateSteerElement, scale2D(totalSteer, 1000), styles)
        }

        // Set maximum force the boid can generate
        this.velocity = add2D(this.velocity, scale2D(totalSteer, deltaT));
    }

    /**
     * Speed Control
     */
    speedControl() {
        const maxSpeed = 2;
        const currentBoidSpeed = magnitude2D(this.velocity);
        if (currentBoidSpeed > maxSpeed) {
            this.velocity = scale2D(this.velocity, maxSpeed / currentBoidSpeed);
        }
    }


    /**
     * Move towards average direction of nearby boids
     */
    align() {

    }

    /**
     * Fly towards center of mass
     */
    cohere(deltaT) {
        let totalSteer = [0, 0];
        let centerOfMass = [0, 0];
        this.neighbors.forEach((neighborBoid) => centerOfMass = add2D(centerOfMass, neighborBoid.position));

        if (this.neighbors.size > 0) {
            centerOfMass = scale2D(centerOfMass, 1 / this.neighbors.size);

            let desiredVelocity = subtract2D(this.position, centerOfMass);
            let desiredSteer = subtract2D(this.velocity, desiredVelocity);
            const normalizedSteer = normalize2D(desiredSteer);

            const distance = distance2D(this.position, centerOfMass);

            // A number from 0.0 - 1.0
            const strengthRatio = Math.pow(1 - (distance / this.range), 2);

            const steerStrength = strengthRatio * this.cohereCoefficient;

            // Set strength of seperation according to distance (closer boids separate more strongly)
            totalSteer = add2D(totalSteer, scale2D(normalizedSteer, steerStrength));
        }

        if (this.highlighted) {
            this.drawLine(this.cohereSteerElement, scale2D(totalSteer, 1000));
        }

        this.velocity = add2D(this.velocity, scale2D(totalSteer, deltaT));
    }

    /**
     * Find n closest/neighboring boids
     */
    nClosestBoids(boid, n) {

    }

    /**
     * Find neighbors within this boid's range
     */
    findNeighborsWithinRange(flock) {
        flock.forEach((otherBoid) => {
            if (otherBoid === this) return;

            if (this.range >= distance2D(this.position, otherBoid.position)) {
                this.neighbors.add(otherBoid)
            } else {
                this.neighbors.delete(otherBoid)
            }
        });

        return this.neighbors;
    }

    /**
     * Draws a line originating from this boid with the given vector values
     */
    drawLine(lineElement, vector, styles = {}) {
        // Use the distance between the points as the line length

        // Vector [X, Y] is the vector that points from this boid
        const [vectorX, vectorY] = vector;

        const transforms = [];
        /**
         * The line is rotated about its center. So we need to move the center of the line to the point
         * exactly halfway between the boids.
         */
        const lineLength = magnitude2D(vector);
        const translationX = this.position[0] + vectorX / 2;
        const translationY = this.position[1] + vectorY / 2 - (lineLength / 2); // Line length needed to cancel the height of the div I guess.
        transforms.push(`translate(${translationX}px, ${translationY}px)`);

        // Rotate the line to point in the direction of the vector
        // Since vector [X, Y] points from this boid to the other boid, we can pass this to atan2
        const rotationInRadians = -Math.atan2(vectorX, vectorY);
        transforms.push(`rotate(${rotationInRadians}rad)`);
        const transform = transforms.join(" ");

        Object.entries(styles).forEach(([property, value]) => lineElement.style[property] = value);
        lineElement.style.transform = transform;
        lineElement.style.height = `${lineLength}px`;
    }
}

export { Boid };