(function(){
    "use strict";

    // Note, the walls are harder than the balls, so the ball lost kinetic energy when bouncing from a wall.
    // But the balls are equally hard (and have equal weigh), so they don't lost energy when bouncing. (the energy is transfered?)
    // So the collision between balls is elastic.
    const movementProperties = {
        horizontalAirResistance: 0.99, // decreasing of speed in each frame
        horizontalHitResistance: 0.8, // decreasing of speed when hit a wall
        horizontalSpeedFactor: 0.2 // speed factor
    };

    function Ball(position, direction, radius, localDimensions, isHorizontal, enabledCollisions) {
        // constructor
        this.position = position;
        this.direction = direction.mult(movementProperties.horizontalSpeedFactor);
        this.radius = radius;
        this._localDimensions = localDimensions;
        this._isHorizontal = isHorizontal;
        this._enabledCollisions = enabledCollisions;
    }

    Ball.prototype.update = function() {
        if (this.direction.isNearZero())
            return; // the ball is staying in place

        this.position = this.position.add(this.direction);
        this.direction = this.direction.mult(movementProperties.horizontalAirResistance);

        if (this.position.X - this.radius <= 0 || this.position.X + this.radius >= this._localDimensions.width) {
            // move ball inside the borders
            this.position.X = (this.position.X - this.radius <= 0) ?
                                    this.radius : this._localDimensions.width - this.radius;

            // reflection angle is an inverse angle to the perpendicular axis to the wall (in this case the wall is Y axis)
            this.direction.X = -this.direction.X;
            this.direction = this.direction.mult(movementProperties.horizontalHitResistance);
        }
        if (this.position.Y - this.radius <= 0 || this.position.Y + this.radius >= this._localDimensions.height) {
            // move ball inside the borders
            this.position.Y = (this.position.Y - this.radius <= 0) ?
                                    this.radius : this._localDimensions.height - this.radius;

            // reflection angle is an inverse angle to the perpendicular axis to the wall (in this case the wall is X axis)
            this.direction.Y = -this.direction.Y;
            this.direction = this.direction.mult(movementProperties.horizontalHitResistance);
        }
    }

    Ball.prototype.collision = function(ball) {
        var direction = this.position.sub(ball.position);
        var distance = direction.length();
        var minDistance = this.radius + ball.radius;

        if (distance <= minDistance) {
            var diff = (minDistance - distance);

            // move balls outside of collision
            direction = direction.normalize();
            this.position.X -= direction.X * diff;
            this.position.Y -= direction.Y * diff;
            ball.position.X += direction.X * diff;
            ball.position.Y += direction.Y * diff;

            // change directions
            this.direction.X = -this.direction.X;
            this.direction.Y = -this.direction.Y;
            ball.direction.X = -ball.direction.X;
            ball.direction.Y = -ball.direction.Y;
        }
    }

    window.Ball = Ball;

}());