# Bouncing Balls

Simple bouncing balls physics using plain JavaScript.
Drawing in HTML Canvas, also plain CSS is used. (without third-part frameworks/code)

## Ideas

- Redraw/update the canvas on intervals. (let's say frames per seconds 60) - **DONE**
    * Use SetInterval method
- Make the canvas responsive, when resizing the window the balls should resize and the location should be the same inside the canvas. - **DONE**
    * Use CSS media queries for responsivnest
    * Use local coordinates for the balls
- The random shoting is too easy, make an aim (pointing arrow, inverse from pulling). - **DONE**
    * Handle mouse moving, mouse up and mouse down
- Add logic for vertical space bouncing. - **DONE**
- Add logic for collisions. - **DONE**
- Use inheritance for the diferent bouncing - **DONE**
- Add 2 checkboxes on the first screen (one for vertical/horizontal space, and one for collisions, 4 possible combinations) and control this from another script. - **DONE**
- Make unit tests. Using Mocha framework (rung -> npm test). - **DONE**
- Simulation available on gh pages.

- how to run tests using mocha:
    1. instal node js
    2. install mocha in the project -> npm install mocha
    3. run tests from this project -> npm test