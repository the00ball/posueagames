/*global State, Config, Phaser*/

State.GameWin = function (game) {
	"use strict";
	this.game = game;
};
State.GameWin.prototype = {
	preload: function () {
		"use strict";
	},
	create: function () {
		"use strict";
		var background = this.game.add.sprite(Config.gameWin.x, Config.gameWin.y, 'game-win');
		background.inputEnabled = true;
		background.events.onInputDown.add(this.onClick, this);
	},
	update: function () {
		"use strict";
		Config.global.screen.resize(this.game);
		if (this.game.input.keyboard.isDown(Phaser.Keyboard.ENTER)) {
			this.game.state.start('GamePlay');
		} else if (this.game.input.keyboard.isDown(Phaser.Keyboard.ESC)) {
				this.game.state.start('Menu');
		}
	},
	onClick: function () {
		"use strict";
		this.game.state.start('Menu');
	}
};