var assert = require('assert');
var Vector2D = require('../src/js/vector2d.js');

describe('Vector2D', function() {
    describe('empty vector constructor', function() {
        it('should return vector with undefined X and Y coordinates', function() {
            var vector = new Vector2D();
            assert.equal(typeof(vector.X), "undefined");
            assert.equal(typeof(vector.Y), "undefined");
        });
    });
    describe('vector constructor', function() {
        it('should return vector with defined X and Y coordinates', function() {
            var X = 2;
            var Y = 3;
            var vector = new Vector2D(X, Y);
            assert.equal(vector.X, X);
            assert.equal(vector.Y, Y);
        });
    });
    describe('zero vector', function() {
        it('should return vector with X and Y equal to 0', function() {
            var vector = Vector2D.zero();
            assert.equal(vector.X, 0);
            assert.equal(vector.Y, 0);
        });
    });
    describe('clone vector', function() {
        it('should return vector with equal coordinates but different reference', function() {
            var X = 5;
            var Y = 1;
            var vector = new Vector2D(X, Y);
            var clone = vector.clone();
            assert.equal(clone.X, X);
            assert.equal(clone.Y, Y);
            assert.equal(vector === clone, false);
        });
    });
    describe('vector length', function() {
        it('should return 1 because all 4 combinations are unit vectors', function() {
            assert.equal(new Vector2D(1, 0).length(), 1); // X axis positive
            assert.equal(new Vector2D(-1, 0).length(), 1); // X axis negative
            assert.equal(new Vector2D(0, 1).length(), 1); // Y axis positive
            assert.equal(new Vector2D(0, -1).length(), 1); // Y axis negative
        });
    });
    describe('normalize vector', function() {
        it('should return 1 or -1 because all 4 combinations are axis vectors', function() {
            assert.equal(new Vector2D(5, 0).tryNormalize().X, 1); // X axis positive
            assert.equal(new Vector2D(-8, 0).tryNormalize().X, -1); // X axis negative
            assert.equal(new Vector2D(0, 12).tryNormalize().Y, 1); // Y axis positive
            assert.equal(new Vector2D(0, -1).tryNormalize().Y, -1); // Y axis negative
        });
    });
    describe('vector angle ', function() {
        it('should return the same value because the pairs have same unit vector and all 4 combinations are axis vectors', function() {
            assert.equal(new Vector2D(12, 0).angle(), new Vector2D(17, 0).angle()); // X axis positive
            assert.equal(new Vector2D(-31, 0).angle(), new Vector2D(-4, 0).angle()); // X axis negative
            assert.equal(new Vector2D(0, 12).angle(), new Vector2D(0, 3).angle()); // Y axis positive
            assert.equal(new Vector2D(0, -1).angle(), new Vector2D(0, -45).angle()); // Y axis negative
        });
    });
    describe('is near zero vector', function() {
        it('should return true if the abs of the nonzero constant is smaller than NEAR_ZERO', function() {
            assert.equal(new Vector2D(0.009, 0).isNearZero(), true);
            assert.equal(new Vector2D(-0.005, 0).isNearZero(), true);
            assert.equal(new Vector2D(0.02, 0).isNearZero(), false);
            assert.equal(new Vector2D(-0.011, 0).isNearZero(), false);
            assert.equal(new Vector2D(0, 0.0003).isNearZero(), true);
            assert.equal(new Vector2D(0, -0.00999).isNearZero(), true);
            assert.equal(new Vector2D(0, 0.01111).isNearZero(), false);
            assert.equal(new Vector2D(0, -0.02).isNearZero(), false);
        });
    });
});