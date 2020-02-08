# Bouncing Balls

Simple bouncing balls simulation using plain JavaScript.
Drawing in HTML Canvas, also plain CSS is used. (without third-part frameworks/code)

**[Try it here](https://mtrajk.github.io/bouncing-balls/)**

<p align="center">
    <img src="https://raw.githubusercontent.com/MTrajK/bouncing-balls/master/images/smaller_screen.gif" width="600" title="simulation">
</p>


## Description

- With a mouse click on the canvas a new ball is created, aim with holding the mouse down and moving it (drag the mouse further from the start point for greater speed), shoot the new ball with releasing the mouse button.
- The canvas is updated (redrawn) 60 times in 1 second. (60 fps)
- The canvas is responsive, with help from CSS media queries.
- Because of that, the whole physics engine (all maths and logics inside) works with local coordinates/units. The local width is always 100 local units, and the height is always 66.6667 local units. (because the canvas ratio is 3:2)
- The simulation is not a 100% real-world simulation, because there are many more factors for moving/colliding in the real world like the ball spinning, the softness of balls, the type of walls, even the weather, and sound waves have influence in the real world.
- More description of the physics you can find inside the code, for example, when the balls collide these formulas are used, [link](https://en.wikipedia.org/wiki/Elastic_collision).


## Repo structure

- [images](images) - several gifs from the simulations
- [test](test) - unit tests. [Mocha](https://mochajs.org/) framework used for unit testing. How to run these tests using Mocha:
    * install [NodeJS](https://nodejs.org/)
    * install mocha in this project ``npm install mocha``
    * run the tests from this project ``npm test``
- [src](src) - the source code of the application


## License

This project is licensed under the MIT - see the [LICENSE](LICENSE) file for details