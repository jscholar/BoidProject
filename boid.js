import { WORLD, appendFlock, flock } from "./world.js";
import { HIGHLIGHT_CONFIG } from "./config.js";
import { distance2D, subtract2D, magnitude2D, normalize2D } from "./utils.js";

// Boid object
class Boid {
    FOVEnabled = false;
    nearestNeigbhorEnabled = false;
    neighbors = new Set();
    neighborLineElements = {};

    separateSteerElement;

    constructor({ id, isHighlighted }) {
        this.id = id;
        this.highlighted = isHighlighted;

        // Coefficients
        this.separationCoefficient = 1e-6;
        this.cohereCoefficient = 1e-6;


        // Model position
        this.positionX = (Math.random() * WORLD.CANVAS_WIDTH);
        this.positionY = (Math.random() * WORLD.CANVAS_HEIGHT);

        // Model velocity
        this.velocityX = Math.random() * 10 - 5;
        this.velocityY = Math.random() * 10 - 5;

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
        this.positionX += this.velocityX * deltaT;
        this.positionY += -this.velocityY * deltaT;

        /**
         * If the boid has moved out of the canvas, wrap it back into the canvas
         */
        if (this.positionX > CANVAS_WIDTH + offset) {
            this.positionX = -offset;
        }
        else if (this.positionX < -offset) {
            this.positionX = CANVAS_WIDTH + offset;
        }

        if (this.positionY > CANVAS_HEIGHT + offset) {
            this.positionY = -offset;
        }
        else if (this.positionY < -offset) {
            this.positionY = CANVAS_HEIGHT + offset;
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

        const positionTransform = `translate(${this.positionX}px, ${this.positionY}px)`;
        transforms.push(positionTransform);

        const rotationInRadians = -Math.atan2(this.velocityY, this.velocityX);
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

        const vectorX = otherBoid.positionX - this.positionX;
        const vectorY = otherBoid.positionY - this.positionY;
        const lineLength = distance2D(0, 0, vectorX, vectorY);

        // Determines the thickness/weight of the line
        const width = `${Math.sqrt(10 * (this.range - lineLength) / this.range)}px`;

        // Reduce opacity when distance is close to the range limit
        const opacity = `${100 * (this.range - lineLength) / this.range}%`;

        const styles = { width, opacity };
        this.drawLine(lineElement, { X: vectorX, Y: vectorY }, styles);
    }

    /**
     * Avoid nearby boids
     */
    separate(deltaT) {
        let totalSteerX = 0;
        let totalSteerY = 0;

        this.neighbors.forEach((neighborBoid) => {
            // let desiredVelocity = subtract2D(neighborBoid.positionX, neighborBoid.positionY, this.positionX, this.positionY);
            let [desiredVelocityX, desiredVelocityY] = subtract2D(this.positionX, this.positionY, neighborBoid.positionX, neighborBoid.positionY);
            // Set a maximum desired velocity

            let desiredSteer = subtract2D(desiredVelocityX, desiredVelocityY, this.velocityX, this.velocityY);
            const [normalizedSteerX, normalizedSteerY] = normalize2D(desiredSteer);

            const distance = distance2D(this.positionX, this.positionY, neighborBoid.positionX, neighborBoid.positionY);

            // A number from 0.0 - 1.0
            const strengthRatio = Math.pow(1 - (distance / this.range), 2);

            const steerStrength = strengthRatio * this.separationCoefficient;

            // Set strength of seperation according to distance (closer boids separate more strongly)
            totalSteerX += steerStrength * normalizedSteerX;
            totalSteerY += steerStrength * normalizedSteerY;

        });

        if (this.highlighted) {
            const styles = {
                "background-color": "green",
                width: "3px",
            }
            this.drawLine(this.separateSteerElement, { X: totalSteerX / this.separationCoefficient, Y: totalSteerY / this.separationCoefficient }, styles)
        }

        // Set maximum force the boid can generate
        this.velocityX += (totalSteerX) * deltaT;
        this.velocityY -= (totalSteerY) * deltaT;
    }

    /**
     * Speed Control
     */
    speedControl() {
        const maxSpeed = 2;
        const currentBoidSpeed = magnitude2D([this.velocityX, this.velocityY]);
        if (currentBoidSpeed > maxSpeed) {
            this.velocityX = (this.velocityX / currentBoidSpeed) * maxSpeed;
            this.velocityY = (this.velocityY / currentBoidSpeed) * maxSpeed;
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
        let totalSteerX = 0;
        let totalSteerY = 0;
        let centerOfMassX = 0;
        let centerOfMassY = 0;
        this.neighbors.forEach((neighborBoid) => {
            centerOfMassX += neighborBoid.positionX;
            centerOfMassY += neighborBoid.positionY;
        });

        if (this.neighbors.size > 0) {
            centerOfMassX = centerOfMassX / this.neighbors.size;
            centerOfMassY = centerOfMassY / this.neighbors.size;

            let [desiredVelocityX, desiredVelocityY] = subtract2D(centerOfMassX, centerOfMassY, this.positionX, this.positionY);
            let desiredSteer = subtract2D(desiredVelocityX, desiredVelocityY, this.velocityX, this.velocityY);
            const [normalizedSteerX, normalizedSteerY] = normalize2D(desiredSteer);

            const distance = distance2D(this.positionX, this.positionY, centerOfMassX, centerOfMassY);

            // A number from 0.0 - 1.0
            const strengthRatio = Math.pow(1 - (distance / this.range), 2);

            const steerStrength = strengthRatio * this.cohereCoefficient;

            // Set strength of seperation according to distance (closer boids separate more strongly)
            totalSteerX += steerStrength * normalizedSteerX;
            totalSteerY += steerStrength * normalizedSteerY;

        }
        this.velocityX += (totalSteerX) * deltaT;
        this.velocityY -= (totalSteerY) * deltaT;
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

            if (this.range >= distance2D(this.positionX, this.positionY, otherBoid.positionX, otherBoid.positionY)) {
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
    drawLine(lineElement, vector, styles) {
        // Use the distance between the points as the line length

        // Vector [X, Y] is the vector that points from this boid
        const vectorX = vector.X;
        const vectorY = vector.Y;

        const transforms = [];
        /**
         * The line is rotated about its center. So we need to move the center of the line to the point
         * exactly halfway between the boids.
         */
        const lineLength = distance2D(0, 0, vectorX, vectorY);
        const translationX = this.positionX + vectorX / 2;
        const translationY = this.positionY + vectorY / 2 - (lineLength / 2); // Line length needed to cancel the height of the div I guess.
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