/**
 * Finds the distance between two points
 * 
 * @param {number} x1 The x coordinate of first point
 * @param {number} y1 The y coordinate of first point
 * @param {number} x2 The x coordinate of second point
 * @param {number} y2 The y coordinate of second point
 * 
 * @returns {number} The distance between the two points
 */
function distance2D(x1, y1, x2, y2) {
    const deltaX = x2 - x1;
    const deltaY = y2 - y1;
    return Math.sqrt(
        Math.pow(deltaX, 2)
        + Math.pow(deltaY, 2)
    );
}

/**
 * Subtracts vector 1 from vector 2
 * @param {number} x1 The x coordinate of first vector
 * @param {number} y1 The y coordinate of first vector
 * @param {number} x2 The x coordinate of second vector
 * @param {number} y2 The y coordinate of second vector
 * 
 * @returns {number[]} A tuple with the x and y coordinates of the resulting vector
 */
function subtract2D(x1, y1, x2, y2) {
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
function normalize2D([x, y]) {
    const coeff = 1 / magnitude2D([x, y]);
    return [x / coeff, y / coeff];
}

export { distance2D, subtract2D, magnitude2D, normalize2D };