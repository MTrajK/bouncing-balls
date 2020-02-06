(function () {
    "use strict";

    /**************
    ** CONSTANTS **
    ***************/
    const aimProperties = {
        maxLength: 15, // local units
        delay: 0.6,
        headPart: 0.2,
        strokeStyle: "#000000"
    };
    const ballProperties = {
        radius: 1, // local units
        startAngle: 0,
        endAngle: 2 * Math.PI,
        fillStyle: "#000000"
    };
    const movementProperties = {
        maxSpeed: aimProperties.maxLength / aimProperties.delay, // local units
        horizontalAirResistance: 0.005, // decreasing of speed in each frame
        horizontalHitResistance: 0.1, // decreasing of speed when hit a wall
        horizontalSpeedFactor: 0.1, // speed factor
        gravity: 9.8 // passed local units in one second
    };

    /*********************************************************************************
    ** PROPERTIES USED FOR COMUNICATION BETWEEN HELPERS, EVENTS AND UPDATE FUNCTION **
    /*********************************************************************************/
    var updateInterval, canvas, context, canvasDimensions, isLeftMouseBtnDown, newBallSpeed, balls,
        isHorizontal, enabledCollisions, localDimensions, mouseCoords, newBallCoords, newBallDirection;

    /************
    ** HELPERS **
    *************/
    function getCanvasDimensions() {
        const width = canvasDimensions.offsetWidth;
        const height = canvasDimensions.offsetHeight;
        const top = canvasDimensions.offsetTop;
        const left = canvasDimensions.offsetLeft;
        const bottom = top + height;
        const right = left + width;
        const scalePercent = width / localDimensions.width;

        return {
            width: width,
            height: height,
            top: top,
            bottom: bottom,
            left: left,
            right: right,
            scalePercent: scalePercent
        }
    }

    function addNewBall() {
        isLeftMouseBtnDown = false;

        // save ball
        balls.push({
            coords: newBallCoords.clone(),
            direction: newBallDirection.clone(), // unit vector
            speed: newBallSpeed * movementProperties.horizontalSpeedFactor
        });

        // reset values
        newBallSpeed = 0;
        newBallDirection = Vector2d.zero();
        newBallCoords = new Vector2d();
    }

    /************
    ** DRAWING **
    *************/
    function drawBall(ballCoords, scalePercent) {
        context.fillStyle = ballProperties.fillStyle;
        context.beginPath();
        context.arc(ballCoords.X * scalePercent, ballCoords.Y * scalePercent,   // convert coordinates in CANVAS size
            ballProperties.radius * scalePercent,
            ballProperties.startAngle, ballProperties.endAngle);
        context.fill();
    }

    function drawAim(scalePercent) {
        // convert start and end points in CANVAS coordinates
        var aimLength = newBallSpeed * aimProperties.delay;
        if (aimLength > aimProperties.maxLength)
            aimLength = aimProperties.maxLength;

        const startPoint = new Vector2d(
            (newBallCoords.X + newBallDirection.X * ballProperties.radius) * scalePercent,
            (newBallCoords.Y + newBallDirection.Y * ballProperties.radius) * scalePercent
        );
        const endPoint = new Vector2d(
            startPoint.X + (newBallDirection.X * aimLength) * scalePercent,
            startPoint.Y + (newBallDirection.Y * aimLength) * scalePercent
        );

        // compute head strokes angle
        const headLength = (aimLength * scalePercent) * aimProperties.headPart; // same as startPoint.distance(endPoint) * aimProperties.headPart
        const dx = endPoint.X - startPoint.X;
        const dy = endPoint.Y - startPoint.Y;
        const angle = Math.atan2(dy, dx);

        // draw the arrow
        context.strokeStyle = aimProperties.strokeStyle;
        // draw the body
        context.moveTo(startPoint.X, startPoint.Y);
        context.lineTo(endPoint.X, endPoint.Y);
        // draw the head
        context.lineTo(endPoint.X - headLength * Math.cos(angle - Math.PI / 6),
                        endPoint.Y - headLength * Math.sin(angle - Math.PI / 6));
        context.moveTo(endPoint.X, endPoint.Y);
        context.lineTo(endPoint.X - headLength * Math.cos(angle + Math.PI / 6),
                        endPoint.Y - headLength * Math.sin(angle + Math.PI / 6));
        context.stroke();
    }

    function updateBallHorizontalSpace(idx) {
        balls[idx].coords.X += balls[idx].direction.X * balls[idx].speed;
        balls[idx].coords.Y += balls[idx].direction.Y * balls[idx].speed;

        balls[idx].speed -= movementProperties.horizontalAirResistance;

        if (balls[idx].coords.X - ballProperties.radius <= 0 || balls[idx].coords.X + ballProperties.radius >= localDimensions.width) {
            // move ball inside the borders
            balls[idx].coords.X = (balls[idx].coords.X - ballProperties.radius <= 0) ?
                                    ballProperties.radius : localDimensions.width - ballProperties.radius;

            balls[idx].direction.X = -balls[idx].direction.X;
            // TODO: smaller angle -> smaller hit resistance???
            balls[idx].speed -= movementProperties.horizontalHitResistance;
        }
        if (balls[idx].coords.Y - ballProperties.radius <= 0 || balls[idx].coords.Y + ballProperties.radius >= localDimensions.height) {
            // move ball inside the borders
            balls[idx].coords.Y = (balls[idx].coords.Y - ballProperties.radius <= 0) ?
                                    ballProperties.radius : localDimensions.height - ballProperties.radius;

            balls[idx].direction.Y = -balls[idx].direction.Y;
            // TODO: smaller angle -> smaller hit resistance???
            balls[idx].speed -= movementProperties.horizontalHitResistance;
        }

        if (balls[idx].speed < 0)
            balls[idx].speed = 0;
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

        // convert to local coordinates
        const dimensions = getCanvasDimensions();

        mouseCoords = new Vector2d(event.pageX, event.pageY);
        mouseCoords.convertToLocal(dimensions);

        // check where the pointer is located
        if (mouseCoords.X <= 0 || mouseCoords.X >= localDimensions.width
            || mouseCoords.Y <= 0 || mouseCoords.Y >= localDimensions.height) {
            if (isLeftMouseBtnDown)
                addNewBall();
        } else {
            // save new ball properties on mouse down
            if (isLeftMouseBtnDown) {
                // make the direction an unit vector
                newBallSpeed = newBallCoords.distance(mouseCoords);
                newBallDirection = new Vector2d(
                    (newBallCoords.X - mouseCoords.X) / newBallSpeed,
                    (newBallCoords.Y - mouseCoords.Y) / newBallSpeed
                );

                if (newBallSpeed == 0)
                    newBallDirection = Vector2d.zero();
                if (newBallSpeed > movementProperties.maxSpeed)
                    newBallSpeed = movementProperties.maxSpeed;
            }
        }
    }

    function onMouseDown(e) {
        if (e.button === 0) { // check if the left mouse button is pressed
            isLeftMouseBtnDown = true;
            newBallCoords = mouseCoords.clone();
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
            // draw ball
            drawBall(newBallCoords, dimensions.scalePercent);
            // draw aim
            drawAim(dimensions.scalePercent);
        }

        for (var i=0; i<balls.length; i++) {
            // update ball
            updateBallHorizontalSpace(i);
            // draw updated ball
            drawBall(balls[i].coords, dimensions.scalePercent);
        }

        // TODO: Check collisions
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
        localDimensions = {
            width: 100, // one localDimensions.width is 1 local unit
            height: canvasDimensions.offsetHeight / (canvasDimensions.offsetWidth / 100)
        };
        mouseCoords = new Vector2d(); // X & Y should be represented with local coordinates
        newBallCoords = new Vector2d(); // X & Y should be represented with local coordinates
        newBallDirection = Vector2d.zero(); // this must be an unit vector
        newBallSpeed = 0;
        balls = [];

        // add event listeners
        document.addEventListener("mousemove", onMouseMove);
        canvas.addEventListener("mousedown", onMouseDown);
        canvas.addEventListener("mouseup", onMouseUp);

        // set interval
        const intervalMs = 1000 / fps; // interval in miliseconds
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