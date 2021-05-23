// Model
const boid = document.querySelector("#boid-0");

function randomizeBoid() {

    // Model position
    const positionX = Math.random() * 500;
    const positionY = Math.random() * 500;


    // Model velocity
    var plusOrMinusX = Math.random() < 0.5 ? -1 : 1;
    var plusOrMinusY = Math.random() < 0.5 ? -1 : 1;
    const velocityX = Math.random() * plusOrMinusX;
    const velocityY = Math.random() * plusOrMinusY;

    // Model angle
    const angle = -Math.atan2(velocityY, velocityX);

    /* View */

    const transformValues = [];

    // Set initial position of boid
    transformValues.push(`translate(${positionX}px, ${positionY}px)`);

    // Set initial rotation of the boid
    transformValues.push(`rotateZ(${angle}rad)`);

    // Calculate the translation


    // Calculate the rotation

    boid.style.transform = transformValues.join(" ");

}

randomizeBoid();