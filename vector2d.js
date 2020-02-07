(function(){
    "use strict";

    const NEAR_ZERO = 0.01;

    function Vector2d(x, y) {
        // constructor
        this.X = x;
        this.Y = y;
    }

    Vector2d.prototype.direction = function(to) {
        // direction from this vector to 'to' vector
        return new Vector2d(
            to.X - this.X,
            to.Y - this.Y
        );
    }

    Vector2d.prototype.length = function() {
        // lenght of this vector (Pythagorean theorem)
        return Math.sqrt(this.X*this.X + this.Y*this.Y)
    }

    Vector2d.prototype.distance = function(to) {
        // distance from this vector to 'to' vector (Euclidean distance formula)
        return this.direction(to).length();
    }

    Vector2d.prototype.angle = function() {
        // angle between X axis and this vector
        return Math.atan2(this.X, this.Y);
    }

    Vector2d.prototype.toUnit = function() {
        // unit vector, vector with length of 1 (distance between origin and this vector)
        this.mult(1 / this.length());
    }

    Vector2d.prototype.convertToLocal = function(dimensions) {
        // convert coordinates in local units
        this.X = (this.X - dimensions.left) / dimensions.scaleRatio;
        this.Y = (this.Y - dimensions.top) / dimensions.scaleRatio
    }

    Vector2d.prototype.mult = function(m) {
        // multiply this vector by constant 'm'
        return new Vector2d(
            this.X * m,
            this.Y * m
        );
    }

    Vector2d.prototype.add = function(v) {
        // add 'v' to this vector
        return new Vector2d(
            this.X + v.X,
            this.Y + v.Y
        );
    }

    Vector2d.prototype.clone = function() {
        // clone this vector
        return new Vector2d(this.X, this.Y);
    }

    Vector2d.prototype.isNearZero = function() {
        // check if near zero vector
        return this.length() < NEAR_ZERO;
    }

    Vector2d.zero = function() {
        // static function for a zero vector
        return new Vector2d(0, 0);
    }

    window.Vector2d = Vector2d;

}());