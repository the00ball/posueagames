(function (app_container) {

    function Player(game) {
        this.game = game;
        this.sprite = null;
        this.cursors = null;
        this.shurikens = null;
        this.shurikenTimer = 0;
        this.shurikenDelay = 400;
        this.shurikenAudio = null;
        this.dead = false;
    }

    Player.prototype = {
        preload: function () {
        },
        create: function (x, y) {
            this.sprite = this.game.add.sprite(x, y, 'ninjas');

            this.game.physics.enable(this.sprite, Phaser.Physics.ARCADE);

            this.sprite.anchor.setTo(0.5, 0.5);
            this.sprite.body.gravity.y = 1200;
            this.sprite.body.collideWorldBounds = true;

            this.sprite.animations.add('idle', [64, 65, 66, 67], 4, true);
            this.sprite.animations.add('walk', [0, 1, 2, 3], 8, true);
            this.sprite.animations.add('dash', [33, 34], 8, false);
            this.sprite.animations.add('jump', [99, 98], 8, false);
            this.sprite.animations.add('death', [130, 131, 132, 133, 135], 8, false);

            this.sprite.animations.play('idle');

            this.shurikens = this.game.add.group();
            this.shurikens.createMultiple(10, 'shuriken');
            this.shurikens.setAll('anchor.x', 0.5);
            this.shurikens.setAll('anchor.y', 0.5);

            this.shurikenAudio = this.game.add.audio('shuriken_sound');
            this.shurikenAudio.volume = 0.6;

            this.cursors = this.game.input.keyboard.createCursorKeys();
        },

        fire: function () {
            var shuriken = this.shurikens.getFirstDead();

            if (!shuriken || (this.game.time.now < this.shurikenTimer + this.shurikenDelay)) return false;

            this.game.physics.enable(shuriken, Phaser.Physics.ARCADE);

            shuriken.reset(this.sprite.x + this.sprite.width, this.sprite.y);
            shuriken.body.velocity.x = (this.sprite.scale.x > 0) ? 1000 : -1000;
            shuriken.scale.set(0.8, 0.8);
            shuriken.checkWorldBounds = true;
            shuriken.outOfBoundsKill = true;

            this.shurikenAudio.play();

            this.shurikenTimer = this.game.time.now;

            return true;
        },

        update: function() {
            if (this.dead) return;

            var shiftPressed = this.game.input.keyboard.isDown(Phaser.Keyboard.SHIFT);

            if (this.game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
                this.fire();
            }

            if (this.cursors.right.isDown) {
                this.sprite.body.velocity.x = 250 * (shiftPressed ? 2 : 1);
                this.turnRight();

                if (this.sprite.body.onFloor()) {
                    if (shiftPressed) {
                        this.sprite.animations.play('dash');
                    } else {
                        this.sprite.animations.play('walk');
                    }
                } else if (this.sprite.animations.currentAnim.name != 'jump') {
                    this.sprite.animations.play('jump');
                }
            }

            if (this.cursors.left.isDown) {
                this.sprite.body.velocity.x = -250 * (shiftPressed ? 2 : 1);
                this.turnLeft();

                if (this.sprite.body.onFloor()) {
                    if (shiftPressed) {
                        this.sprite.animations.play('dash');
                    } else {
                        this.sprite.animations.play('walk');
                    }
                } else if (this.sprite.animations.currentAnim.name != 'jump') {
                    this.sprite.animations.play('jump');
                }
            }

            if (!this.cursors.left.isDown && !this.cursors.right.isDown) {
                if (this.sprite.body.onFloor()) {
                    this.sprite.body.velocity.x = 0;
                    this.sprite.animations.play('idle');
                } else if (this.sprite.animations.currentAnim.name != 'jump') {
                    this.sprite.animations.play('jump');
                }
            }

            if (this.cursors.up.isDown) {
                if (this.sprite.body.onFloor()) {
                    this.sprite.animations.play('jump');
                    this.sprite.body.velocity.y = -650;
                }
            }
        },

        die: function () {
            this.dead = true;

            this.sprite.body.velocity.x = 0;
            this.sprite.animations.play('death');
        },

        revive: function() {
            this.dead = false;
            this.sprite.animations.play('idle');
        },

        turnLeft: function() {
            if (this.sprite.scale.x > 0) {
                this.sprite.scale.x *= -1;
            }
        },

        turnRight: function() {
            if (this.sprite.scale.x < 0) {
                this.sprite.scale.x *= -1;
            }
        }
    };

    window.Player = Player;

}(window.app_container = window.app_container || {}));