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

export { distance2D };