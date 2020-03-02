(function(){
    'use strict';

    function Vector2D(x, y) {
        // constructor for 2 dimensional vector
        this.X = x;
        this.Y = y;
    }

    Vector2D.prototype.length = function() {
        // lenght of this vector (Pythagorean theorem)
        return Math.sqrt(this.X*this.X + this.Y*this.Y);
    }

    Vector2D.prototype.distance = function(v) {
        // distance from this to 'v' vector (Euclidean distance formula)
        return this.sub(v).length();
    }

    Vector2D.prototype.angle = function() {
        // angle between X axis and this vector measured counter-clockwise
        return Math.atan2(this.X, this.Y);
    }

    Vector2D.prototype.tryNormalize = function() {
        // convert to unit vector, vector with length of 1 (distance between origin and this vector)
        // if zero vector, returns zero vector
        var length = this.length();
        return length == 0 ? Vector2D.zero() : this.div(length);
    }

    Vector2D.prototype.convertToLocal = function(dimensions) {
        // convert coordinates to local units
        return new Vector2D(
            this.X - dimensions.left,
            this.Y - dimensions.top
        ).div(dimensions.scaleRatio);
    }

    Vector2D.prototype.mult = function(factor) {
        // multiply this vector by constant 'factor'
        return new Vector2D(
            this.X * factor,
            this.Y * factor
        );
    }

    Vector2D.prototype.div = function(factor) {
        // divide this vector by constant 'factor'
        return new Vector2D(
            this.X / factor,
            this.Y / factor
        );
    }

    Vector2D.prototype.add = function(v) {
        // add 'v' to this vector
        return new Vector2D(
            v.X + this.X,
            v.Y + this.Y
        );
    }

    Vector2D.prototype.sub = function(v) {
        // substract 'v' from this vector (direction from this to 'v' vector)
        return new Vector2D(
            this.X - v.X,
            this.Y - v.Y
        );
    };

    Vector2D.prototype.dot = function(v) {
        // dot product between this and 'v' vector
        return this.X * v.X + this.Y * v.Y;
    };

    Vector2D.prototype.opposite = function() {
        // opposite from this vector
        return new Vector2D(
            -this.X,
            -this.Y
        );
    };

    Vector2D.prototype.direction = function(v) {
        // direction from this to 'v' vector
        return v.sub(this);
    };

    Vector2D.prototype.isZero = function() {
        // check if zero vector
        return this.X == 0 && this.Y == 0;
    }

    Vector2D.prototype.isNearZero = function() {
        // check if near zero vector
        return this.length() < Vector2D.NEAR_ZERO;
    }

    Vector2D.prototype.isUndefined = function() {
        // check if undefined vector
        return typeof this.X == 'undefined' || typeof this.Y == 'undefined';
    }

    Vector2D.prototype.clone = function() {
        // clone this vector
        return new Vector2D(this.X, this.Y);
    }

    Vector2D.zero = function() {
        // static function for a zero vector
        return new Vector2D(0, 0);
    }

    Vector2D.random = function() {
        // static function for a random vector
        return new Vector2D(Math.random(), Math.random());
    }

    Vector2D.NEAR_ZERO = 0.01; // a small value used to detect stationary balls (non eye-catchable moving)

    // Establish the root object, `window` (`self`) in the browser, `global`
    // on the server, or `this` in some virtual machines.
    var root = typeof self == 'object' && self.self === self && self ||
            typeof global == 'object' && global.global === global && global ||
            this || {};

    // Export the Vector2D object for **Node.js**, with
    // backwards-compatibility for their old module API. If we're in
    // the browser, add Vector2D as a global object.
    // (`nodeType` is checked to ensure that `module`
    // and `exports` are not HTML elements.)
    if (typeof exports != 'undefined' && !exports.nodeType) {
        if (typeof module != 'undefined' && !module.nodeType && module.exports) {
            exports = module.exports = Vector2D;
        }
        exports.Vector2D = Vector2D;
    } else {
        root.Vector2D = Vector2D;
    }

}());