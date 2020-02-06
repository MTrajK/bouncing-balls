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
        this.direction = direction;
        this.speed = speed * movementProperties.horizontalSpeedFactor;
        this.radius = radius;
        this._localDimensions = localDimensions;
        this._isHorizontal = isHorizontal;
        this._enabledCollisions = enabledCollisions;
    }

    Ball.prototype.update = function() {
        if (this.speed < 0)
            this.speed = 0;
        if (this.speed === 0)
            return; // the ball is staying in place

        this.position.X += this.direction.X * this.speed;
        this.position.Y += this.direction.Y * this.speed;

        this.speed -= movementProperties.horizontalAirResistance;

        if (this.position.X - this.radius <= 0 || this.position.X + this.radius >= this._localDimensions.width) {
            // move ball inside the borders
            this.position.X = (this.position.X - this.radius <= 0) ?
                                    this.radius : this._localDimensions.width - this.radius;

            this.direction.X = -this.direction.X;
            // TODO: smaller angle -> smaller hit resistance???
            this.speed -= movementProperties.horizontalHitResistance;
        }
        if (this.position.Y - this.radius <= 0 || this.position.Y + this.radius >= this._localDimensions.height) {
            // move ball inside the borders
            this.position.Y = (this.position.Y - this.radius <= 0) ?
                                    this.radius : this._localDimensions.height - this.radius;

            this.direction.Y = -this.direction.Y;
            // TODO: smaller angle -> smaller hit resistance???
            this.speed -= movementProperties.horizontalHitResistance;
        }
    }

    Ball.prototype.collision = function(ball) {
        var direction = this.position.direction(ball.position);
        var distance = direction.length();
        var minDistance = this.radius + ball.radius;

        if (distance <= minDistance) {
            var diff = (minDistance - distance);

            // move balls outside of collision
            direction.toUnit();
            this.position.X -= direction.X * diff;
            this.position.Y -= direction.Y * diff;
            ball.position.X += direction.X * diff;
            ball.position.Y += direction.Y * diff;

            // change directions
            this.direction.X = -this.direction.X;
            this.direction.Y = -this.direction.Y;
            ball.direction.X = -ball.direction.X;
            ball.direction.Y = -ball.direction.Y;

            // change speed
            var temp = this.speed;
            this.speed = this.speed * 0.4 + ball.speed * 0.4;
            ball.speed = ball.speed * 0.4 + temp * 0.4;
        }
    }

    window.Ball = Ball;

}());