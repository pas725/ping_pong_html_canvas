(function () {
    var canvas;
    var canvasContext;

    // Ball
    const BALL_RADIUS = 5;
    var ballX = 200;
    var ballY = 250;
    var ballXDir = 8;	// Ball speed : X direction
    var ballYDir = 8; 	// Ball speed : Y direction

    // Paddle
    const PADDLE_WIDTH = 10;
    const INIT_PADDLE1_X = 10;
    const PADDLE_HEIGHT = 100;
    var PADDLE2_MOVING_SPEED_Y = 7; // Increase this value to increase difficulty level
    var INIT_PADDLE2_X;
    var paddle1Y = 100;
    var paddle2Y = 250;

    // Paddle movement limit(Vertically)
    var MAX_PADDLE_Y;
    var MIN_PADDLE_Y;

    // Canvas length
    var BOARD_LENGTH_X;
    var BOARD_LENGTH_Y;

    const SCORE_AREA_Y = 80;
    const PADDING_Y = 10;

    const WINNIG_SCORE = 5;

    // Colors for game elements
    const PLAYING_BORDER_COLOR = 'WHITE';
    const PADDLE_COLOR = 'WHITE';
    const BALL_COLOR = 'white';
    const BG_COLOR = 'black';

    // Usernames
    const USER_1 = 'YOU';
    const USER_2 = 'COMPUTER';

    var userScore = 0;
    var computerScore = 0;

    var isWindowReloaded = true;

    window.onload = function () {

        canvas = document.getElementById('gameBoard');
        canvasContext = canvas.getContext('2d');

        BOARD_LENGTH_X = canvas.width;
        BOARD_LENGTH_Y = canvas.height;

        MAX_PADDLE_Y = BOARD_LENGTH_Y - ( PADDING_Y + SCORE_AREA_Y);
        MIN_PADDLE_Y = PADDING_Y;

        INIT_PADDLE2_X = canvas.width - ( INIT_PADDLE1_X + PADDLE_WIDTH );
        var framesPerSecond = 35;

        // Game loop starts here
        setInterval(drawFrame, 1000 / framesPerSecond);

        canvas.addEventListener('mousemove', function (event) {

            var mousePos = calculateMousePos(event);

            if (mousePos.y >= (MIN_PADDLE_Y + (PADDLE_HEIGHT / 2) ) && (mousePos.y + (PADDLE_HEIGHT / 2 )) <= MAX_PADDLE_Y + 2 * BALL_RADIUS) {
                paddle1Y = mousePos.y - (PADDLE_HEIGHT / 2);
            }
        });

        canvas.addEventListener('click', function (event) {

            if (isWindowReloaded) {
                isWindowReloaded = false;
            } else if (isUserWon()) {
                resetScore();
            }
        })

    }

    function drawCircle(x, y, radius, color) {
        canvasContext.beginPath();
        canvasContext.fillStyle = color;
        canvasContext.arc(x, y, radius, 0, 2 * Math.PI, true);
        canvasContext.fill();
    }

    function drawRect(x, y, width, height, color, noFill) {

        if (noFill) {
            canvasContext.strokeStyle = color;
            canvasContext.strokeRect(x, y, width, height);
            return;
        }
        canvasContext.fillStyle = color;
        canvasContext.fillRect(x, y, width, height);


    }

    function drawNet() {

        var midX = BOARD_LENGTH_X / 2;
        for (var i = PADDING_Y + BALL_RADIUS; i < BOARD_LENGTH_Y - (BALL_RADIUS + PADDING_Y + SCORE_AREA_Y); i += 40) {
            drawRect(midX, i, 2, 20, 'grey')
        }
    }

    function drawScore(x, y, playerName, score) {
        drawText(playerName + ' : ' + score, x, y);
    }

    function drawText(text, x, y) {
        canvasContext.font = 'bold 20px sans-serif';
        //2em "Open Sans", sans-serif
        // 20px Georgia
        canvasContext.fillStyle = 'white'
        canvasContext.fillText(text, x, y);
    }

    function resetScore() {
        userScore = 0;
        computerScore = 0;
    }

    function resetBall() {

        ballXDir = -ballXDir;
        ballX = (BOARD_LENGTH_X / 2) + (Math.random() * 100 );
        ballY = (BOARD_LENGTH_Y / 2) + (Math.random() * 100 );
    }

    function calculateMousePos(event) {

        var rect = canvas.getBoundingClientRect();
        var root = document.documentElement;

        var mouseX = event.clientX - rect.left - root.scrollLeft;
        var mouseY = event.clientY - rect.top - root.scrollTop;

        return {
            x: mouseX,
            y: mouseY
        };
    }

    function moveComputerPaddle() {

        var paddle2YCenter = paddle2Y + (PADDLE_HEIGHT / 2);
        if (ballX > 200) {
            if (paddle2YCenter < ( ballY - 35) && ( paddle2Y + PADDLE_HEIGHT) <= (BOARD_LENGTH_Y - ( PADDING_Y + SCORE_AREA_Y ) )) {
                paddle2Y += PADDLE2_MOVING_SPEED_Y;
            } else if (paddle2Y >= 2 * PADDING_Y) {
                paddle2Y -= PADDLE2_MOVING_SPEED_Y;
            }
        }
    }

    function moveBall() {

        // RIGHT SIDE : Ball/paddle collision logic
        if (ballX > ( INIT_PADDLE2_X - Math.abs(ballXDir))) {

            if (ballY >= paddle2Y && ballY <= paddle2Y + PADDLE_HEIGHT) {
                ballXDir = -ballXDir;
            } else if (ballX < ( INIT_PADDLE2_X + PADDLE_WIDTH + 8)) {
                userScore++;
                resetBall();
            }
        }

        // LEFT SIDE : Ball/paddle collision logic
        if (ballX < ( INIT_PADDLE1_X + PADDLE_WIDTH + Math.abs(ballXDir))) {

            if (ballY >= paddle1Y && ballY <= paddle1Y + PADDLE_HEIGHT) {
                ballXDir = -ballXDir;
            } else if (ballX < ( INIT_PADDLE1_X + PADDLE_WIDTH )) {
                computerScore++;
                resetBall();
            }
        }

        if (ballY > (BOARD_LENGTH_Y - ( PADDING_Y + SCORE_AREA_Y ) )) {
            ballYDir = -ballYDir;
        }
        if (ballY < (PADDING_Y + 2 * BALL_RADIUS)) {
            ballYDir = -ballYDir;
        }

        ballX += ballXDir;
        ballY += ballYDir;
    }

    // Check whether any user has won the game
    function isUserWon() {

        var flag = false;

        function drawWinText(user) {
            var x = 320;
            var y = 250;
            drawText(user + ' Won!!', x, y);
            drawText('Click to replay...', x, y + 30);
        }

        if (userScore >= WINNIG_SCORE) {
            drawWinText(USER_1);
            flag = true;
        } else if (computerScore >= WINNIG_SCORE) {
            drawWinText(USER_2);
            flag = true;
        }

        return flag;
    }

    function drawFrame() {

        var x, y, width, height, color, radius;
        var noFill = true;
        // Draw rectangle, gameboard backgorund
        drawRect(0, 0, BOARD_LENGTH_X, BOARD_LENGTH_Y, BG_COLOR);


        // Draw playing area's boundary
        x = INIT_PADDLE1_X + PADDLE_WIDTH
        y = PADDING_Y;
        width = BOARD_LENGTH_X - (2 * INIT_PADDLE1_X + 2 * PADDLE_WIDTH);
        height = BOARD_LENGTH_Y - (  PADDING_Y + SCORE_AREA_Y);
        color = PLAYING_BORDER_COLOR;
        drawRect(x, y, width, height, color, noFill);

        // Draw score-board boundary
        x = INIT_PADDLE1_X + PADDLE_WIDTH;
        y = BOARD_LENGTH_Y - ( SCORE_AREA_Y)
        width = BOARD_LENGTH_X - (2 * INIT_PADDLE1_X + 2 * PADDLE_WIDTH)
        height = 68;
        color = PLAYING_BORDER_COLOR;
        drawRect(x, y, width, height, color, noFill);

        // Draw user's paddle
        x = INIT_PADDLE1_X;
        y = paddle1Y
        width = PADDLE_WIDTH
        height = PADDLE_HEIGHT
        color = PADDLE_COLOR;
        drawRect(x, y, width, height, color);

        // Draw computers' paddle
        x = INIT_PADDLE2_X;
        y = paddle2Y
        width = PADDLE_WIDTH
        height = PADDLE_HEIGHT
        color = PADDLE_COLOR
        drawRect(x, y, width, height, color);

        // Draw net
        drawNet();


        // Draw player Scores
        // Draw users score
        x = 160;
        y = 560;
        drawScore(x, y, USER_1, userScore);

        // Draw computers score
        x = 490;
        y = 560;
        drawScore(x, y, USER_2, computerScore);

        // Show message on window load
        if (isWindowReloaded) {
            var x = 310;
            var y = 250;
            drawText('Click to play...', x, y + 30);
            return;
        }

        // Stop when either of the user wins
        if (isUserWon()) {
            return;
        }

        // Draw ball
        x = ballX;
        y = ballY
        radius = BALL_RADIUS
        color = BALL_COLOR;
        drawCircle(x, y, radius, color);

        // Move Ball
        moveBall();

        // Move computers paddle
        moveComputerPaddle();

    }
})();