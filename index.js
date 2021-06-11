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
    canvasElement.style.minWidth = `${WORLD.CANVAS_WIDTH}px`;
    canvasElement.style.minHeight = `${WORLD.CANVAS_HEIGHT}px`;
    document.getElementById("canvas-container").appendChild(canvasElement);

    /**
     * Initialize Boids.
     */
    for (let i = 0; i < WORLD.NUM_BOIDS; i++) {
        const isHighlighted = i === 0;
        const boid = new Boid({ id: i, isHighlighted });
        // rgb(75, 160, 255);
        boid.boidElement.style.borderLeftColor = `rgb(${randomRange(0, 40)},${randomRange(80, 100)},${randomRange(180, 230)})`;
        // boid.boidElement.style.borderLeftColor = pickOneTetradic("#3E98FF", "#FF3D98", "#98FF3D", "#FFA53D");
        // boid.boidElement.style.borderLeftColor = pickOneTriadic("#D5F7D4", "#D4F7F6", "#F7F6D4");
        appendFlock(boid);
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
            flock[0].FOVElement.style.width = `${flock[0].range * 2}px`;
            flock[0].FOVElement.style.height = `${flock[0].range * 2}px`;
        })
    });

    /**
     * Toggles FIELD OF VIEW on and off.
     * Kind of janky because it just reduces the size of the FOV element and doesn't actually remove it.
     */
    var fovButton = document.getElementById("toggle-fov");
    fovButton.onclick = function () {
        if (fovButton.innerText == "OFF") {
            flock[0].FOVEnabled = false;
            fovButton.innerText = "ON";
            flock[0].FOVElement.style.width = 0;
            flock[0].FOVElement.style.height = 0;
        }
        else if (fovButton.innerText == "ON") {
            flock[0].FOVEnabled = true;
            fovButton.innerText = "OFF";
            flock[0].FOVElement.style.width = `${flock[0].range * 2}px`;
            flock[0].FOVElement.style.height = `${flock[0].range * 2}px`;
        }
    }

    /**
     * Toggles separate steer element on and off.
     */
    var separateButton = document.getElementById("toggle-separate");
    separateButton.onclick = function () {
        if (separateButton.innerText == "OFF") {
            separateButton.innerText = "ON";
            var steerElementScale = new Vector2D(0, 0);
            flock[0].drawLine(flock[0].separateSteerElement, steerElementScale);
            flock[0].showSeparate = false;
        }
        else if (separateButton.innerText == "ON") {
            separateButton.innerText = "OFF";
            flock[0].showSeparate = true;
        }
    }

    /**
     * Toggles cohere steer element on and off.
     */
    var cohereButton = document.getElementById("toggle-cohere");
    cohereButton.onclick = function () {
        if (cohereButton.innerText == "OFF") {
            cohereButton.innerText = "ON";
            var steerElementScale = new Vector2D(0, 0);
            flock[0].drawLine(flock[0].cohereSteerElement, steerElementScale);
            flock[0].showCohere = false;
        }
        else if (cohereButton.innerText == "ON") {
            cohereButton.innerText = "OFF";
            flock[0].showCohere = true;
        }
    }

    /**
     * Toggles align steer element on and off.
     */
    var alignButton = document.getElementById("toggle-align");
    alignButton.onclick = function () {
        if (alignButton.innerText == "OFF") {
            alignButton.innerText = "ON";
            var steerElementScale = new Vector2D(0, 0);
            flock[0].drawLine(flock[0].alignSteerElement, steerElementScale);
            flock[0].showAlign = false;
        }
        else if (alignButton.innerText == "ON") {
            alignButton.innerText = "OFF";
            flock[0].showAlign = true;
        }
    }

    /**
     * Toggles neighbor line element on and off.
     */
    var neighborButton = document.getElementById("toggle-neighbors");
    neighborButton.onclick = function () {
        if (neighborButton.innerText == "OFF") {
            neighborButton.innerText = "ON";
            flock[0].showNeighbors = false;
        }
        else if (neighborButton.innerText == "ON") {
            neighborButton.innerText = "OFF";
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
