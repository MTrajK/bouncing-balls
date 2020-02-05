(function () {

    /**************
    ** CONSTANTS **
    ***************/
    const canvas = document.getElementById("canvas");
    const context = canvas.getContext("2d");
    const canvasDimensions = document.getElementById("dimensions");

    const fps = 60; // frames per second
    const interval = 1000 / fps; // interval in miliseconds
    const localDimensions = {
        width: 100, // local units
        height: canvasDimensions.offsetHeight / (canvasDimensions.offsetWidth / 100)
    };
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
        airResistance: 0.998, // decreasing of speed in each frame
        hitResistance: 0.8, // decreasing of speed when wall is hit (this shouldn't be a constant)
        startSpeed: 0.05, // speed factor
        gravity: 9.8 // local units in second
    };

    /*********************************************************************************
    ** PROPERTIES USED FOR COMUNICATION BETWEEN HELPERS, EVENTS AND UPDATE FUNCTION **
    /*********************************************************************************/
    let isLeftMouseBtnDown = false;
    let mouseCoords = { // X & Y are represented with local units
        X: undefined,
        Y: undefined
    };
    let newBallCoords = { // X & Y are represented with local units
        X: undefined,
        Y: undefined
    };
    let newBallDirection = { // this is an unit vector
        X: 0,
        Y: 0
    };
    let newBallSpeed = undefined; // distance between newBallCoords and mouseCoords
    let balls = [];

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
            speed: newBallSpeed * movementProperties.startSpeed
        });

        // reset coordinates
        newBallDirection.X = newBallDirection.Y = 0;
        newBallCoords.X = newBallCoords.Y = undefined;
        mouseCoords.X = mouseCoords.Y = undefined;
    }

    function updateBallHorizontalSpace(idx) {
        balls[idx].coords.X += balls[idx].direction.X * balls[idx].speed;
        balls[idx].coords.Y += balls[idx].direction.Y * balls[idx].speed;

        balls[idx].speed *= movementProperties.airResistance;

        if (balls[idx].coords.X - ballProperties.radius <= 0 || balls[idx].coords.X + ballProperties.radius >= localDimensions.width) {
            // move ball inside the borders
            balls[idx].coords.X = (balls[idx].coords.X - ballProperties.radius <= 0) ?
                                    ballProperties.radius : localDimensions.width - ballProperties.radius;

            balls[idx].direction.X = -balls[idx].direction.X;
            balls[idx].speed *= movementProperties.hitResistance;
        }
        if (balls[idx].coords.Y - ballProperties.radius <= 0 || balls[idx].coords.Y + ballProperties.radius >= localDimensions.height) {
            // move ball inside the borders
            balls[idx].coords.Y = (balls[idx].coords.Y - ballProperties.radius <= 0) ?
                                    ballProperties.radius : localDimensions.height - ballProperties.radius;

            balls[idx].direction.Y = -balls[idx].direction.Y;
            balls[idx].speed *= movementProperties.hitResistance;
        }
    }

    /***********
    ** EVENTS **
    ************/
    document.onmousemove = function (event) {
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

        // check if the pointer left the canvas
        if (localCoords.X <= 0 || localCoords.X >= localDimensions.width
            || localCoords.Y <= 0 || localCoords.Y >= localDimensions.height) {
            if (isLeftMouseBtnDown) shot();
        } else {
            mouseCoords.X = localCoords.X;
            mouseCoords.Y = localCoords.Y;
            // make the direction an unit vector
            newBallSpeed = euclideanDistance(newBallCoords, mouseCoords);
            newBallDirection.X = (newBallCoords.X - mouseCoords.X) / newBallSpeed;
            newBallDirection.Y = (newBallCoords.Y - mouseCoords.Y) / newBallSpeed;
        }
    };

    canvas.onmousedown = function (e) {
        if (e.button === 0) { // check if the left mouse button is pressed
            isLeftMouseBtnDown = true;
            newBallCoords.X = mouseCoords.X;
            newBallCoords.Y = mouseCoords.Y;
        }
    };

    canvas.onmouseup = function () {
        if (isLeftMouseBtnDown)
            shot();
    };

    /***********
    ** UPDATE **
    ************/
    setInterval(function () {
        /* updates the canvas in every "interval" miliseconds */

        // get dimensions and clear canvas
        // (the canvas is erased when the dimensions are changed)
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

        for (let i=0; i<balls.length; i++) {
            // update ball
            updateBallHorizontalSpace(i);
            // draw updated ball
            drawBall(balls[i].coords, dimensions.scalePercent);
        }
    }, interval)

}());