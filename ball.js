(function(){
    "use strict";

    const movementProperties = {
        horizontalAirResistance: 0.005, // decreasing of speed in each frame
        horizontalHitResistance: 0.1, // decreasing of speed when hit a wall
        horizontalSpeedFactor: 0.1 // speed factor
    };

    function Ball(position, direction, speed, radius, localDimensions, isHorizontal, enabledCollisions) {
        // constructor
        this.position = position;
        this._direction = direction;
        this._speed = speed * movementProperties.horizontalSpeedFactor;
        this._radius = radius;
        this._localDimensions = localDimensions;
        this._isHorizontal = isHorizontal;
        this._enabledCollisions = enabledCollisions;
    }

    Ball.prototype.update = function() {
        if (this._speed < 0)
            return; // the ball is staying in place

        this.position.X += this._direction.X * this._speed;
        this.position.Y += this._direction.Y * this._speed;

        this._speed -= movementProperties.horizontalAirResistance;

        if (this.position.X - this._radius <= 0 || this.position.X + this._radius >= this._localDimensions.width) {
            // move ball inside the borders
            this.position.X = (this.position.X - this._radius <= 0) ?
                                    this._radius : this._localDimensions.width - this._radius;

            this._direction.X = -this._direction.X;
            // TODO: smaller angle -> smaller hit resistance???
            this._speed -= movementProperties.horizontalHitResistance;
        }
        if (this.position.Y - this._radius <= 0 || this.position.Y + this._radius >= this._localDimensions.height) {
            // move ball inside the borders
            this.position.Y = (this.position.Y - this._radius <= 0) ?
                                    this._radius : this._localDimensions.height - this._radius;

            this._direction.Y = -this._direction.Y;
            // TODO: smaller angle -> smaller hit resistance???
            this._speed -= movementProperties.horizontalHitResistance;
        }
    }

    window.Ball = Ball;

}());