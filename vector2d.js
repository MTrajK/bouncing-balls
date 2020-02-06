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

    Vector2d.prototype.distance = function(to) {
        // euclidean distance formula (distance from this Vector2d to 'to' Vector2d)
        const dir = this.direction(to);
        return Math.sqrt(dir.X*dir.X + dir.Y*dir.Y);
    }

    Vector2d.prototype.convertToLocal = function(dimensions) {
        // convert coordinates in local units
        this.X = (this.X - dimensions.left) / dimensions.scalePercent;
        this.Y = (this.Y - dimensions.top) / dimensions.scalePercent
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