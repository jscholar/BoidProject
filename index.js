import { Boid } from './boid.js';
import { WORLD, appendFlock, flock } from "./world.js";

function init() {
    /**
     * Initialize Canvas
     */
    const canvasElement = document.createElement("div");
    canvasElement.setAttribute("id", "canvas");
    canvasElement.classList.add("canvas");
    canvasElement.style.width = `${WORLD.CANVAS_WIDTH}px`;
    canvasElement.style.height = `${WORLD.CANVAS_HEIGHT}px`;
    document.getElementById("canvas-container").appendChild(canvasElement);

    /**
     * Initialize Boids.
     */
    for (let i = 0; i < WORLD.NUM_BOIDS; i++) {
        const isHighlighted = i === 0;
        const boid = new Boid({ id: i, isHighlighted });
        appendFlock(boid);
    }

    window.requestAnimationFrame(gameLoop);

    /**
     * Initialize default coefficient values.
     */
    var defaultSeparationCoefficient = 1e-2;
    var defaultCohereCoefficient = 1e-2;
    var defaultAlignCoefficient = 1e-2;


    /**
     * Initialize separate slider.
     */
    var separationCoefficientSlider = document.getElementById("separation-range");
    var separationOutput = document.getElementById("separation-value");
    separationOutput.innerHTML = separationCoefficientSlider.value;

    /**
     * Initialize cohere slider.
     */
    var cohereCoefficientSlider = document.getElementById("cohere-range");
    var cohereOutput = document.getElementById("cohere-value");
    cohereOutput.innerHTML = cohereCoefficientSlider.value;

    /**
     * Initialize align slider.
     */
     var alignCoefficientSlider = document.getElementById("align-range");
     var alignOutput = document.getElementById("align-value");
     alignOutput.innerHTML = alignCoefficientSlider.value;

    /**
     * Initialize FOV slider.
     */
    var fovSlider = document.getElementById("fov-range");
    var fovOutput = document.getElementById("fov-value");
    fovOutput.innerHTML = fovSlider.value;

    /**
     * Update separation scroller
     */
    // Displays separation coefficient value.
    separationCoefficientSlider.oninput = function () {
        separationOutput.innerHTML = this.value;
    }

    // Updates boid's SEPARATE coefficient based on scroller value.
    separationCoefficientSlider.addEventListener("input", function () {
        var separationSliderValue = defaultSeparationCoefficient * separationCoefficientSlider.value;
        flock.forEach((boid) => {
            boid.separationCoefficient = separationSliderValue;
        })
    });

    /**
     * Update cohere scroller.
     */
    // Displays cohere coefficient value.
    cohereCoefficientSlider.oninput = function () {
        cohereOutput.innerHTML = this.value;
    }

    // Updates boid's COHERE coefficient based on scroller value.
    cohereCoefficientSlider.addEventListener("input", function () {
        var cohereSliderValue = defaultCohereCoefficient * cohereCoefficientSlider.value;
        flock.forEach((boid) => {
            boid.cohereCoefficient = cohereSliderValue;
        })
    });

    /**
     * Update align scroller.
     */
    // Displays align coefficient value.
    alignCoefficientSlider.oninput = function () {
        alignOutput.innerHTML = this.value;
    }

    // Updates boid's ALIGN coefficient based on scroller value.
    alignCoefficientSlider.addEventListener("input", function () {
        var alignSliderValue = defaultAlignCoefficient * alignCoefficientSlider.value;
        flock.forEach((boid) => {
            boid.alignCoefficient = alignSliderValue;
        })
    });

    /**
     * Update field of view scroller.
     */
    // Displays fov value.
    fovSlider.oninput = function () {
        fovOutput.innerHTML = this.value;
    }

    // Updates boid's FOV based on scroller value.
    fovSlider.addEventListener("input", function () {
        flock.forEach((boid) => {
            boid.range = this.value;
        })
    });
}

let lastTimestamp = 0;

function gameLoop(timestamp) {
    const deltaT = (timestamp - lastTimestamp) * WORLD.TIME_SCALE;

    for (let i = 0; i < flock.length; i++) {
        const boid = flock[i];
        boid.update(flock, deltaT);
        boid.draw();
    }

    lastTimestamp = timestamp;
    window.requestAnimationFrame(gameLoop);
}

init();
console.log(flock);
