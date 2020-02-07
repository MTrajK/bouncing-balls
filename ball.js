(function(){
    "use strict";

    // Note, the walls are harder than the balls, so the ball lost kinetic energy when bouncing from a wall.
    // But the balls are equally hard (and have equal weight), so they don't lost energy when bouncing between themself.
    // So the collision between balls is elastic.
    const movementProperties = {
        horizontalAirResistance: 0.99, // decreasing of speed in each frame
        horizontalHitResistance: 0.8, // decreasing of speed when hit a wall
        horizontalSpeedFactor: 0.2, // speed factor
        verticalGravity: 0.05,
        verticalAirResistance: 0.998,
        verticalHitResistance: 0.7,
        verticalSpeedFactor: 0.07
    };

    function Ball(position, velocity, radius, localDimensions, isHorizontal) {
        // constructor
        this.position = position;
        if (isHorizontal)
            this.velocity = velocity.mult(movementProperties.horizontalSpeedFactor);
        else
            this.velocity = velocity.mult(movementProperties.verticalSpeedFactor);
        this.radius = radius;
        this._localDimensions = localDimensions;
        this._isHorizontal = isHorizontal;
    }

    Ball.prototype.update = function() {
        if (this._isHorizontal)
            this.updateHorizontal();
        else
            this.updateVertical();
    }

    Ball.prototype.updateHorizontal = function() {
        if (this.velocity.isNearZero())
            return; // the ball is staying in place

        this.position = this.position.add(this.velocity);
        this.velocity = this.velocity.mult(movementProperties.horizontalAirResistance);

        if (this.position.X - this.radius <= 0 || this.position.X + this.radius >= this._localDimensions.width) {
            // move ball inside the borders
            this.position.X = (this.position.X - this.radius <= 0) ?
                                    this.radius : this._localDimensions.width - this.radius;

            // reflection angle is an inverse angle to the perpendicular axis to the wall (in this case the wall is Y axis)
            this.velocity.X = -this.velocity.X;
            this.velocity = this.velocity.mult(movementProperties.horizontalHitResistance);
        }
        if (this.position.Y - this.radius <= 0 || this.position.Y + this.radius >= this._localDimensions.height) {
            // move ball inside the borders
            this.position.Y = (this.position.Y - this.radius <= 0) ?
                                    this.radius : this._localDimensions.height - this.radius;

            // reflection angle is an inverse angle to the perpendicular axis to the wall (in this case the wall is X axis)
            this.velocity.Y = -this.velocity.Y;
            this.velocity = this.velocity.mult(movementProperties.horizontalHitResistance);
        }
    }

    Ball.prototype.updateVertical = function() {
        if (this.velocity.isNearZero())
            return; // the ball is staying in place

        this.position = this.position.add(this.velocity);
        this.velocity = this.velocity.mult(movementProperties.verticalAirResistance);
        this.velocity.Y += movementProperties.verticalGravity;

        if (this.position.X - this.radius <= 0 || this.position.X + this.radius >= this._localDimensions.width) {
            // move ball inside the borders
            this.position.X = (this.position.X - this.radius <= 0) ?
                                    this.radius : this._localDimensions.width - this.radius;

            this.velocity.X = -this.velocity.X;
        }
        if (this.position.Y - this.radius <= 0 || this.position.Y + this.radius >= this._localDimensions.height) {
            // move ball inside the borders
            this.position.Y = (this.position.Y - this.radius <= 0) ?
                                    this.radius : this._localDimensions.height - this.radius;

            this.velocity.Y = -this.velocity.Y;
            if (this.position.Y + this.radius >= this._localDimensions.height)
                this.velocity = this.velocity.mult(movementProperties.verticalHitResistance);
        }
    }

    Ball.prototype.collision = function(ball) {
        const minDistance = ball.radius + this.radius;
        const position_diff = this.position.sub(ball.position);
        const distance = position_diff.length();

        if (distance <= minDistance) {
            // the formula could be found here: https://en.wikipedia.org/wiki/Elastic_collision
            // velocityA -= (dot(velocityAB_diff, positionAB_diff) / distance^2) * positionAB_diff
            // velocityB -= (dot(velocityBA_diff, positionBA_diff) / distance^2) * positionBA_diff
            // but this thing (dot(velocityAB_diff, positionAB_diff) / distance^2) is same for 2 velocities
            // because dot and length methods are commutative properties, and velocityAB_diff = -velocityBA_diff, same for position_diff
            const coeff = this.velocity.sub(ball.velocity).dot(position_diff) / (distance * distance);
            this.velocity = this.velocity.sub(position_diff.mult(coeff));
            ball.velocity = ball.velocity.sub(position_diff.opposite().mult(coeff));

            // move balls outside of collision
            const diff = (minDistance - distance) / 2;
            this.position = this.position.add(this.velocity.normalize().mult(diff));
            ball.position = ball.position.add(ball.velocity.normalize().mult(diff));
        }
    }

    window.Ball = Ball;

}());