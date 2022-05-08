import { Boid } from './boid.js';
import { randomRange, pickOneTriadic, pickOneTetradic } from './utils.js'
import { Vector2D } from './vector.js'
import { WORLD, appendFlock, flock } from "./world.js";

export function initUI(flock) {
    if (flock[0]) {
        flock[0].boidElement.style.borderLeftColor = "BLACK";
    }

    /**
     * Initialize default coefficient values.
     */
     var defaultSeparationCoefficient = 1e-2 * 5;
     var defaultCohereCoefficient = 1e-2 * 5;
     var defaultAlignCoefficient = 1e-2 * 5;
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
