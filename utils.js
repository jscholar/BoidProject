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
 * Subtracts vector 1 from vector 2
 * @param {number[]} vector1
 * @param {number[]} vector2
 * 
 * @returns {number[]} A tuple with the x and y coordinates of the resulting vector
 */
function subtract2D([x1, y1], [x2, y2]) {
    return [x2 - x1, y2 - y1];
}

/**
 * Gets magnitude of vector
 * @param {number[]} vector The vector tuple
 * @returns {number} The magnitude of the vector
 */
function magnitude2D([x, y]) {
    return Math.sqrt(x * x + y * y);
}

/**
 * Returns normalized vector
 */
function normalize2D(vector) {
    const coeff = 1 / magnitude2D(vector);
    return scale2D(vector, coeff);
}

/**
 * Adds vector1 and vector2
 * 
 * @param {number[]} vector1
 * @param {number[]} vector2 
 * 
 * @returns {number[]} A tuple with the x and y coordinates of the resulting vector
 */
function add2D([x1, y1], [x2, y2]) {
    return [x2 + x1, y2 + y1];
}

/**
 * Scales a vector by the scaling factor
 * 
 * @param {number[]} vector 
 * @param {number} scalingFactor 
 */
function scale2D([x, y], scalingFactor) {
    return [x * scalingFactor, y * scalingFactor];
}

/**
 * Find angle between two vectors in radians
 * 
 * @param {number[]} vector 
 * @param {number} scalingFactor 
 */
function angle2D([x1, y1], [x2, y2]) {
    return Math.atan2(y1, x1) - Math.atan2(y2, x2);
}

export { distance2D, subtract2D, magnitude2D, normalize2D, add2D, scale2D, angle2D };