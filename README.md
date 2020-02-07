# Bouncing Balls

Simple bouncing balls physic using JS canvas API.
Plain CSS and JS will be used. (without third-part frameworks/code)

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
- Add 2 checkboxes on the first screen (one for vertical/horizontal space, and one for collisions, 4 possible combinations) and control this from another script.
- Use inheritance for the diferent bouncing?