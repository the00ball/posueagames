/*global State, Config*/

State.Level1 = function (game) {
	"use strict";
	this.game = game;
    this.map = null;
    this.crabs = null;
    this.shell = null;
    this.sunscreen = null;
    this.can = null;
    this.crabMaterial = null;
    this.groundMaterial = null;
    this.hotsandMaterial = null;
    this.energy = null;
    this.smokeEmitter = null;
    this.haveEnergy = false;
    this.smokeTimer = null;
    this.redSand = null;
    this.dropCollisionGroup = null;
    this.crabCollisionGroup = null;
    this.hud = new HUD(this.game);
    this.forceSlidingStraw = false;
    this.onAir = false;
    this.hotSandTimerActivated = false;

    this.countCall = 0; //count how many times the collision function is called.
};
State.Level1.prototype = {
	preload: function () {
		"use strict";

		// Player
		try {
			this.drop = new Character(this.game, 'drop',
					'assets/spritesheets/drop_4590-60.png', [51, 60]);
		} catch(exception) {
			console.log(exception.toString());
		}
        this.drop.preload();

        this.hud.preload();
	},
	create: function () {
		"use strict";

//		var background;
//		background = this.game.add.tileSprite(Config.gamePlay.x, Config.gamePlay.y, 4480, 544, 'gameplay-bg');
//		background.fixedToCamera = true;

        this.map = this.game.add.tilemap('map');
        this.map.addTilesetImage('wetsand_32-32', 'wetsand');
        this.map.addTilesetImage('hotsand_32-32', 'hotsand');
        this.map.addTilesetImage('platform_160-64', 'platform');
        this.map.addTilesetImage('seashell_224-64', 'seashell');
        this.map.addTilesetImage('can_320-128', 'can');
        this.map.addTilesetImage('bucket_384-480', 'bucket');
        this.map.addTilesetImage('straw_224-256', 'diagonalstraw');
        this.map.addTilesetImage('sunscreen_288-96', 'sunscreen');
        this.map.addTilesetImage('seaurchin_80-40', 'seaurchin');
        this.map.addTilesetImage('glass_288-320', 'glass');
        this.map.addTilesetImage('straw_480-64', 'strawground');
        this.map.addTilesetImage('strawtipleft_15-20', 'strawtipleft');
        this.map.addTilesetImage('strawtipright_15-20', 'strawtipright');

        this.mainLayer = this.map.createLayer('mainlayer');
        this.hotSandLayer = this.map.createLayer('hotsandlayer');
        this.strawLayer = this.map.createLayer('strawlayer');
        this.mainLayer.resizeWorld();

//      this.map.setCollisionByExclusion([0], true, this.mainLayer);
//      this.map.setCollisionByExclusion([0], true, this.hotSandLayer);
//      this.map.setCollisionByExclusion([0], true, this.strawLayer);

        this.setupPhysics();
        this.setupLayers();

//		this.setupShell(450, this.game.world.height - 106);
//		this.setupSunscreen(3200, this.game.world.height-59-44);
//		this.setupCan(1620, this.game.world.height-80);
        this.setupCrab();
//		this.setupBucket(2250, 272);
//		this.setupStrawHorizontal(2010, 510);
//		this.setupStrawDiagonal(2720, 270);
		this.setupMolecule();
		this.setupPlayer(100, this.game.world.height-200);
		this.setupSmokeEmitter(1550, this.game.height-80);

        this.hud.create();
		//this.drop.userDead();

        // Sounds
        this.jumpSound = this.game.add.audio("jump");
        this.mainSound = this.game.add.audio("main");
        this.powUpSound = this.game.add.audio("powup");
       // this.inicioSound.stop();
        this.mainSound.loop = true;
        this.mainSound.play();
	},
	update: function () {
		"use strict";
		this.hud.updateFPS();
		this.handleKeyDown();
		this.isOnAir();
		this.drop.playerAnimations();
		this.playerOverDiagonalStraw();

		this.moveCrab(this.crabs.getAt(0));
		this.moveCrab(this.crabs.getAt(1));
		this.moveCrab(this.crabs.getAt(2));

		if (this.haveEnergy) {
			this.smokeEmitter.x = this.drop.getSpriteObject().x;
			this.smokeEmitter.y = this.drop.getSpriteObject().y + 56;
		}

	    if (this.playerEnteredLeftStraw) {
	        this.game.camera.setPosition(this.game.camera.x + 8,
	                this.game.camera.y);
	    } else if (this.playerEnteredRightStraw) {
	        this.game.camera.setPosition(this.game.camera.x - 8,
	                this.game.camera.y);
	    }
	//	if(this.userDead()){
	//	      this.restart();
	//	   }
	},
	playerOverDiagonalStraw: function() {
	    var characterSprite = this.drop.getSpriteObject();
	    if (characterSprite.x >= 2513.0 && characterSprite.x <= 2750.0 &&
	            characterSprite.y <= (this.game.world.height - 200.0) &&
	            this.touchingDown(characterSprite.body)) {
	        this.forceSlidingStraw = true;
	    } else {
	        this.forceSlidingStraw = false;
	    }
	},
	handleKeyDown: function () {
		"use strict";

		if ( this.game.input.keyboard.isDown(Phaser.Keyboard.RIGHT) ) {
	        if (this.forceSlidingStraw == true) {
	            this.drop.moveLeft(1);
	            this.drop.getSpriteObject().body.data.force[0] = -1;
	        } else {
				if (!this.onAir) {
					this.drop.animestate = 'right';
				} else {
					this.drop.animestate = 'jumpright';
				}
				this.drop.moveRight(300);
	        }
	    } else if ( this.game.input.keyboard.isDown (Phaser.Keyboard.LEFT) ) {
			if (!this.onAir) {
				this.drop.animestate = 'left';
			} else {
				this.drop.animestate = 'jumpleft';
			}
			this.drop.moveLeft(300);
		}  else {
			this.drop.stop();
			this.drop.animestate = 'stop';
		}

		if ( this.game.input.keyboard.isDown (Phaser.Keyboard.SPACEBAR) ) {
			if (this.touchingDown(this.drop.getSpriteObject().body)) {
				this.drop.jump(700);
				this.jumpSound.play();
			}
		}
	},
	setupPhysics: function () {
		this.game.physics.startSystem(Phaser.Physics.P2JS);
	    this.game.physics.p2.gravity.y = 1400;
	    this.game.physics.defaultRestitution = 0;
	    this.game.stage.smoothed = false;  // no antialiasing
	    this.game.world.enableBodySleeping=true;
	    this.game.physics.p2.setImpactEvents(true);
	    this.game.physics.p2.updateBoundsCollisionGroup();

	    // define collision group
		this.playerCG = game.physics.p2.createCollisionGroup();
		this.groundCG = game.physics.p2.createCollisionGroup();
		this.crabCG = game.physics.p2.createCollisionGroup();
		this.strawCG = game.physics.p2.createCollisionGroup();
		this.coveredStrawCG = game.physics.p2.createCollisionGroup();
		this.moleculeCG = game.physics.p2.createCollisionGroup();
		this.urchinsCG = game.physics.p2.createCollisionGroup();
		this.hotsandCG = game.physics.p2.createCollisionGroup();

		// Create and Setup Material
	    this.characterMaterial = game.physics.p2.createMaterial('characterMaterial');
	    this.crabMaterial = game.physics.p2.createMaterial('crabMaterial');
	    this.groundMaterial = game.physics.p2.createMaterial('groundMaterial');
	    this.hotsandMaterial = game.physics.p2.createMaterial('hotsandMaterial');

		// create contact material
	    this.game.physics.p2.createContactMaterial(this.groundMaterial, this.crabMaterial, {friction: 0.0, restitution: 0.0});
	    this.game.physics.p2.createContactMaterial(this.characterMaterial, this.groundMaterial, {friction: 0.0, restitution: 0.0});
	    this.game.physics.p2.createContactMaterial(this.crabMaterial, this.hotsandMaterial, {friction: 0.0, restitution: 0.0});
	},
	setupLayers: function () {
	    this.tilesMainLayer = game.physics.p2.convertTilemap(this.map,
	            this.mainLayer);
	    this.tilesHotSandLayer = game.physics.p2.convertTilemap(this.map,
	            this.hotSandLayer);
	    this.tilesStrawLayer = game.physics.p2.convertTilemap(this.map,
	    		this.strawLayer);
	    this.tilesObjects = game.physics.p2.convertCollisionObjects(this.map,
	            'objects');

	    //setup all tiles with collisiongroups or materials
	    for (var i=0; i < this.tilesMainLayer.length; i++) {
	    	this.tilesMainLayer[i].setCollisionGroup(this.groundCG);
	    	this.tilesMainLayer[i].collides([this.playerCG, this.crabCG,
	                this.moleculeCG]);
	    	this.tilesMainLayer[i].setMaterial(this.groundMaterial);
	    }
	    for (var i=0; i < this.tilesHotSandLayer.length; i++) {
	    	this.tilesHotSandLayer[i].setCollisionGroup(this.hotsandCG);
	    	this.tilesHotSandLayer[i].collides([this.playerCG, this.crabCG,
	                this.moleculeCG, this.groundCG, this.urchinsCG]);
	    	this.tilesHotSandLayer[i].setMaterial(this.groundMaterial);
	    }
	    for (var i=0; i < this.tilesStrawLayer.length; i++) {
	    	this.tilesStrawLayer[i].setCollisionGroup(this.groundCG);
	    	this.tilesStrawLayer[i].collides([this.playerCG, this.crabCG,
	                this.moleculeCG, this.groundCG, this.urchinsCG]);
	    	this.tilesStrawLayer[i].setMaterial(this.slidingMaterial);
	    }
	    for (var i=0; i < this.tilesObjects.length; i++){
	    	this.tilesObjects[i].setCollisionGroup(this.groundCG, this.crabCG,
	    			this.moleculeCG, this.energyCG);
	    	this.tilesObjects[i].collides([this.playerCG]);
	    	this.tilesObjects[i].setMaterial(this.groundMaterial);
	    }

	    // Creating the objects defined in the tilemap
	    this.urchins = game.add.group();
	    this.map.createFromObjects('objects', 330, 'urchin', 0, true, false,
	            this.urchins);
	    this.urchins.forEach(this.setupUrchins, this);
    },
	setupPlayer: function (posX, posY) {
		this.drop.create(posX, posY);
        var dropSprite = this.drop.getSpriteObject();
        this.game.camera.follow(dropSprite);
        this.game.physics.p2.enableBody(dropSprite, false);
        this.drop.setCharacterInicialValues();
        dropSprite.body.setMaterial(this.characterMaterial);
        dropSprite.body.setCollisionGroup(this.playerCG);
        dropSprite.body.collides([this.groundCG, this.crabCG, this.strawCG,
								  this.moleculeCG, this.urchinsCG,
								  this.hotsandCG, this.coveredStrawCG]);
        // collide callbacks
		dropSprite.body.createGroupCallback(this.crabCG, this.checkOverlapCrabDrop, this);
        dropSprite.body.createGroupCallback(this.urchinsCG, this.checkCollisionUrchins, this);
        dropSprite.body.createGroupCallback(this.moleculeCG, this.checkOverlapWithLifeDrop, this);
		dropSprite.body.createGroupCallback(this.drinkEnergy, this);
		dropSprite.body.createGroupCallback(this.hotsandCG, this.killDrop, this);
        dropSprite.body.createGroupCallback(this.coveredStrawCG, this.insideStraw, this);
	},
//	setupShell: function (posX, posY) {
//		 // Create sea shell
//        this.seashell = this.game.add.sprite(posX, posY, 'seashell');
//        this.game.physics.p2.enableBody(this.seashell);
//        this.seashell.body.clearShapes();
//        this.seashell.body.loadPolygon('seashellPhysics', 'seashell_220-68');
//        this.seashell.body.fixedRotation = true;
//        this.seashell.body.static = true;
//        this.seashell.body.setCollisionGroup(this.groundCG);
//        this.seashell.body.collides([this.groundCG, this.crabCG, this.playerCG]);
//        this.seashell.body.setMaterial(this.groundMaterial);
//	},
//	setupSunscreen: function (posX, posY) {
//		// Create sunscreen
//        this.sunscreen = this.game.add.sprite(posX, posY,'sunscreen');
//        this.game.physics.p2.enableBody(this.sunscreen);
//        this.sunscreen.body.fixedRotation = true;
//        this.sunscreen.body.static = true;
//        this.sunscreen.body.setMaterial(this.groundMaterial);
//        this.sunscreen.body.setCollisionGroup(this.groundCG);
//        this.sunscreen.body.collides([this.groundCG, this.crabCG, this.playerCG]);
//        var cover = this.game.add.sprite(3060, this.game.world.height-78,'coversunscreen');
//        this.game.physics.p2.enableBody(cover);
//        cover.body.fixedRotation = true;
//        cover.body.static = true;
//        cover.body.setMaterial(this.groundMaterial);
//        cover.body.setCollisionGroup(this.groundCG);
//        cover.body.collides([this.groundCG, this.crabCG, this.playerCG]);
//	},
//	setupCan: function(posX, posY) {
//		// create CAN
//        this.can = this.game.add.sprite(posX, posY,'can');
//        this.game.physics.p2.enableBody(this.can, false);
//        this.can.body.fixedRotation = true;
//        this.can.body.setRectangle(260,120,0,0);
//        this.can.body.static = true;
//        this.can.body.setMaterial(this.groundMaterial);
//        this.can.body.setCollisionGroup(this.groundCG);
//        this.can.body.collides([this.groundCG, this.crabCG, this.playerCG]);
//	},
	setupCrab: function() {
		// create crabs
        this.crabs = game.add.group();
		this.crabs.enableBody = true;
		this.crabs.physicsBodyType = Phaser.Physics.P2JS;
		this.crabs.create(this.game.width-180, this.game.height-80-69, 'crab');
        this.crabs.create(this.game.width, this.game.height-80-69, 'crab');
        this.crabs.create(4480, this.game.height-80-69, 'crab');
		for (var i = 0; i < this.crabs.length; i++) {
			this.crabs.getAt(i).body.setCollisionGroup(this.crabCG);
			this.crabs.getAt(i).body.fixedRotation = true;
			this.crabs.getAt(i).body.setMaterial(this.crabMaterial);
			this.crabs.getAt(i).animations.add('walkL', [0, 1, 2], 10, true);
			this.crabs.getAt(i).animations.add('walkR', [0, 1, 2], 10, true);
			this.crabs.getAt(i).body.collides([this.crabCG, this.playerCG,
                    this.groundCG, this.hotsandCG]);
		}
		this.crabs.getAt(0).body.moveLeft(400);
		this.crabs.getAt(1).body.moveRight(400);
		this.crabs.getAt(2).body.moveRight(400);
	},
//	setupBucket: function(posX, posY) {
//		// Add the bucket
//        this.bucket = this.game.add.sprite(posX, posY, 'bucket');
//        this.game.physics.p2.enableBody(this.bucket, false);
//        this.bucket.body.clearShapes();
//        this.bucket.body.loadPolygon('bucketPhysics', 'bucket_384-497');
//        this.bucket.body.fixedRotation = true;
//        this.bucket.body.static = true;
//        this.bucket.body.setCollisionGroup(this.groundCG);
//        this.bucket.body.collides([this.groundCG, this.playerCG]);
//	},
//	setupStrawHorizontal: function(posX, posY) {
//		// Tip of the straw (in the left of the bucket)
//        this.strawLeft = this.game.add.sprite(posX, posY, 'straw1');
//        this.game.physics.p2.enableBody(this.strawLeft, false);
//        this.strawLeft.body.fixedRotation = true;
//        this.strawLeft.body.static = true;
//        this.strawLeft.body.setCollisionGroup(this.coveredStrawCG);
//        this.strawLeft.body.collides([this.playerCG]);
//        this.playerEnteredLeftStraw = false;
//
//        // Straw passing under the ground
//        this.strawUnderGround = this.game.add.sprite(2000, 520, 'dropInStraw');
//        var strawAnimationRight =
//            this.strawUnderGround.animations.add('dropInsideRight',
//            [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 10, false);
//        strawAnimationRight.onComplete.add(this.strawAnimationComplete, this);
//        var strawAnimationLeft =
//            this.strawUnderGround.animations.add('dropInsideLeft',
//            [9, 8, 7, 6, 5, 4, 3, 2, 1, 0, 10], 10, false);
//        strawAnimationLeft.onComplete.add(this.strawAnimationComplete, this);
//        this.strawUnderGround.animations.add('strawNormal', [10], 10, false);
//        this.strawUnderGround.animations.play('strawNormal');
//
//        // Tip of the straw (in the right of the bucket)
//        this.strawRight = this.game.add.sprite(2470, 510, 'straw1');
//        this.game.physics.p2.enableBody(this.strawRight, false);
//        this.strawRight.body.fixedRotation = true;
//        this.strawRight.body.static = true;
//        this.strawRight.body.setCollisionGroup(this.coveredStrawCG);
//        this.strawRight.body.collides([this.playerCG]);
//        this.playerEnteredRightStraw = false;
//	},
//	setupStrawDiagonal: function (posX, posY) {
//		// canudo
//		this.diagonalStraw = this.game.add.sprite(posX, posY, 'straw2');
//		this.game.physics.p2.enableBody(this.diagonalStraw, false);
//		this.diagonalStraw.body.clearShapes();
//		this.diagonalStraw.body.loadPolygon('strawPhysics', 'straw2_236-276');
//		this.diagonalStraw.body.fixedRotation = true;
//		this.diagonalStraw.body.static = true;
//		this.diagonalStraw.body.setCollisionGroup(this.strawCG);
//        this.diagonalStraw.body.collides([this.groundCG, this.playerCG]);
//	},
	setupMolecule: function () {
		// Add a "life drop"
        this.molecule = game.add.group();
        this.molecule.enableBody = true;
        this.molecule.physicsBodyType = Phaser.Physics.P2JS;

        this.molecule.create(280, 268, 'lifedrop');
        this.molecule.create(1700, this.game.world.height-80-75, 'energy');

        for (var i = 0; i < this.molecule.length; i++) {
            this.molecule.getAt(i).body.setCollisionGroup(this.moleculeCG);
            this.molecule.getAt(i).body.fixedRotation = true;
            this.molecule.getAt(i).body.static = true;
            this.molecule.getAt(i).animations.add('dropAnimation',
                    [0, 1, 2, 3, 4], 10, true);
            this.molecule.getAt(i).animations.play('dropAnimation');
            this.molecule.getAt(i).body.collides([this.playerCG, this.groundCG]);
            this.molecule.hasCollided = false;
        }

        this.molecule.getAt(0).body.sprite.name='lifedrop';
        this.molecule.getAt(1).body.sprite.name='energy';
    },
	setupSmokeEmitter: function(posX, posY) {
		// smoke animation
		// add smoke particles
		this.smokeEmitter = this.game.add.emitter(posX, posY, 100);
		this.smokeEmitter.gravity = 0;
		this.smokeEmitter.setXSpeed(-15, 15);
		this.smokeEmitter.setYSpeed(-80, -50);
		this.smokeEmitter.setAlpha(1, 0, 3000, Phaser.Easing.Linear.InOut);
		this.smokeEmitter.makeParticles('smoke');
    },
    setCharacterInicialValues: function(character) {
    	character.smoothed = false;
    	character.body.fixedRotation = true;

    	// normal state
        character.animations.add('leftsmallnormal', [4,5,6], 10, true);
        character.animations.add('rightsmallnormal', [8,9,10], 10, true);
        character.animations.add('jumpleftsmallnormal', [3], 10, false);
        character.animations.add('jumprightsmallnormal', [11], 10, false);
        character.animations.add('stopsmallnormal', [7], 10, true);
        character.animations.add('leftbignormal', [19,20,21], 10, true);
        character.animations.add('rightbignormal', [23,24,25], 10, true);
        character.animations.add('jumpleftbignormal', [18], 10, true);
        character.animations.add('jumprightbignormal', [26], 10, true);
        character.animations.add('stopbignormal', [22], 10, true);

		// energy state
        character.animations.add('leftsmallenergy', [34,35,36], 10, true);
        character.animations.add('rightsmallenergy', [38,39,40], 10, true);
        character.animations.add('jumpleftsmallenergy', [33], 10, false);
        character.animations.add('jumprightsmallenergy', [41], 10, false);
        character.animations.add('stopsmallenergy', [37], 10, true);
        character.animations.add('leftbigenergy', [49,50,51], 10, true);
        character.animations.add('rightbigenergy', [53,54,55], 10, true);
        character.animations.add('jumpleftbigenergy', [48], 10, true);
        character.animations.add('jumprightbigenergy', [56], 10, true);
        character.animations.add('stopbigenergy', [52], 10, true);

        // sunscreen state
        character.animations.add('leftsmallsunscreen', [64,65,66], 10, true);
        character.animations.add('rightsmallsunscreen', [68,69,70], 10, true);
        character.animations.add('jumpleftsmallsunscreen', [63], 10, false);
        character.animations.add('jumprightsmallsunscreen', [71], 10, false);
        character.animations.add('stopsmallsunscreen', [67], 10, true);
        character.animations.add('leftbisunscreen', [79,80,81], 10, true);
        character.animations.add('rightbigsunscreen', [83,84,85], 10, true);
        character.animations.add('jumpleftbigsunscreen', [78], 10, true);
        character.animations.add('jumprightbigsunscreen', [86], 10, true);
        character.animations.add('stopbigsunscreen', [82], 10, true);

    },
    setupUrchins: function(urchin) {
    	game.physics.p2.enable(urchin);
        urchin.body.setCollisionGroup(this.urchinsCG);
        urchin.body.static = true;
        urchin.body.sprite.name = 'urchin';
        urchin.body.collides([this.playerCG, this.groundCG]);
    },
    playerOverDiagonalStraw: function() {
        var characterSprite = this.drop.getSpriteObject();
        if (characterSprite.x >= 2513.0 && characterSprite.x <= 2750.0 &&
                characterSprite.y <= (this.game.world.height - 200.0) &&
                this.touchingDown(characterSprite.body)) {
            this.forceSlidingStraw = true;
        } else {
            this.forceSlidingStraw = false;
        }
    },
	// Funcao Magica!!! Deve existir outro jeito!
	touchingDown: function (someone) {
		var yAxis = p2.vec2.fromValues(0, 1);
		var result = false;
		for (var i = 0; i < game.physics.p2.world.narrowphase.contactEquations.length; i++) {
			var c = game.physics.p2.world.narrowphase.contactEquations[i];
			if (c.bodyA === someone.data || c.bodyB === someone.data)        {
				var d = p2.vec2.dot(c.normalA, yAxis); // Normal dot Y-axis
				if (c.bodyA === someone.data){d *= -1;}
				if (d > 0.5){result = true;}
			}
		} return result;
	},
	touchingUp: function (someone) {
		var yAxis = p2.vec2.fromValues(0, 1);
		var result = false;
		for (var i = 0; i < game.physics.p2.world.narrowphase.contactEquations.length; i++) {
			var c = game.physics.p2.world.narrowphase.contactEquations[i];
			if (c.bodyA === someone.data || c.bodyB === someone.data)        {
				var d = p2.vec2.dot(c.normalA, yAxis); // Normal dot Y-axis
				if (c.bodyA === someone.data){d *= -1;}
				if (d < -0.5){result = true;}
			}
		} return result;
	},
	touchingLeft: function (someone) {
		var xAxis = p2.vec2.fromValues(1,0);
		var result = false;
		for (var i = 0; i < game.physics.p2.world.narrowphase.contactEquations.length; i++) {
			var c = game.physics.p2.world.narrowphase.contactEquations[i];
			if (c.bodyA === someone.data || c.bodyB === someone.data)        {
				var d = p2.vec2.dot(c.normalA, xAxis); // Normal dot Y-axis
				if (c.bodyA === someone.data){d *= -1;}
				if (d < -0.5){result = true;}
			}
		} return result;
	},
	touchingRight: function (someone) {
		var xAxis = p2.vec2.fromValues(1,0);
		var result = false;
		for (var i = 0; i < game.physics.p2.world.narrowphase.contactEquations.length; i++) {
			var c = game.physics.p2.world.narrowphase.contactEquations[i];
			if (c.bodyA === someone.data || c.bodyB === someone.data)        {
				var d = p2.vec2.dot(c.normalA, xAxis); // Normal dot Y-axis
				if (c.bodyA === someone.data){d *= -1;}
				if (d > 0.5){result = true;}
			}
		} return result;
	},
	isOnAir: function () {
		if( this.touchingDown(this.drop.getSpriteObject().body) ||
			this.touchingUp(this.drop.getSpriteObject().body)   ||
			this.touchingLeft(this.drop.getSpriteObject().body) ||
			this.touchingRight(this.drop.getSpriteObject().body)) {
				this.onAir = false;
		} else {
			this.onAir = true;
		}
	},
	checkOverlapCrabDrop: function (body1, body2) {
		// body1 is the drop, body2 is the crab.
		if (!this.touchingUp(body2)) {
			console.log('Matou o Player!!!!');
			this.drop.kill();
			//this.drop.userDead = true;
			return true;
		}
		return false;
    },
    checkCollisionUrchins: function(body1, body2) {
        // body1 is the drop, body2 is the sea urchin.
        this.drop.kill();

        return true;
    },
    checkOverlapWithLifeDrop: function (body1, body2) {
        // body1 is the drop; body2 is the life drop.
        if (!body2.hasCollided) {
			if (body2.sprite.name == 'lifedrop') {
				console.log('Player get the life drop!!!!');
				this.powUpSound.play();
				this.hud.increaseDropBar();
				body2.sprite.kill();
				body2.hasCollided = true;
				this.drop.playersize = 'big';
			} else {
				this.drinkEnergy(body1, body2);
			}
            return true;
        }

        return false;
    },
    drinkEnergy: function(body1, body2) {
		this.countCall++;
		if (this.countCall == 1) {
			body2.sprite.kill();
			body2.hasCollided = true;
			this.drop.jump(1500);
			this.jumpSound.play();
			this.smokeEmitter.start(false, 3000, 50);
			this.haveEnergy = true;
			var self = this;
			this.smokeTimer = setTimeout(function() {
					self.stopSmoke();
			}, 2000);

			this.drop.playerstate = 'energy';
		}
		if (this.countCall == 2) {
			this.countCall = 0;
		}
	},
	hitSunscreen: function () {
		this.drop.playerstate = 'sunscreen';
	},
	killDrop: function (body1, body2) {
        this.countCall++;
        if (this.countCall == 1 && !this.hotSandTimerActivated) {
            console.log('moreeeeeeeeeeeeeeeeeu!!! killlDrop');
            this.hud.decreaseDropBar();
            this.haveEnergy = true;
            this.smokeEmitter.on = true;
            this.smokeEmitter.start(false, 3000, 50);
            if (this.drop.playersize == 'big') {
                var self = this;
                if (this.hud.getDropCounter() == 0) {
                    setTimeout(function(time) {
                        self.hotSandTimerActivated = false;
                        self.stopKillTime(time);
                    }, 2000);
                    this.drop.playersize = 'small';
                    this.hotSandTimerActivated = true;
                } else {
                    setTimeout(function(time) {
                        console.log('* setTimeout called');
                        self.hotSandTimerActivated = false;
                        self.countCall = 0;
                        self.stopDecreaseCounter(time);
                    }, 2000);
                    this.hotSandTimerActivated = true;
                }
            } else if (this.drop.playersize == 'small') {
                // TODO: restart game
                this.drop.kill();
            }
        }
        if (this.countCall == 2) {
            this.countCall = 0;
        }
    },
	stopSmoke: function() {
		this.haveEnergy = false;
		this.smokeEmitter.on = false;
		clearTimeout(this.smokeTimer);
		this.drop.playerstate = 'normal';
	},
	stopKillTime: function(time) {
		this.drop.getSpriteObject().body.createGroupCallback(this.hotsandCG, this.timeOverKill, this);
		clearTimeout(time);
	},
    stopDecreaseCounter: function(time) {
		this.drop.getSpriteObject().body.createGroupCallback(this.hotsandCG, this.killDrop, this);
		clearTimeout(time);
    },
	timeOverKill: function () {
		this.drop.kill();
	},
	moveCrab: function (crab) {
		if (crab.name == "crab1") {
			if (this.touchingLeft(crab.body)) {
				crab.body.moveRight(400);
				crab.animations.play('walkR');
			} else if (this.touchingRight(crab.body)) {
				crab.body.moveLeft(400);
				crab.animations.play('walkL');
			} else {
			}
		} else {
			if (this.touchingRight(crab.body)) {
				crab.body.moveLeft(400);
				crab.animations.play('walkL');
			} else if (this.touchingLeft(crab.body)) {
				crab.body.moveRight(400);
				crab.animations.play('walkR');
			} else {
				//this.crab.body.velocity.x = -100;
			}
		}
	},
	crabKillDrop: function () {
		this.drop.kill();
	},
    insideStraw: function() {
        var dropSprite = this.drop.getSpriteObject();
        if (dropSprite.x < 2300) {
            if (!this.playerEnteredLeftStraw) {
                dropSprite.exists = false;
                this.game.camera.target = null;
                this.playerEnteredLeftStraw = true;
                this.strawUnderGround.animations.play('dropInsideRight');
            }
        } else {
            if (!this.playerEnteredRightStraw) {
                dropSprite.exists = false;
                this.game.camera.target = null;
                this.playerEnteredRightStraw = true;
                this.strawUnderGround.animations.play('dropInsideLeft');
            }
        }
    },
    strawAnimationComplete: function(sprite, animation) {
        var dropSprite = this.drop.getSpriteObject();
        if (this.playerEnteredLeftStraw) {
            dropSprite.reset(2483, this.game.world.height - 140);
            this.playerEnteredLeftStraw = false;
        } else {
            dropSprite.reset(2019, this.game.world.height - 140);
            this.playerEnteredRightStraw = false;
        }
        dropSprite.exists = true;
        this.drop.jump(700);
        this.game.camera.follow(dropSprite);
    },
	clickHowToPlay: function () {
		"use strict";
		this.game.state.start('HowToPlay');
	},
	clickCredits: function () {
		"use strict";
		this.game.state.start('Credits');
	}
//	restart: function(){
//		player.resetPosition();
//        if (lifeCounter==0){
//        	this.game.state.start('GameOver');
//        }
//		this.game.state.restart();
//	}
};