(function () {
    "use strict";

    /**************
    ** CONSTANTS **
    ***************/
    const localDimensions = {
        width: 100, // one localDimensions.width is 1 local unit
        height: 100 * (2/3) // the canvas ratio is always 3:2
    };
    const ballProperties = {
        radius: 1, // local units
        startAngle: 0,
        endAngle: 2 * Math.PI,
        fillStyle: "#000000"
    };
    const aimProperties = {
        maxLength: 15, // local units
        delay: 0.6,
        maxSpeed: 15 / 0.6, // local units (aimProperties.maxLength / aimProperties.delay)
        headPart: 0.2,
        strokeStyle: "#000000"
    };

    /*********************************************************************************
    ** PROPERTIES USED FOR COMUNICATION BETWEEN HELPERS, EVENTS AND UPDATE FUNCTION **
    /*********************************************************************************/
    var updateInterval, canvas, context, canvasDimensions, isLeftMouseBtnDown, newBallSpeed, balls,
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
        balls.push(new Ball(
            newBallPosition.clone(),
            newBallDirection.clone(), // must be an unit vector
            newBallSpeed,
            ballProperties.radius,
            localDimensions,
            isHorizontal,
            enabledCollisions
        ));

        // reset values
        newBallSpeed = 0;
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
        if (newBallSpeed === 0)
            return; // no direction, the mouse is in the start position

        // calculate the aim length
        var aimLength = newBallSpeed * aimProperties.delay;
        // aimLength shoud be smaller or equal to aimProperties.maxLength
        aimLength = Math.min(aimLength, aimProperties.maxLength);

        // convert start and end points in CANVAS coordinates (using scaleRatio)
        // move the start point on the ball border (using the ball direction)
        const startPoint = new Vector2d(
            (newBallPosition.X + newBallDirection.X * ballProperties.radius) * scaleRatio,
            (newBallPosition.Y + newBallDirection.Y * ballProperties.radius) * scaleRatio
        );
        const endPoint = new Vector2d(
            startPoint.X + (newBallDirection.X * aimLength) * scaleRatio,
            startPoint.Y + (newBallDirection.Y * aimLength) * scaleRatio
        );

        // calculate head strokes angle
        const headLength = (aimLength * scaleRatio) * aimProperties.headPart;
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
        mousePosition = new Vector2d(event.pageX, event.pageY);
        mousePosition.convertToLocal(dimensions);

        // check where the pointer is located
        if (mousePosition.X <= 0 || mousePosition.X >= localDimensions.width
            || mousePosition.Y <= 0 || mousePosition.Y >= localDimensions.height) {
            if (isLeftMouseBtnDown)
                addNewBall();
        } else {
            // save new ball properties on mouse down
            if (isLeftMouseBtnDown) {
                newBallDirection = mousePosition.direction(newBallPosition); // inverse direction
                newBallSpeed = newBallDirection.length(); // the speed is the distance between ball and mouse positions
                newBallDirection.toUnit();

                if (newBallSpeed === 0)
                    newBallDirection = Vector2d.zero(); // the mouse is in the start position
                // newBallSpeed shoud be smaller or equal to aimProperties.maxSpeed
                newBallSpeed = Math.min(newBallSpeed, aimProperties.maxSpeed);
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

        // check collisions (O(N^2) but this can be much faster, search in quadtree structure)
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
    function init(canvasId, dimensionsId, fps, horizontal, collisions) {
        // default values
        fps = (typeof fps === "undefined") ? 60 : fps; // 60 fps default
        isHorizontal = (typeof horizontal === "undefined") ? true : horizontal;
        enabledCollisions = (typeof collisions === "undefined") ? false : collisions;

        // init parameters
        canvas =  document.getElementById(canvasId);
        context = canvas.getContext("2d");
        canvasDimensions = document.getElementById(dimensionsId);
        isLeftMouseBtnDown = false;
        mousePosition = new Vector2d(); // X & Y should be represented with local coordinates
        newBallPosition = new Vector2d(); // X & Y should be represented with local coordinates
        newBallDirection = Vector2d.zero(); // this must be an unit vector
        newBallSpeed = 0;
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

    window.BouncingBalls = {
        init: init,
        clear: clear
    }

}());