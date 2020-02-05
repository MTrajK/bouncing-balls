(function (global) {

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
    let updateInterval, canvas, context, canvasDimensions, intervalMs, isLeftMouseBtnDown, newBallSpeed, balls, isHorizontal, enabledCollisions;
    let localDimensions = { // one localDimensions.width is one local unit
        width: undefined,
        height: undefined
    };
    let mouseCoords = { // X & Y are represented with local units
        X: undefined,
        Y: undefined
    };
    let newBallCoords = { // X & Y are represented with local units
        X: undefined,
        Y: undefined
    };
    let newBallDirection = { // this is an unit vector
        X: undefined,
        Y: undefined
    };

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

    function convertToLocalCoordinates(coords, dimensions) {
        return {
            X: (coords.X - dimensions.left) / dimensions.scalePercent,
            Y: (coords.Y - dimensions.top) / dimensions.scalePercent
        }
    }

    function euclideanDistance(ptA, ptB) {
        const X = ptA.X - ptB.X;
        const Y = ptA.Y - ptB.Y;

        return Math.sqrt(X*X + Y*Y);
    }

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
        let aimLength = newBallSpeed * aimProperties.delay;
        if (aimLength > aimProperties.maxLength)
            aimLength = aimProperties.maxLength;

        const startPoint = {
            X: (newBallCoords.X + newBallDirection.X * ballProperties.radius) * scalePercent,
            Y: (newBallCoords.Y + newBallDirection.Y * ballProperties.radius) * scalePercent
        }
        const endPoint = {
            X: startPoint.X + (newBallDirection.X * aimLength) * scalePercent,
            Y: startPoint.Y + (newBallDirection.Y * aimLength) * scalePercent
        }

        // compute head strokes angle
        const headLength = (aimLength * scalePercent) * aimProperties.headPart; // same as euclideanDistance(startPoint, endPoint) * aimProperties.headPart
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

    function shot() {
        isLeftMouseBtnDown = false;

        // save ball
        balls.push({
            coords: {
                X: newBallCoords.X,
                Y: newBallCoords.Y
            },
            direction: { // unit vector
                X: newBallDirection.X,
                Y: newBallDirection.Y
            },
            speed: newBallSpeed * movementProperties.horizontalSpeedFactor
        });

        // reset coordinates
        newBallSpeed = 0;
        newBallDirection.X = newBallDirection.Y = 0;
        newBallCoords.X = newBallCoords.Y = undefined;
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
            balls[idx].speed -= movementProperties.horizontalHitResistance;
        }
        if (balls[idx].coords.Y - ballProperties.radius <= 0 || balls[idx].coords.Y + ballProperties.radius >= localDimensions.height) {
            // move ball inside the borders
            balls[idx].coords.Y = (balls[idx].coords.Y - ballProperties.radius <= 0) ?
                                    ballProperties.radius : localDimensions.height - ballProperties.radius;

            balls[idx].direction.Y = -balls[idx].direction.Y;
            balls[idx].speed -= movementProperties.horizontalHitResistance;
        }

        if (balls[idx].speed < 0)
            balls[idx].speed = 0;
    }

    function updateBallVerticalSpace(idx, dimensions) {
        // TODO: Add vertical space logic
    }

    /********************
    ** EVENT LISTENERS **
    *********************/
    function onMouseMove(event) {
        let eventDoc, doc, body;

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
        const coords = {
            X: event.pageX,
            Y: event.pageY
        };
        const localCoords = convertToLocalCoordinates(coords, dimensions);
        mouseCoords.X = localCoords.X;
        mouseCoords.Y = localCoords.Y;

        // check where the pointer is located
        if (mouseCoords.X <= 0 || mouseCoords.X >= localDimensions.width
            || mouseCoords.Y <= 0 || mouseCoords.Y >= localDimensions.height) {
            if (isLeftMouseBtnDown)
                shot();
        } else {
            // save new ball properties on mouse down
            if (isLeftMouseBtnDown) {
                // make the direction an unit vector
                newBallSpeed = euclideanDistance(newBallCoords, mouseCoords);
                newBallDirection.X = (newBallCoords.X - mouseCoords.X) / newBallSpeed;
                newBallDirection.Y = (newBallCoords.Y - mouseCoords.Y) / newBallSpeed;

                if (newBallSpeed == 0)
                    newBallDirection.X = newBallDirection.Y = 0;
                if (newBallSpeed > movementProperties.maxSpeed)
                    newBallSpeed = movementProperties.maxSpeed;
            }
        }
    }

    function onMouseDown(e) {
        if (e.button === 0) { // check if the left mouse button is pressed
            isLeftMouseBtnDown = true;
            newBallCoords.X = mouseCoords.X;
            newBallCoords.Y = mouseCoords.Y;
        }
    }

    function onMouseUp() {
        if (isLeftMouseBtnDown)
            shot();
    }

    /******************
    ** MAIN FUNCTION **
    *******************/
    function update() {
        /* updates the canvas in every "interval" miliseconds */

        // check dimensions and clear canvas
        const dimensions = getCanvasDimensions();

        if (canvas.width != dimensions.width) {
            canvas.width = dimensions.width;
            canvas.height = dimensions.height;
        } else {
            context.clearRect(0, 0, dimensions.width, dimensions.height);
        }

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

        for (let i=0; i<balls.length; i++) {
            // update ball
            if (isHorizontal)
                updateBallHorizontalSpace(i);
            else
                updateBallVerticalSpace(i, dimensions);
            // draw updated ball
            drawBall(balls[i].coords, dimensions.scalePercent);
        }

        // TODO: Check collisions
    }

    /*********************
    ** PUBLIC FUNCTIONS **
    **********************/
    function init(canvasId, dimensionsId, fps, horizontal, collisions) {
        fps = fps || 60; // 60 fps default
        isHorizontal = horizontal || true;
        enabledCollisions = collisions || false;

        // init parameter
        canvas =  document.getElementById(canvasId);
        context = canvas.getContext("2d");
        canvasDimensions = document.getElementById(dimensionsId);
        intervalMs = 1000 / fps;
        isLeftMouseBtnDown = false;
        localDimensions.width = 100;
        localDimensions.height = canvasDimensions.offsetHeight / (canvasDimensions.offsetWidth / 100);
        mouseCoords.X = mouseCoords.Y = undefined;
        newBallCoords.X = newBallCoords.Y = undefined;
        newBallDirection.X = newBallDirection.Y = 0;
        newBallSpeed = 0;
        balls = [];

        // add event listeners
        global.document.addEventListener("mousemove", onMouseMove);
        canvas.addEventListener("mousedown", onMouseDown);
        canvas.addEventListener("mouseup", onMouseUp);

        // set interval
        updateInterval = setInterval(update, intervalMs);
    }

    function clear() {
        // remove event listeners
        global.document.removeEventListener("mousemove", onMouseMove);
        canvas.removeEventListener("mousedown", onMouseDown);
        canvas.removeEventListener("mouseup", onMouseUp);

        // clear interval
        clearInterval(updateInterval);

        // clear canvas
        canvas.width = canvas.height = 0;
    }

    global.BouncingBalls = {
        init: init,
        clear: clear
    }

}(window));