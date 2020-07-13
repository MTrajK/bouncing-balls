# Bouncing Balls

Simple bouncing balls simulation using plain JavaScript.
Drawing in HTML Canvas, also plain CSS is used. (without third-part frameworks/code)

**[Try it here](https://mtrajk.github.io/bouncing-balls/)**

<p align="center">
    <img src="https://raw.githubusercontent.com/MTrajK/bouncing-balls/master/images/smaller_screen.gif" width="800px" title="simulation">
</p>


## Description

- With a mouse click on the canvas a new ball is created, aim with holding the mouse down and moving it (drag the mouse further from the start point for greater speed), shoot the new ball with releasing the mouse button. (also touch screens/devices are supported, the same rules are used for touch events)
- The canvas is updated (redrawn) 60 times in 1 second. (60 fps)
- The canvas is responsive, with help from CSS media queries.
- Because of that, the whole physics engine (all maths and logics inside) works with local coordinates/units. The local width is always 100 local units, and the height is always 66.6667 local units. (because the canvas ratio is 3:2)
- The simulation is not a 100% real-world simulation, because there are many more factors for moving/colliding in the real world like the ball spinning, the softness of balls, the type of walls, even the weather, and sound waves have influence in the real world.
- More description of the physics you can find inside the code, for example, when the balls collide these formulas are used, [link](https://en.wikipedia.org/wiki/Elastic_collision).
- Known issue: In "vertical" space/direction when the bottom is full with balls (when there is no space for a new ball) adding a new ball will make all balls go crazy (jumping randomly). This is because the balls will always collide and won't lose energy from colliding (at this moment I'm not sure how to solve this).


## Repo structure

- [images](images) - several gifs from the simulations
- [test](test) - unit tests, [Mocha](https://mochajs.org/) framework is used for unit testing.This is how to run these tests using Mocha:
    * install [NodeJS](https://nodejs.org/)
    * install mocha in this project ``npm install mocha``
    * run the tests from this project ``npm test``
- [src](src) - the source code of the application
    * [index.html](https://github.com/MTrajK/bouncing-balls/tree/master/src/index.html) - a simple HTML page, JS and CSS files are imported and the choices and canvas are defined here
    * [css/styles.css](https://github.com/MTrajK/bouncing-balls/tree/master/src/css/styles.css) - used to define media queries (for responsiveness), and other very simple CSS rules
    * [js/choice.js](https://github.com/MTrajK/bouncing-balls/tree/master/src/js/choice.js) - used to initialize and stop the simulation (using the values from the choices)
    * [js/bouncing-balls.js](https://github.com/MTrajK/bouncing-balls/tree/master/src/js/bouncing-balls.js) - handles the screen interaction (mouse and touch events) and draws in the canvas (some kind of mini game engine)
    * [js/balls.js](https://github.com/MTrajK/bouncing-balls/tree/master/src/js/balls.js) - balls collision and movement logics/physics
    * [js/vector2d.js](https://github.com/MTrajK/bouncing-balls/tree/master/src/js/vector2d.js) - 2 dimensional vector class, all vector related things are located here


## License

This project is licensed under the MIT - see the [LICENSE](LICENSE) file for details