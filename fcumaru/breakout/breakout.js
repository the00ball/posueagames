var width, height;
var canvas, context;

var keyLeft, keyRight;

var player;

function init() {
	canvas = document.getElementById("canvas");
	context = canvas.getContext("2d");
	
	width = canvas.width;
	height = canvas.height;
	
	player = new player(width / 2, height, 100, 10, 10);

	bolaTempo = 0;
	bolaAngulo = Math.floor(Math.random() * 21) - 10;
	velocidadeBola = 15;
	bolaPosX = width / 2;
	bolaPosY = height / 2;

	blocosWidth = 80;
	blocosHeight = 10;

	bolaRaio = 5;

	keyRight = false;
	keyLeft = false;

	document.addEventListener('keyup', keyUp, false);
	document.addEventListener('keydown', keyDown, false);
	setInterval(gameLoop, 30);
}

function keyDown(e) {
	if (e.keyCode == 37) {
		keyLeft = true;
	} else if (e.keyCode == 39) {
		keyRight = true;
	}
}

function keyUp(e) {
	if (e.keyCode == 37) {
		keyLeft = false;
	} else if (e.keyCode == 39) {
		keyRight = false;
	}
}

function geraBarras(x, y) {
	context.fillStyle = "gold";
	context.fillRect(x, y, blocosWidth, blocosHeight);
}

function gameLoop() {
	context.clearRect(0, 0, width, height);

	for (var j = 100; j < 180; j += 20) {
		for (var i = 0; i < width; i += 100) {
			geraBarras(i + 10, j);
		}
	}
	if ((keyRight) && ((player.x + player.width) <= width)) {
		player.x += 10;
	}

	if ((keyLeft) && (player.x >= 0)) {
		player.x -= 10;
	}

	// Bola
	if (bolaTempo <= 0) {
		if ((bolaPosY - bolaRaio) <= (player.y + player.height)) {
			if ((bolaPosX + bolaRaio > player.x)
					&& (bolaPosX - bolaRaio < player.x + player.width)) {
				bolaParaBaixo = true;
				if (keyLeft) {
					bolaAngulo = Math.floor(Math.random() * 10) - 9;
				} else {
					bolaAngulo = Math.floor((Math.random() * 10));
				}
			}
		}
	}

	if (bolaParaBaixo) {
		bolaPosY += velocidadeBola;
	} else {
		bolaPosY -= velocidadeBola;
	}

	// Jogador
	player.draw(context);

	// Titulo
	context.font = "21pt Helvetica";
	context.fillStyle = "red";
	context.fillText("BREAKOUT", (width / 2) - 80, 25);

	// Linha divisoria
	context.beginPath();
	context.moveTo(0, 30);
	context.lineTo(canvas.width, 30);
	context.strokeStyle = "black";
	context.stroke();
	context.closePath();

	// Bola
	context.beginPath();
	context.arc(bolaPosX, bolaPosY, bolaRaio, 0, 2 * Math.PI, true);
	context.fillStyle = "red";
	context.fill();

}

function ball(x, y, radius, speed) {
	this.x = x;
	this.y = y;	
	this.radius = radius;
	this.speed = speed;
	
	this.draw = function(context) {
		context.beginPath();
		context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, true);
		context.fillStyle = "red";
		context.fill();
	};
}

function player(x, y, width, height, speed) {
	this.x = x - (width / 2);
	this.y = y - height;	
	this.width = width;
	this.height = height;
	this.speed = speed;
	
	this.draw = function(context) {
		context.fillStyle = "black";
		context.fillRect(this.x, this.y, this.width,
				this.height);
	};
	
	this.colisao = function() {
		
	};
}

function block(x, y, width, height) {
	this.x = x;
	this.y = y;	
	this.width = width;
	this.height = height;
	this.collided = false;
	
	this.draw = function() {
		if (this.collided == false) {
			context.fillStyle = "gold";
			context.fillRect(this.x, this.y, this.width, this.height);
		}
	};
	
	this.collision = function() {
		
	};
}