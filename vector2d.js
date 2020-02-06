(function(){
    "use strict";

    function Vector2d(x, y) {
        // constructor
        this.X = x;
        this.Y = y;
    }

    Vector2d.prototype.direction = function(to) {
        // direction from this Vector2d to 'to' Vector2d
        return new Vector2d(
            to.X - this.X,
            to.Y - this.Y
        );
    }

    Vector2d.prototype.length = function() {
        // lenght of this Vector2d (Pythagorean theorem)
        return Math.sqrt(this.X*this.X + this.Y*this.Y)
    }

    Vector2d.prototype.distance = function(to) {
        // distance from this Vector2d to 'to' Vector2d (Euclidean distance formula)
        return this.direction(to).length();
    }

    Vector2d.prototype.angle = function() {
        // angle between X axis and this Vector2d
        return Math.atan2(this.X, this.Y);
    }

    Vector2d.prototype.toUnit = function() {
        // unit Vector2d, vector with length of 1 (distance between origin and this Vector2d)
        const length = this.length();
        this.X /= length;
        this.Y /= length;
    }

    Vector2d.prototype.convertToLocal = function(dimensions) {
        // convert coordinates in local units
        this.X = (this.X - dimensions.left) / dimensions.scaleRatio;
        this.Y = (this.Y - dimensions.top) / dimensions.scaleRatio
    }

    Vector2d.prototype.clone = function() {
        // clone this vector
        return new Vector2d(this.X, this.Y);
    }

    Vector2d.zero = function() {
        // static function for a zero vector
        return new Vector2d(0, 0);
    }

    window.Vector2d = Vector2d;

}());