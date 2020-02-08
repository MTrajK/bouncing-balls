(function () {
    'use strict';

    var simulation = document.getElementById('simulation');
    var choices = document.getElementById('choices');
    var horizontalDirection = document.getElementById('horizontal');
    var enableCollisions = document.getElementById('enable');

    document.getElementById('start').addEventListener('click', function(){
        choices.style.display = 'none';
        simulation.style.display = 'block';
        // start simulation
        window.BouncingBalls.init('canvas', 'dimensions', horizontalDirection.checked, enableCollisions.checked);
    });
    document.getElementById('back').addEventListener('click', function(){
        choices.style.display = 'block';
        simulation.style.display = 'none';
        // end simulation
        window.BouncingBalls.clear();
    });

}());