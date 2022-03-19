class Vector2D {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    /**
     * Adds vector2 to this vector
     * 
     * @param {Vector2D} vector2
     */
    add(vector2) {
        this.x += vector2.x;
        this.y += vector2.y;
    }

    /**
     * Subtracts vector2 from this vector
     * @param {Vector2D} vector2
     */
    subtract(vector2) {
        this.x -= vector2.x;
        this.y -= vector2.y;
    }

    /**
     * Gets the magnitude of this vector
     * 
     * @returns {number} The magnitude of this vector
     */
    magnitude() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    /**
     * Gets the normalized vector of this vector
     * 
     * @returns {Vector2D} Returns the normalized vector of this vector
     */
    normalize() {
        const coeff = 1 / this.magnitude();
        return new Vector2D(this.x * coeff, this.y * coeff);
    }

    /**
     * Scales a vector by the scaling factor
     * 
     * @param {number} scalingFactor 
     */
    scale(scalingFactor) {
        this.x *= scalingFactor;
        this.y *= scalingFactor;

        return this;
    }

    /**
     * Finds the angle of this vector in radians.
     * 
     * @returns {number} The angle of this vector in radians
     */
    angle() {
        return Math.atan2(this.y, this.x);
    }

    /**
     * Finds the angle between this vector and another vector in radians
     * 
     * @param {Vector2D} vector2 
     * 
     * @returns {number} Returns the angle between this vector and another vector in radians
     */
    angleBetweenVectors(vector2) {
        var angle = vector2.angle() - this.angle();
        if (angle > Math.PI) {
            angle -= 2 * Math.PI;
        }
        else if (angle <= -Math.PI) {
            angle += 2 * Math.PI;
        }
        return angle;
    }
}

export { Vector2D };