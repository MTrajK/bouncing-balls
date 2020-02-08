var assert = require('assert');
var Vector2d = require('../src/js/vector2d.js').Vector2d;
var Balls = require('../src/js/balls.js').Balls;

describe('Balls', function() {
    const localDimensions = {
        width: 100,
        height: 100 * (2/3)
    };
    const ballRadius = 1;
    // Machine epsilon (an upper bound on the relative error due to rounding in floating point arithmetic)
    const epsilon = 0.00000001;
    function nearEqual(a, b) {
        return Math.abs(a - b) < epsilon;
    }

    describe('no collision', function() {
        it('should have the same position before and after method', function() {
            // arrange
            var oldPositionA = new Vector2d(50, 50);
            var ballA = new Balls.VerticalBall(
                oldPositionA.clone(),
                new Vector2d(10, 0),
                ballRadius,
                localDimensions
            );
            var oldPositionB = new Vector2d(60, 50);
            var ballB = new Balls.VerticalBall(
                oldPositionB.clone(),
                new Vector2d(10, 0),
                ballRadius,
                localDimensions
            );

            // act
            ballA.collision(ballB)

            // assert
            assert.equal(ballA.position.X, oldPositionA.X);
            assert.equal(ballA.position.Y, oldPositionA.Y);
            assert.equal(ballB.position.X, oldPositionB.X);
            assert.equal(ballB.position.Y, oldPositionB.Y);
        });
    });
    describe('1 moving ball collision', function() {
        it('should move the stationary ball and stop the moving ball', function() {
            // arrange
            var oldPositionA = new Vector2d(50, 50);
            var ballA = new Balls.VerticalBall(
                oldPositionA.clone(),
                new Vector2d(10, 0),
                ballRadius,
                localDimensions
            );
            var oldVelocityA = ballA.velocity.clone();
            var oldPositionB = new Vector2d(50.5, 50);
            var ballB = new Balls.VerticalBall(
                oldPositionB.clone(),
                new Vector2d(0, 0),
                ballRadius,
                localDimensions
            );
            var oldVelocityB = ballB.velocity.clone();

            // act
            ballA.collision(ballB)

            // assert
            assert.equal(nearEqual(ballA.position.X, oldPositionA.X), true);
            assert.equal(nearEqual(ballA.position.Y, oldPositionA.Y), true);
            assert.equal(nearEqual(ballA.velocity.X, oldVelocityB.X), true);
            assert.equal(nearEqual(ballA.velocity.Y, oldVelocityB.Y), true);
            assert.equal(nearEqual(ballB.position.X, oldPositionB.X), false);
            assert.equal(nearEqual(ballB.position.Y, oldPositionB.Y), true);
            assert.equal(nearEqual(ballB.velocity.X, oldVelocityA.X), true);
            assert.equal(nearEqual(ballB.velocity.Y, oldVelocityA.Y), true);
        });
    });
    describe('2 moving balls collision', function() {
        it('should change the velocity vectors of both balls', function() {
            // arrange
            var oldPositionA = new Vector2d(50, 50);
            var ballA = new Balls.VerticalBall(
                oldPositionA.clone(),
                new Vector2d(10, 0),
                ballRadius,
                localDimensions
            );
            var oldVelocityA = ballA.velocity.clone();
            var oldPositionB = new Vector2d(50.5, 50);
            var ballB = new Balls.VerticalBall(
                oldPositionB.clone(),
                new Vector2d(-7, 0),
                ballRadius,
                localDimensions
            );
            var oldVelocityB = ballB.velocity.clone();

            // act
            ballA.collision(ballB)

            // assert
            assert.equal(nearEqual(ballA.position.X, oldPositionA.X), false);
            assert.equal(nearEqual(ballA.position.Y, oldPositionA.Y), true);
            assert.equal(nearEqual(ballA.velocity.X, oldVelocityB.X), true);
            assert.equal(nearEqual(ballA.velocity.Y, oldVelocityB.Y), true);
            assert.equal(nearEqual(ballB.position.X, oldPositionB.X), false);
            assert.equal(nearEqual(ballB.position.Y, oldPositionB.Y), true);
            assert.equal(nearEqual(ballB.velocity.X, oldVelocityA.X), true);
            assert.equal(nearEqual(ballB.velocity.Y, oldVelocityA.Y), true);
        });
    });
    describe('horizontal ball moving', function() {
        it('should move the ball in direction', function() {
            // arrange
            var oldPosition = new Vector2d(50, 50);
            var oldVelocity = new Vector2d(10, 0);
            var ball = new Balls.HorizontalBall(
                oldPosition.clone(),
                oldVelocity.clone(),
                ballRadius,
                localDimensions
            );

            // act
            ball.update();

            // assert
            var direction = oldPosition.direction(ball.position).tryNormalize();
            var velocity = oldVelocity.tryNormalize();
            assert.equal(nearEqual(direction.X, velocity.X), true);
            assert.equal(nearEqual(direction.Y, velocity.Y), true);
        });
    });
    describe('horizontal ball wall collision', function() {
        it('should reflect the angle of moving and position inside borders', function() {
            // arrange
            var oldPosition = new Vector2d(99.5, 50);
            var oldVelocity = new Vector2d(10, 0);
            var ball = new Balls.HorizontalBall(
                oldPosition.clone(),
                oldVelocity.clone(),
                ballRadius,
                localDimensions
            );

            // act
            ball.update();

            // assert
            var newVelocity = ball.velocity.tryNormalize();
            oldVelocity = oldVelocity.tryNormalize();
            assert.equal(nearEqual(oldVelocity.X, -newVelocity.X), true);
            assert.equal(nearEqual(oldVelocity.Y, newVelocity.Y), true);
            assert.notEqual(oldPosition.X, ball.position.X);
            assert.equal(ball.position.X, localDimensions.width - ballRadius);
        });
    });
});