# Bouncing Balls

Simple bouncing balls physic using JS canvas API.
Plain CSS and JS will be used. (without third-part frameworks/code)

## Ideas

- Redraw/update the canvas on intervals. (let's say frames per seconds 60)
    * Use SetInterval method
- Make the canvas responsive, when resizing the window the balls should resize and the location should be the same inside the canvas:
    * Use CSS media queries for responsivnest
    * Use local coordinates for the balls
- The random shoting is too easy, make an aim (pointing arrow, inverse from pulling).
    * Handle mouse moving, mouse up and mouse down