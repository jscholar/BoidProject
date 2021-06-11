/**
 * Finds the distance between two points
 * 
 * @param {number[]} vector1
 * @param {number[]} vector2
 * 
 * @returns {number} The distance between the two points
 */
function distance2D([x1, y1], [x2, y2]) {
    const deltaX = x2 - x1;
    const deltaY = y2 - y1;
    return Math.sqrt(
        Math.pow(deltaX, 2)
        + Math.pow(deltaY, 2)
    );
}

/**
 * Generates a random positive number.
 * 
 * @param {number} min
 * @param {number} max
 * 
 * @returns {number} from min (inclusive) to max (non-inclusive)
 */
function randomRange(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

/**
 * @param {string} a color 1
 * @param {string} b color 2
 * @param {string} c color 3
 * 
 * @returns {string} A random color from a, b, and c
 */
function pickOneTriadic(a, b, c) {
    var random = randomRange(1, 4);
    if (random == 1) {
        return a;
    }
    if (random == 2) {
        return b;
    }
    if (random == 3) {
        return c;
    }
}

/**
 * @param {string} a color 1
 * @param {string} b color 2
 * @param {string} c color 3
 * @param {string} d color 4
 * 
 * @returns {string} A random color from a, b, c, and d
 */
function pickOneTetradic(a, b, c, d) {
    var random = randomRange(1, 5);
    if (random == 1) {
        return a;
    }
    if (random == 2) {
        return b;
    }
    if (random == 3) {
        return c;
    }
    if (random == 4) {
        return d;
    }
}


export { distance2D, randomRange, pickOneTriadic, pickOneTetradic };