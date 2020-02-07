(function () {
    "use strict";

    /**************
    ** CONSTANTS **
    ***************/
    const localDimensions = {
        width: 100, // 1 localDimensions.width is 1 local unit
        height: 100 * (2/3) // the canvas ratio is always 3:2
    };
    const ballProperties = {
        radius: 1, // local units
        startAngle: 0,
        endAngle: 2 * Math.PI,
        fillStyle: "#000000"
    };
    const aimProperties = {
        shrink: 0.6,
        maxSpeed: 30, // local units
        headPart: 0.2,
        strokeStyle: "#000000"
    };

    /******************************************************************************************
    ** PROPERTIES USED FOR COMUNICATION BETWEEN HELPERS, EVENTS, PUBLIC AND UPDATE FUNCTIONS **
    *******************************************************************************************/
    var updateInterval, canvas, context, canvasDimensions, isLeftMouseBtnDown, balls,
        isHorizontal, enabledCollisions, mousePosition, newBallPosition, newBallDirection;

    /************
    ** HELPERS **
    *************/
    function getCanvasDimensions() {
        return {
            width: canvasDimensions.offsetWidth,
            height: canvasDimensions.offsetHeight,
            top: canvasDimensions.offsetTop,
            left: canvasDimensions.offsetLeft,
            scaleRatio: canvasDimensions.offsetWidth / localDimensions.width
        }
    }

    function addNewBall() {
        isLeftMouseBtnDown = false;

        // save the new ball
        var newBall;
        if (isHorizontal)
            newBall = new Balls.HorizontalBall(
                newBallPosition.clone(),
                newBallDirection.clone(),
                ballProperties.radius,
                localDimensions,
                isHorizontal
            );
        else
            newBall = new Balls.VerticalBall(
                newBallPosition.clone(),
                newBallDirection.clone(),
                ballProperties.radius,
                localDimensions,
                isHorizontal
            );
        balls.push(newBall);

        // reset values
        newBallDirection = Vector2d.zero();
        newBallPosition = new Vector2d();
    }

    /************
    ** DRAWING **
    *************/
    function drawBall(ballCoords, scaleRatio) {
        context.fillStyle = ballProperties.fillStyle;
        context.beginPath();
        context.arc(ballCoords.X * scaleRatio, ballCoords.Y * scaleRatio,   // convert coordinates in CANVAS size
            ballProperties.radius * scaleRatio,
            ballProperties.startAngle, ballProperties.endAngle);
        context.fill();
    }

    function drawAim(scaleRatio) {
        if (newBallDirection.isNearZero())
            return; // no direction, the mouse is in the start position

        const directionLength = newBallDirection.length();
        const radiusRatio = ballProperties.radius / directionLength;
        const scaledShrink = aimProperties.shrink * scaleRatio;

        // convert start and end points in CANVAS coordinates (using scaleRatio)
        // move the start point on the ball border (using the ball direction)
        // and adjust end point (using the start point)
        const startPoint = new Vector2d(
            (newBallPosition.X + newBallDirection.X * radiusRatio) * scaleRatio,
            (newBallPosition.Y + newBallDirection.Y * radiusRatio) * scaleRatio
        );
        const endPoint = new Vector2d(
            startPoint.X + newBallDirection.X * scaledShrink,
            startPoint.Y + newBallDirection.Y * scaledShrink
        );

        // calculate head strokes angle
        const headLength = directionLength * scaledShrink * aimProperties.headPart;
        const arrowAngle = newBallDirection.angle(); // angle between Y axis and the arrow direction
        const strokeAngle = Math.PI / 5;
        const leftStrokeAngle = arrowAngle - strokeAngle;
        const rightStrokeAngle = arrowAngle + strokeAngle;

        context.strokeStyle = aimProperties.strokeStyle;
        // draw the body
        context.moveTo(startPoint.X, startPoint.Y);
        context.lineTo(endPoint.X, endPoint.Y);
        // draw the head strokes
        context.lineTo(endPoint.X - headLength * Math.sin(leftStrokeAngle),
                        endPoint.Y - headLength * Math.cos(leftStrokeAngle));
        context.moveTo(endPoint.X, endPoint.Y);
        context.lineTo(endPoint.X - headLength * Math.sin(rightStrokeAngle),
                        endPoint.Y - headLength * Math.cos(rightStrokeAngle));
        context.stroke();
    }

    /********************
    ** EVENT LISTENERS **
    *********************/
    function onMouseMove(event) {
        var eventDoc, doc, body;

        event = event || window.event; // IE-ism

        // if pageX/Y aren't available and clientX/Y are, calculate pageX/Y - logic taken from jQuery.
        // (this is to support old IE)
        if (event.pageX == null && event.clientX != null) {
            eventDoc = (event.target && event.target.ownerDocument) || document;
            doc = eventDoc.documentElement;
            body = eventDoc.body;

            event.pageX = event.clientX +
            (doc && doc.scrollLeft || body && body.scrollLeft || 0) -
            (doc && doc.clientLeft || body && body.clientLeft || 0);
            event.pageY = event.clientY +
            (doc && doc.scrollTop  || body && body.scrollTop  || 0) -
            (doc && doc.clientTop  || body && body.clientTop  || 0 );
        }

        const dimensions = getCanvasDimensions();

        // convert mouse coordinates to local coordinates
        mousePosition = new Vector2d(event.pageX, event.pageY).convertToLocal(dimensions);

        if (isLeftMouseBtnDown) {
            // check where the pointer is located
            if (mousePosition.X <= 0 || mousePosition.X >= localDimensions.width
                || mousePosition.Y <= 0 || mousePosition.Y >= localDimensions.height) {
                addNewBall();
            } else {
                newBallDirection = mousePosition.direction(newBallPosition);

                // directionLength shoud be smaller or equal to aimProperties.maxSpeed
                var directionLength = newBallDirection.length();
                if (directionLength > aimProperties.maxSpeed)
                    newBallDirection = newBallDirection.mult(aimProperties.maxSpeed / directionLength);
            }
        }
    }

    function onMouseDown(e) {
        if (e.button === 0) { // check if the left mouse button is pressed
            isLeftMouseBtnDown = true;
            newBallPosition = mousePosition.clone();
        }
    }

    function onMouseUp() {
        if (isLeftMouseBtnDown)
            addNewBall();
    }

    /******************
    ** MAIN FUNCTION **
    *******************/
    function update() {
        /* updates the canvas in every "interval" miliseconds */

        // check dimensions and clear canvas
        // the canvas is cleared when a new value is attached to dimensions (no matter if a same value)
        const dimensions = getCanvasDimensions();
        canvas.width = dimensions.width;
        canvas.height = dimensions.height;

        // draw canvas border
        context.strokeStyle = "#000000";
        context.strokeRect(0, 0, dimensions.width, dimensions.height);

        // aiming mode
        if (isLeftMouseBtnDown) {
            // draw new ball
            drawBall(newBallPosition, dimensions.scaleRatio);
            // draw aim
            drawAim(dimensions.scaleRatio);
        }

        // update ball movement
        for (var i=0; i<balls.length; i++)
            balls[i].update();

        if (enabledCollisions)
            // check collisions 
            // O(N^2) but this can be much faster, O(N*LogN) searching in quadtree structure, (or sort the points and check the closest O(N*LogN))
            for (var i=0; i<balls.length; i++)
                for (var j=i+1; j<balls.length; j++)
                    balls[i].collision(balls[j]);

        // draw updated balls
        for (var i=0; i<balls.length; i++)
            drawBall(balls[i].position, dimensions.scaleRatio);
    }

    /*********************
    ** PUBLIC FUNCTIONS **
    **********************/
    function init(canvasId, dimensionsId, horizontal, collisions, fps) {
        // default values
        isHorizontal = (typeof horizontal === "undefined") ? true : horizontal;
        enabledCollisions = (typeof collisions === "undefined") ? false : collisions;
        fps = (typeof fps === "undefined") ? 60 : fps; // 60 fps default

        // init parameters
        canvas =  document.getElementById(canvasId);
        context = canvas.getContext("2d");
        canvasDimensions = document.getElementById(dimensionsId);
        isLeftMouseBtnDown = false;
        mousePosition = new Vector2d(); // X & Y should be represented with local coordinates
        newBallPosition = new Vector2d(); // X & Y should be represented with local coordinates
        newBallDirection = Vector2d.zero();
        balls = [];

        // add event listeners
        document.addEventListener("mousemove", onMouseMove);
        canvas.addEventListener("mousedown", onMouseDown);
        canvas.addEventListener("mouseup", onMouseUp);

        // set interval
        const intervalMs = 1000 / fps; // interval in milliseconds
        updateInterval = setInterval(update, intervalMs);
    }

    function clear() {
        // remove event listeners
        document.removeEventListener("mousemove", onMouseMove);
        canvas.removeEventListener("mousedown", onMouseDown);
        canvas.removeEventListener("mouseup", onMouseUp);

        // clear interval
        clearInterval(updateInterval);

        // clear canvas
        canvas.width = canvas.height = 0;
    }

    /* Save these functions as global, no need from looking for the root because this script must run in browser */
    window.BouncingBalls = {
        init: init,
        clear: clear
    };

}());