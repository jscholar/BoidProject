import { WORLD } from "./world.js";
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
    range = 150;

    leftSideFOV = 130 * (Math.PI / 180);
    rightSideFOV = 130 * (Math.PI / 180);

    position;

    constructor({ id, isHighlighted }) {
        this.id = id;
        this.highlighted = isHighlighted;

        // Coefficients
        this.separationCoefficient = 1e-3 * 25;
        this.cohereCoefficient = 1e-3 * 25;
        this.alignCoefficient = 1e-2 * 25;

        // Display lines or not
        this.showAlign = false;
        this.showCohere = false;
        this.showSeparate = false;
        this.showNeighbors = false;

        // Model position vector
        this.position = new Vector2D(Math.random() * WORLD.CANVAS_WIDTH, Math.random() * WORLD.CANVAS_HEIGHT);

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

            this.repelSteerElement = document.createElement("div");
            this.repelSteerElement.classList.add("align-line");
            document.getElementById("canvas").appendChild(this.repelSteerElement);
            this.showRepel = true;
        }
    }

    update(flock, deltaT) {
        
        // Apply boid rules
        this.separate(deltaT);
        this.cohere(deltaT);
        this.align(deltaT);

        // Apply constant velocity for boid
        this.speedControl();
        this.moveBoid(deltaT);

        // Ensure that the boid does not go towards infinity and beyond.
        this.repel(deltaT);
        this.superGravity(deltaT);
    }

    /**
     * Move the boid's position
     */
    moveBoid(deltaT) {
        const deltaV = new Vector2D(this.velocity.x, this.velocity.y);
        deltaV.scale(deltaT);
        this.position.add(deltaV);
    }

    /**
     * If the boid has moved close to the wall, steer it towards the center of the canvas
     */
    repel(deltaT) {
        const offset = 20;
        const { CANVAS_HEIGHT, CANVAS_WIDTH } = WORLD;
        const bottomWall = CANVAS_HEIGHT - offset;
        const rightWall = CANVAS_WIDTH - offset;
        const topWall = offset;
        const leftWall = offset;
        const repelCoefficient = 0.5;

        var totalSteer = new Vector2D(0, 0);

        // Repel away from right wall
        if (this.position.x > rightWall - this.range) {
            const repelSteerX = this.repelSteer(-1, 0, Math.abs(rightWall - this.position.x));
            totalSteer.add(repelSteerX);
        }

        // Repel away from left wall
        else if (this.position.x < this.range) {
            const repelSteerX = this.repelSteer(1, 0, Math.abs(this.position.x - leftWall));
            totalSteer.add(repelSteerX);
        }

        // Repel away from top wall
        if (this.position.y > bottomWall - this.range) {
            const repelSteerY = this.repelSteer(0, -1, Math.abs(bottomWall - this.position.y));
            totalSteer.add(repelSteerY);
        }

        // Repel away from bottom wall
        else if (this.position.y < this.range) {
            const repelSteerY = this.repelSteer(0, 1, Math.abs(this.position.y - topWall));
            totalSteer.add(repelSteerY);
        }

        this.velocity.add(totalSteer.scale(deltaT * repelCoefficient));
    }

    /**
     * Super gravity
     */
    superGravity(deltaT) {
        const { CANVAS_HEIGHT, CANVAS_WIDTH } = WORLD;
        const offset = -10;

        /**
         * If the boid has moved close to the wall, steer it towards the center of the canvas
         */
        const gravity = 2
        var steer = new Vector2D(0, 0);
        var desiredVelocity = new Vector2D(WORLD.CANVAS_WIDTH / 2, WORLD.CANVAS_HEIGHT / 2);
        desiredVelocity.subtract(this.position);

        this.steerTowardsTarget(desiredVelocity);
        const normalizedSteer = this.steerTowardsTarget(desiredVelocity);
        normalizedSteer.scale(gravity);
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

    /**
     * Creates a steer vector scaled based on distance of boid to the wall
     */
    repelSteer(steerDirectionX, steerDirectionY, distance) {
        var totalSteer = new Vector2D(0, 0);
        if (distance > this.range) return totalSteer;
        totalSteer.add(new Vector2D(steerDirectionX, steerDirectionY));
        var strengthRatio = Math.pow(1 - (distance / this.range), 2);
        return totalSteer.scale(strengthRatio);
    }

    /**
     * Creates FOV element with blind spot
     */
    toggleFOV() {
        if (!this.FOVEnabled) {
            const circumference = Math.PI * 2 * this.range / 2;
            const viewPercentage = ((2 * this.leftSideFOV / (Math.PI / 180)) / 360) * 100; // Percentage of FOV that is not blind

            // Create SVG element to contain FOV and Blindspot wedge
            this.SVGElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            this.SVGElement.setAttributeNS(null, "height", `${this.range * 2}`);
            this.SVGElement.setAttributeNS(null, "width", `${this.range * 2}`);
            this.SVGElement.classList.add("FOV");

            // Create blindspot wedge by making the FOV a certain percentage of the circle.
            this.BlindSpotElement = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            this.BlindSpotElement.setAttributeNS(null, "height", `${this.range * 2}`);
            this.BlindSpotElement.setAttributeNS(null, "width", `${this.range * 2}`);
            this.BlindSpotElement.setAttributeNS(null, "cx", `${this.range}`);
            this.BlindSpotElement.setAttributeNS(null, "cy", `${this.range}`);
            this.BlindSpotElement.setAttributeNS(null, "r", `${this.range / 2}`);
            this.BlindSpotElement.setAttributeNS(null, "fill", "none");

            // Stroke creates the pie slice / blind spot
            this.BlindSpotElement.setAttributeNS(null, "stroke", "grey");
            this.BlindSpotElement.setAttributeNS(null, "stroke-opacity", "0");

            // Stroke width hould be same as radius of FOV
            this.BlindSpotElement.setAttributeNS(null, "stroke-width", `${this.range}`)

            /*
             * We will only need one of the dashes from the dasharray to be our blindspot/slice
             * to do this, we increase the spacing between each wedge so we only see one.
             * the stroke-dasharray gap is set to the circumference of the blindSpotElement circle.
             * x value = viewPercentage   |    y value = circumference = 2 * pi * radius
             */
            console.log(this.BlindSpotElement);
            console.log(this.SVGElement);

            this.BlindSpotElement.setAttributeNS(null, "stroke-dasharray", `${viewPercentage * circumference / 100} ${circumference}`);
            this.BlindSpotElement.classList.add("blindspot");
            this.SVGElement.appendChild(this.BlindSpotElement);
            this.boidElement.appendChild(this.SVGElement);
        } else {
            this.SVGElement.remove();
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

        if (this.showSeparate) {
            var steerElementScale = new Vector2D(totalSteer.x, totalSteer.y);
            this.drawLine(this.separateSteerElement, steerElementScale.scale(100));
        }

        this.velocity.add(totalSteer.scale(deltaT));
    }

    /**
     * Move towards average direction of nearby boids
     */
    align(deltaT) {
        // Calculate average velocity
        var totalSteer = new Vector2D(0, 0);
        var desiredVelocity = new Vector2D(0, 0);
        this.neighbors.forEach((neighborBoid) => desiredVelocity.add(neighborBoid.velocity));

        if (this.neighbors.size > 0) {
            desiredVelocity.scale(1 / this.neighbors.size);
            const normalizedSteer = this.steerTowardsTarget(desiredVelocity);
            totalSteer = normalizedSteer.scale(this.alignCoefficient);
        }

        if (this.showAlign) {
            var steerElementScale = new Vector2D(totalSteer.x, totalSteer.y).scale(2000);
            this.drawLine(this.alignSteerElement, steerElementScale);
        }

        this.velocity.add(totalSteer.scale(deltaT));
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
            totalSteer = normalizedSteer.scale(this.cohereCoefficient);
        }

        if (this.showCohere) {
            var steerElementScale = new Vector2D(totalSteer.x, totalSteer.y).scale(300);
            this.drawLine(this.cohereSteerElement, steerElementScale);
        }

        this.velocity.add(totalSteer.scale(deltaT));
    }

    /**
     * Steer towards a direction
     * @param {Vector2D} desiredDirection A vector representing the desired steering direction
     * 
     * @returns {Vector2D} Returns a normalized vector pointing towards the target direction
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
        const offset = 8; // Offset the translation to center the drawn line on the boid

        // Ensures the line that is drawn does not extend past the FOV
        var tempVector = new Vector2D(vector.x, vector.y);
        if (tempVector.magnitude() >= this.range) {
            tempVector.scale(this.range / tempVector.magnitude());
        }

        /**
         * The line is rotated about its center. So we need to move the center of the line to the point
         * exactly halfway between the boids.
         */

        // Use the distance between the points as the line length
        const lineLength = tempVector.magnitude();
        const translationX = this.position.x + offset + tempVector.x / 2;
        const translationY = this.position.y + offset + tempVector.y / 2 - (lineLength / 2); // Line length needed to cancel the height of the div I guess.
        transforms.push(`translate(${translationX}px, ${translationY}px)`);

        // Rotate the line to point in the direction of the vector
        // Since vector <X, Y> points from this boid to the other boid, we can pass this to angle()
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
        if (!this.showNeighbors) {
            return;
        }
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
        const width = `${Math.sqrt(5 * (this.range - lineLength) / this.range)}px`;

        // Reduce opacity when distance is close to the range limit
        const opacity = `${100 * (this.range - lineLength) / this.range}%`;

        const styles = { width, opacity };
        this.drawLine(lineElement, vectorToOtherBoid, styles);
    }
}

export { Boid }