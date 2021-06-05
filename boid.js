import { WORLD, appendFlock, flock } from "./world.js";
import { HIGHLIGHT_CONFIG } from "./config.js";
import { distance2D } from "./utils.js";
import { Vector2D } from "./vector.js";

// Boid object
class Boid {
    FOVEnabled = false;
    nearestNeigbhorEnabled = false;
    neighbors = new Set();
    neighborLineElements = {};

    separateSteerElement;
    cohereSteerElement;
    alignSteerElement;

    maxSpeed = 3;
    range = 125;

    leftSideFOV = 130 * (Math.PI / 180);
    rightSideFOV = 130 * (Math.PI / 180);

    constructor({ id, isHighlighted }) {
        this.id = id;
        this.highlighted = isHighlighted;

        // Coefficients
        this.separationCoefficient = 1e-1;
        this.cohereCoefficient = 1e-1;
        this.alignCoefficient = 1e-2;

        // Model position vector
        this.position = new Vector2D(Math.random() * WORLD.CANVAS_WIDTH, Math.random() * WORLD.CANVAS_WIDTH);

        // Model velocity vector
        this.velocity = new Vector2D(Math.random() * 10 - 5, Math.random() * 10 - 5);
        this.velocity.scale(this.maxSpeed);

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
            this.separateSteerElement.classList.add("separate-line");
            document.getElementById("canvas").appendChild(this.separateSteerElement);

            this.cohereSteerElement = document.createElement("div");
            this.cohereSteerElement.classList.add("cohere-line");
            document.getElementById("canvas").appendChild(this.cohereSteerElement);

            this.alignSteerElement = document.createElement("div");
            this.alignSteerElement.classList.add("align-line");
            document.getElementById("canvas").appendChild(this.alignSteerElement);
        }
    }

    update(flock, deltaT) {
        // Search this boid for any nearby neighbors
        this.findNeighborsWithinRange(flock);

        // Apply boid rules
        this.separate(deltaT);
        this.cohere(deltaT);
        this.align(deltaT);

        // Control speed of boid
        this.speedControl();

        this.moveBoid(deltaT);
    }

    /**
     * Move the boid's position
    */
    moveBoid(deltaT) {
        const { CANVAS_HEIGHT, CANVAS_WIDTH } = WORLD;
        const offset = 200;
        const deltaV = new Vector2D(this.velocity.x, this.velocity.y);
        deltaV.scale(deltaT);
        this.position.add(deltaV);


        /**
         * If the boid has moved out of the canvas, wrap it back into the canvas
         */
        // if (this.position.x > CANVAS_WIDTH + offset) {
        //     this.position.x = -offset;
        // }
        // else if (this.position.x < -offset) {
        //     this.position.x = CANVAS_WIDTH + offset;
        // }
        // if (this.position.y > CANVAS_HEIGHT + offset) {
        //     this.position.y = -offset;
        // }
        // else if (this.position.y < -offset) {
        //     this.position.y = CANVAS_HEIGHT + offset;
        // }

        /**
         * If the boid has moved close to the wall, steer it towards the center of the canvas
         */
        const repelCoefficient = 0.5;
        var steer = new Vector2D(0, 0);
        var desiredVelocity = new Vector2D(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
        desiredVelocity.subtract(this.position);

        this.steerTowardsTarget(desiredVelocity);
        const normalizedSteer = this.steerTowardsTarget(desiredVelocity);
        normalizedSteer.scale(repelCoefficient);
        steer.add(normalizedSteer);

        if (this.position.x > CANVAS_WIDTH - offset) {
            this.velocity.add(steer.scale(deltaT));
        }
        if (this.position.x < offset) {
            this.velocity.add(steer.scale(deltaT));
        }
        if (this.position.y > CANVAS_HEIGHT - offset) {
            this.velocity.add(steer.scale(deltaT));
        }
        if (this.position.y < offset) {
            this.velocity.add(steer.scale(deltaT));
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
     * Speed Control
     */
    speedControl() {
        let newSpeed = this.velocity.normalize();
        newSpeed.scale(this.maxSpeed);
        this.velocity = newSpeed;
    }

    /**
     * Find neighbors within this boid's range
     */
    findNeighborsWithinRange(flock) {
        flock.forEach((otherBoid) => {
            if (otherBoid === this) return;
            const isInsideRange = this.range >= distance2D([this.position.x, this.position.y], [otherBoid.position.x, otherBoid.position.y]);

            if (isInsideRange) {
                const vectorFromBoidToOther = new Vector2D(otherBoid.position.x, otherBoid.position.y);
                vectorFromBoidToOther.subtract(this.position);
                const angleBetweenNeighbor = this.velocity.angleBetweenVectors(vectorFromBoidToOther);
                this.angleData = {
                    angleBetweenNeighbor,
                    vector1: this.velocity,
                    vector2: vectorFromBoidToOther,
                }
                const isInsideFOV = (angleBetweenNeighbor > -this.leftSideFOV && angleBetweenNeighbor < this.rightSideFOV);

                if (isInsideFOV) {
                    this.neighbors.add(otherBoid);
                }
                else {
                    this.neighbors.delete(otherBoid);
                }
            } else {
                this.neighbors.delete(otherBoid);
            }
        });

        return this.neighbors;
    }

    /**
     * Avoid nearby boids
     */
    separate(deltaT) {
        var totalSteer = new Vector2D(0, 0);

        this.neighbors.forEach((neighborBoid) => {
            var desiredVelocity = new Vector2D(this.position.x, this.position.y);
            desiredVelocity.subtract(neighborBoid.position);
            const normalizedSteer = this.steerTowardsTarget(desiredVelocity);

            const distance = distance2D([this.position.x, this.position.y], [neighborBoid.position.x, neighborBoid.position.y]);

            // A number from 0.0 - 1.0
            const strengthRatio = Math.pow(1 - (distance / this.range), 2);
            const steerStrength = strengthRatio * this.separationCoefficient;

            // Set strength of separation according to distance (closer boids separate more strongly)
            normalizedSteer.scale(steerStrength);
            totalSteer.add(normalizedSteer);
        });

        if (this.highlighted) {
            var steerElementScale = new Vector2D(totalSteer.x, totalSteer.y);
            this.drawLine(this.separateSteerElement, steerElementScale.scale(500));
        }

        this.velocity.add(totalSteer.scale(deltaT));
    }

    /**
     * Move towards average direction of nearby boids
     */
    align(deltaT) {
        // Calculate average velocity
        var steer = new Vector2D(0, 0);
        var desiredVelocity = new Vector2D(0, 0);
        this.neighbors.forEach((neighborBoid) => desiredVelocity.add(neighborBoid.velocity));

        if (this.neighbors.size > 0) {
            desiredVelocity.scale(1 / this.neighbors.size);

            const normalizedSteer = this.steerTowardsTarget(desiredVelocity);

            // const distance = distance2D([this.position.x, this.position.y], [desiredVelocity.x, desiredVelocity.y]);
            // const strengthRatio = Math.pow(1 - (distance / this.range), 2); // A number from 0.0 - 1.0
            const steerStrength = 1 * this.alignCoefficient;

            // Set strength of separation according to distance (closer boids separate more strongly)

            steer = normalizedSteer.scale(steerStrength);
        }

        if (this.highlighted) {
            var steerElementScale = new Vector2D(steer.x, steer.y).scale(500);
            this.drawLine(this.alignSteerElement, steerElementScale);
        }

        this.velocity.add(steer.scale(deltaT));
    }

    /**
     * Fly towards center of mass
     */
    cohere(deltaT) {
        var totalSteer = new Vector2D(0, 0);
        var centerOfMass = new Vector2D(0, 0);
        this.neighbors.forEach((neighborBoid) => centerOfMass.add(neighborBoid.position));

        if (this.neighbors.size > 0) {
            centerOfMass.scale(1 / this.neighbors.size);

            let desiredVelocity = new Vector2D(centerOfMass.x, centerOfMass.y)
            desiredVelocity.subtract(this.position);

            const normalizedSteer = this.steerTowardsTarget(desiredVelocity);

            // const distance = distance2D([this.position.x, this.position.y], [desiredVelocity.x, desiredVelocity.y]);
            // const strengthRatio = Math.pow(1 - (distance / this.range), 2); // A number from 0.0 - 1.0
            const steerStrength = 1 * this.cohereCoefficient;

            // Set strength of separation according to distance (closer boids separate more strongly)
            normalizedSteer.scale(steerStrength);
            totalSteer.add(normalizedSteer);
        }

        if (this.highlighted) {
            var steerElementScale = new Vector2D(totalSteer.x, totalSteer.y).scale(500);
            this.drawLine(this.cohereSteerElement, steerElementScale);
        }

        this.velocity.add(totalSteer.scale(deltaT));
    }

    /**
     * Steer towards a direction
     */
    steerTowardsTarget(desiredDirection) {
        const desiredVelocity = desiredDirection.normalize();
        desiredVelocity.scale(this.maxSpeed);

        var desiredSteer = new Vector2D(desiredVelocity.x, desiredVelocity.y);
        desiredSteer.subtract(this.velocity);

        return desiredSteer.normalize();
    }

    /**
     * Draws a line originating from this boid with the given vector values
     */
    drawLine(lineElement, vector, styles = {}) {
        const transforms = [];

        // Ensures the line that is drawn does not extend past the FOV
        var tempVector = new Vector2D(vector.x, vector.y);
        if (tempVector.magnitude() > this.range) {
            tempVector.scale(this.range / tempVector.magnitude());
        }

        /**
         * The line is rotated about its center. So we need to move the center of the line to the point
         * exactly halfway between the boids.
         */

        // Use the distance between the points as the line length
        const lineLength = tempVector.magnitude();
        const translationX = this.position.x + tempVector.x / 2;
        const translationY = this.position.y + tempVector.y / 2 - (lineLength / 2); // Line length needed to cancel the height of the div I guess.
        transforms.push(`translate(${translationX}px, ${translationY}px)`);

        // Rotate the line to point in the direction of the vector
        // Since vector [X, Y] points from this boid to the other boid, we can pass this to atan2
        const rotationInRadians = Math.PI / 2 + vector.angle();
        transforms.push(`rotate(${rotationInRadians}rad)`);
        const transform = transforms.join(" ");

        Object.entries(styles).forEach(([property, value]) => lineElement.style[property] = value);
        lineElement.style.transform = transform;
        lineElement.style.height = `${lineLength}px`;
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

    /**
     * Console log boid id, position, and velocity
     */
    logBoidDetails() {
        console.log("boid id: " + this.id);
        console.log("position x: " + this.position.x);
        console.log("position y: " + this.position.y);
        console.log("velocity x: " + this.velocity.x);
        console.log("velocity y: " + this.velocity.y);
    }

    /**
     * Draws the boid body
     */
    drawBoid() {
        const styles = {};
        const transforms = [];

        const positionTransform = `translate(${this.position.x}px, ${this.position.y}px)`;
        transforms.push(positionTransform);

        const rotationInRadians = this.velocity.angle();
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

        const vectorToOtherBoid = new Vector2D(otherBoid.position.x, otherBoid.position.y);
        vectorToOtherBoid.subtract(this.position);

        const lineLength = vectorToOtherBoid.magnitude();

        // Determines the thickness/weight of the line
        const width = `${Math.sqrt(10 * (this.range - lineLength) / this.range)}px`;

        // Reduce opacity when distance is close to the range limit
        const opacity = `${100 * (this.range - lineLength) / this.range}%`;

        const styles = { width, opacity };
        this.drawLine(lineElement, vectorToOtherBoid, styles);
    }
}

export { Boid }