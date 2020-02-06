(function(){
    "use strict";

    const movementProperties = {
        maxSpeed: 2, // local units
        horizontalAirResistance: 0.005, // decreasing of speed in each frame
        horizontalHitResistance: 0.1, // decreasing of speed when hit a wall
        horizontalSpeedFactor: 0.1, // speed factor
        gravity: 9.8 // passed local units in one second
    };

    function Ball(position, direction, speed) {
        // constructor
        this.position = position;
        this._direction = direction;
        this._speed = speed;
    }

    Ball.prototype.update = function() {
        console.log(movementProperties.maxSpeed);
    }

    window.Ball = Ball;

}());