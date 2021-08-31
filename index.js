import { Boid } from './boid.js';
import { randomRange, pickOneTriadic, pickOneTetradic } from './utils.js'
import { Vector2D } from './vector.js'
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
        // rgb(75, 160, 255);
        // boid.boidElement.style.borderLeftColor = `rgb(${randomRange(10, 50)},${randomRange(20, 80)},${randomRange(150, 230)})`;
        boid.boidElement.style.borderLeftColor = pickOneTetradic("#0091FF", "#198AE0", "#2A81C4", "#2197F1");
        // boid.boidElement.style.borderLeftColor = pickOneTetradic("#3E98FF", "#FF3D98", "#98FF3D", "#FFA53D");
        // boid.boidElement.style.borderLeftColor = pickOneTriadic("#D5F7D4", "#D4F7F6", "#F7F6D4");
        appendFlock(boid);
    }
    if (flock[0]) {
        flock[0].boidElement.style.borderLeftColor = "BLACK";
    }

    window.requestAnimationFrame(gameLoop);

    /**
     * Initialize default coefficient values.
     */
    var defaultSeparationCoefficient = 1e-2;
    var defaultCohereCoefficient = 1e-2;
    var defaultAlignCoefficient = 1e-3;

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
     * Update SEPARATE scroller
     */
    // Displays SEPARATE coefficient value.
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
     * Update COHERE scroller.
     */
    // Displays COHERE coefficient value.
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
     * Update ALIGN scroller.
     */
    // Displays ALIGN coefficient value.
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
     * Update FIELD OF VIEW scroller.
     */
    // Displays FIELD OF VIEW value.
    fovSlider.oninput = function () {
        fovOutput.innerHTML = this.value;
    }

    // Updates boid's FIELD OF VIEW based on scroller value.
    fovSlider.addEventListener("input", function () {
        flock.forEach((boid) => {
            boid.range = this.value;
        })
        const circumference = Math.PI * 2 * flock[0].range / 2;
        const viewPercentage = ((2 * flock[0].leftSideFOV / (Math.PI / 180)) / 360) * 100; // Percentage of FOV that is not blind
        flock[0].SVGElement.setAttributeNS(null, "height", `${flock[0].range * 2}`);
        flock[0].SVGElement.setAttributeNS(null, "width", `${flock[0].range * 2}`);
        flock[0].BlindSpotElement.setAttributeNS(null, "height", `${flock[0].range * 2}`);
        flock[0].BlindSpotElement.setAttributeNS(null, "width", `${flock[0].range * 2}`);
        flock[0].BlindSpotElement.setAttributeNS(null, "cx", `${flock[0].range}`);
        flock[0].BlindSpotElement.setAttributeNS(null, "cy", `${flock[0].range}`);
        flock[0].BlindSpotElement.setAttributeNS(null, "r", `${flock[0].range / 2}`);
        flock[0].BlindSpotElement.setAttributeNS(null, "stroke-width", `${flock[0].range}`)
        flock[0].BlindSpotElement.setAttributeNS(null, "stroke-dasharray", `${viewPercentage * circumference / 100} ${circumference}`);
    });

    /**
     * Switch FIELD OF VIEW on and off.
     */
    var fovSwitch = document.getElementById("fov-switch");
    fovSwitch.onclick = function () {
        // turn off
        if (!fovSwitch.checked) {
            flock[0].FOVEnabled = false;
            flock[0].BlindSpotElement.setAttributeNS(null, "stroke-opacity", "0");
        }
        // turn on
        else if (fovSwitch.checked) {
            flock[0].FOVEnabled = true;
            flock[0].BlindSpotElement.setAttributeNS(null, "stroke-opacity", "0.3");
        }
    }

    /**
     * Switch SEPARATE steer element on and off.
     */
    var separateSwitch = document.getElementById("separate-switch");
    separateSwitch.onclick = function () {
        // turn off
        if (!separateSwitch.checked) {
            var steerElementScale = new Vector2D(0, 0);
            flock[0].drawLine(flock[0].separateSteerElement, steerElementScale);
            flock[0].showSeparate = false;
        }
        // turn on
        else if (separateSwitch.checked) {
            flock[0].showSeparate = true;
        }
    }

    /**
     * Switch COHERE steer element on and off.
     */
    var cohereSwitch = document.getElementById("cohere-switch");
    cohereSwitch.onclick = function () {
        if (!cohereSwitch.checked) {
            var steerElementScale = new Vector2D(0, 0);
            flock[0].drawLine(flock[0].cohereSteerElement, steerElementScale);
            flock[0].showCohere = false;
        }
        else if (cohereSwitch.checked) {
            flock[0].showCohere = true;
        }
    }

    /**
     * Switch ALIGN steer element on and off.
     */
    var alignSwitch = document.getElementById("align-switch");
    alignSwitch.onclick = function () {
        if (!alignSwitch.checked) {
            var steerElementScale = new Vector2D(0, 0);
            flock[0].drawLine(flock[0].alignSteerElement, steerElementScale);
            flock[0].showAlign = false;
        }
        else if (alignSwitch.checked) {
            flock[0].showAlign = true;
        }
    }

    /**
     * Switch NEIGHBOR line element on and off.
     */
    var neighborSwitch = document.getElementById("neighbor-switch");
    neighborSwitch.onclick = function () {
        if (!neighborSwitch.checked) {
            flock[0].showNeighbors = false;
        }
        else if (neighborSwitch.checked) {
            flock[0].showNeighbors = true;
        }
    }


}

let lastTimestamp = 0;

function gameLoop(timestamp) {
    let deltaT = (timestamp - lastTimestamp) * WORLD.TIME_SCALE;
    deltaT = Math.min(deltaT, 50);

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
