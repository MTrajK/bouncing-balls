(function(){
    'use strict';

    /*********************************************************
        Notes about the physics in the simulations:
        The balls are equally hard (and have equal weight), so they don't lose energy when bouncing between themself.
        In the horizontal simulation, a ball loses energy when bouncing from a wall (the wall is harder and stationary) and air resistence.
        The ball also loses energy from the air resistence, hitting the ground, rolling on the ground and gravity in the vertical simulation
        (but not from spinning and some other 3d things possible in billiard and basketball).

        Known issue:
        In "vertical" space/direction when the bottom is full with balls (when there is no space for a new ball)
        adding a new ball will make all balls go crazy (jumping randomly). This is because the balls will always
        collide and won't lose energy from colliding (I'm not sure how to solve this).
    *********************************************************/

    /**************
     * Ball class *
    ***************/
    function Ball(position, velocity, radius, localDimensions) {
        // base constructor
        this.position = position;
        this.velocity = velocity;
        this.radius = radius;
        this._borderCoords = {
            top: radius,
            bottom: localDimensions.height - radius,
            left: radius,
            right: localDimensions.width - radius
        };
    }

    function moveBallsOutOfCollision(ball1, ball2) {
        /*********************************************************
            Find the positions of the balls when the collision occurred.
            (because right they have collided - they're overlapping)

            old ball1.position = ball1.position - T * ball1.velocity
            old ball2.position = ball2.position - T * ball2.velocity

            In this moment T is unknown. Solve this equation to find T:
            distance(old ball1.position, old ball2.position) = (ball1.radius + ball2.radius)

            This can be solved using the Quadratic formula, because after simplifying
            the left side of the equation we'll get something like: a*(T^2) + b*T + c = 0
        *********************************************************/
        var v = ball1.velocity.sub(ball2.velocity);
        var p = ball1.position.sub(ball2.position);
        var r = ball1.radius + ball2.radius;

        // quadratic formula coeficients
        var a = v.X*v.X + v.Y*v.Y;
        var b = (-2)*(p.X*v.X + p.Y*v.Y);
        var c = p.X*p.X + p.Y*p.Y - r*r;

        // quadratic formula discriminant
        var d = b*b - 4*a*c;

        // t1 and t2 from the quadratic formula (need only the positive solution)
        var t = (-b - Math.sqrt(d)) / (2*a);
        if (t < 0)
            t = (-b + Math.sqrt(d)) / (2*a);

        // calculate the old positions (positions when the collision occurred)
        var oldPosition1 = ball1.position.sub(ball1.velocity.mult(t));
        var oldPosition2 = ball2.position.sub(ball2.velocity.mult(t));

        var maxChange = ball1.radius * 3;

        if ((a == 0) || (d < 0) ||
            (oldPosition1.distance(ball1.position) > maxChange) ||
            (oldPosition2.distance(ball2.position) > maxChange)) {
            // 1) if 'a' is zero then both balls have equal velocities, no solution
            // 2) the discriminant shouldn't be negative in this simulation, but just in case check it
            // 3) the chages are too big, something is wrong

            if (ball1.position.distance(ball2.position) == 0) {
                // move only one ball up
                ball1.position = ball1.position.add(new Vector2D(0, -r));
            } else {
                // move both balls using the vector between these positions
                var diff = (r - ball1.position.distance(ball2.position)) / 2;
                ball1.position = ball1.position.add(ball1.position.sub(ball2.position).tryNormalize().mult(diff));
                ball2.position = ball2.position.add(ball2.position.sub(ball1.position).tryNormalize().mult(diff));
            }
        } else {
            // use the old positions
            ball1.position = oldPosition1;
            ball2.position = oldPosition2;
        }
    }

    Ball.prototype.collision = function(ball) {
        if (this.position.distance(ball.position) <= ball.radius + this.radius) {
            moveBallsOutOfCollision(this, ball);

            var positionSub = this.position.sub(ball.position);
            var distance = positionSub.length();

            /*********************************************************
                The formula could be found here: https://en.wikipedia.org/wiki/Elastic_collision
                velocityA -= (dot(velocityAB_sub, positionAB_sub) / distance^2) * positionAB_sub
                velocityB -= (dot(velocityBA_sub, positionBA_sub) / distance^2) * positionBA_sub
                but this thing (dot(velocityAB_sub, positionAB_sub) / distance^2) is same for 2 velocities
                because dot and length methods are commutative properties, and velocityAB_sub = -velocityBA_sub, same for positionSub
            *********************************************************/
            var coeff = this.velocity.sub(ball.velocity).dot(positionSub) / (distance * distance);
            this.velocity = this.velocity.sub(positionSub.mult(coeff));
            ball.velocity = ball.velocity.sub(positionSub.opposite().mult(coeff));
        }
    }

    /************************
     * HorizontalBall class *
    *************************/
    var horizontalMovementProperties = {
        airResistance: 0.99, // slows down the speed in each frame
        hitResistance: 0.8, // slows down the speed when a wall is hitted
        velocityFactor: 0.2 // velocity factor (converts vector from the mouse dragging to this environment)
    };

    function HorizontalBall(position, velocity, radius, localDimensions) {
        // HorizontalBall constructor
        // call the base constructor
        Ball.call(this, position, velocity.mult(horizontalMovementProperties.velocityFactor), radius, localDimensions);
    }

    // HorizontalBall inherits from the Ball class
    HorizontalBall.prototype = Object.create(Ball.prototype);
    HorizontalBall.prototype.constructor = HorizontalBall; // keep the constructor

    HorizontalBall.prototype.move = function() {
        if (this.velocity.isNearZero() && !this.velocity.isZero())
            this.velocity = Vector2D.zero(); // the ball is staying in place

        // move the ball using the velocity
        this.position = this.position.add(this.velocity);

        if (this.position.X <= this._borderCoords.left || this.position.X >= this._borderCoords.right) {
            // move ball inside the borders
            this.position.X = (this.position.X <= this._borderCoords.left) ?
                                this._borderCoords.left : this._borderCoords.right;

            // apply hit resistance
            this.velocity = this.velocity.mult(horizontalMovementProperties.hitResistance);

            // reflection angle is an inverse angle to the perpendicular axis to the wall (in this case the wall is Y axis)
            this.velocity.X = -this.velocity.X;
        }
        if (this.position.Y <= this._borderCoords.top || this.position.Y >= this._borderCoords.bottom) {
            // move ball inside the borders
            this.position.Y = (this.position.Y <= this._borderCoords.top) ?
                                this._borderCoords.top : this._borderCoords.bottom;

            // apply hit resistance
            this.velocity = this.velocity.mult(horizontalMovementProperties.hitResistance);

            // reflection angle is an inverse angle to the perpendicular axis to the wall (in this case the wall is X axis)
            this.velocity.Y = -this.velocity.Y;
        }

        // apply air resistance
        this.velocity = this.velocity.mult(horizontalMovementProperties.airResistance);
    }

    /**********************
     * VerticalBall class *
    ***********************/
    var verticalMovementProperties = {
        airResistance: 0.995, // slows down the speed in each frame
        hitResistance: 0.8, // slows down the Y speed when the surface is hitted
        rollingResistance: 0.98, // slows down the X speed when rolling on the ground
        gravity: 0.05, // pulls the ball to the ground in each frame
        velocityFactor: 0.07 // velocity factor (converts vector from the mouse dragging to this environment)
    };

    function VerticalBall(position, velocity, radius, localDimensions) {
        // VerticalBall constructor
        // call the base constructor
        Ball.call(this, position, velocity.mult(verticalMovementProperties.velocityFactor), radius, localDimensions);
    }

    // VerticalBall inherits from the Ball class
    VerticalBall.prototype = Object.create(Ball.prototype);
    VerticalBall.prototype.constructor = VerticalBall; // keep the constructor

    VerticalBall.prototype.move = function() {
        if (this.velocity.isNearZero() && this.position.Y == this._borderCoords.bottom && !this.velocity.isZero())
            this.velocity = Vector2D.zero(); // the ball is staying in place

        // move the ball using the velocity
        this.position = this.position.add(this.velocity);

        if (this.position.X <= this._borderCoords.left || this.position.X >= this._borderCoords.right) {
            // move ball inside the borders
            this.position.X = (this.position.X <= this._borderCoords.left) ?
                                this._borderCoords.left : this._borderCoords.right;

            // reflection
            this.velocity.X = -this.velocity.X;
        }
        if (this.position.Y <= this._borderCoords.top || this.position.Y >= this._borderCoords.bottom) {
            // move ball inside the borders
            this.position.Y = (this.position.Y <= this._borderCoords.top) ?
                                this._borderCoords.top : this._borderCoords.bottom;

            if (this.position.Y == this._borderCoords.bottom) {
                // when ball is on the ground, update resistances
                this.velocity.Y *= verticalMovementProperties.hitResistance;
                this.velocity.X *= verticalMovementProperties.rollingResistance;
            }

            // reflection
            this.velocity.Y = -this.velocity.Y;
        }

        // apply air resistance
        this.velocity = this.velocity.mult(verticalMovementProperties.airResistance);

        if (this.position.Y == this._borderCoords.bottom && Math.abs(this.velocity.Y) <= Vector2D.NEAR_ZERO)
            // the ball isn't falling or jumping
            this.velocity.Y = 0;
        else
            // apply gravity if falling or jumping
            this.velocity.Y += verticalMovementProperties.gravity;
    }

    /* Save these classes as global */
    var Balls = {
        HorizontalBall: HorizontalBall,
        VerticalBall: VerticalBall
    };

    // Establish the root object, `window` (`self`) in the browser, `global`
    // on the server, or `this` in some virtual machines.
    var root = typeof self == 'object' && self.self === self && self ||
            typeof global == 'object' && global.global === global && global ||
            this || {};

    // Export the Balls object for **Node.js**, with
    // backwards-compatibility for their old module API. If we're in
    // the browser, add Balls as a global object.
    // (`nodeType` is checked to ensure that `module`
    // and `exports` are not HTML elements.)
    if (typeof exports != 'undefined' && !exports.nodeType) {
        if (typeof module != 'undefined' && !module.nodeType && module.exports) {
            exports = module.exports = Balls;
        }
        exports.Balls = Balls;
    } else {
        root.Balls = Balls;
    }

}());