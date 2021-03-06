var Game = 
{
	create: function() {

		//Gets the seed and puts in level settings
		this.seedAndSettings();

		//Background
		background = game.add.tileSprite(0, 0, 200, 1280, 'redsky');
		background.tint = 0x808080;

		//Setup for game variables and audio
		this.gameSetup();
		this.audioSetup();

		//Create groups for the following assets
		this.initializeBullets();
		this.initializeDrops();
		this.initializeEnemies();

		//Screen borders
		this.createDespawnBars();

		//Player settings
		this.playerSetup();
		
		//make explosions
	    explosions = game.add.group();
	    explosions.createMultiple(200, 'explode');
	    explosions.forEach(function(boom)
	    {
	    	boom.animations.add('explode');
	    });

	    bigboom = game.add.group();
	    bigboom.enableBody = true;
	    bigboom.createMultiple(100, 'bombboom');

		this.uiSetup();
		this.prompter();

		//Makes it so that the endLevel() function only runs once per level
		endCondition = 0;
	},

	update: function() 
	{	
		this.checkLevelEnd();
	    if (!timepaused) background.tilePosition.y += 2;
		if (game.time.now > spawnTime && gameStart == true) this.makeEnemy();
		if (fightingBoss && game.time.now > bossAttackTime) this.bossAttack();
		this.fireBullet();

		//Updates the UI counters
		scoreText.text = "Score:" + score;
		lifeCounter.text = "x" + lives;
		if (!timepaused && gameStart == true) this.timerTick();

	    //Collision tests
	    game.physics.arcade.collide(meteors);
	    game.physics.arcade.overlap(hitbox, bossLasers, this.laserHit);
	    game.physics.arcade.overlap(hitbox, boss, this.bossTouched);
	    game.physics.arcade.overlap(bullets, boss, this.bossHit);
	    game.physics.arcade.overlap(bigboom, boss, this.bossBombed);
		game.physics.arcade.overlap(hitbox, drops, this.itemPickup);
	    game.physics.arcade.overlap(screenEdge, meteors, this.enemyOffScreen);
	    game.physics.arcade.overlap(bullets, meteors, this.bulletHit);
	    game.physics.arcade.overlap(hitbox, meteors, this.enemyTouched);
	    game.physics.arcade.overlap(bigboom, meteors, this.enemyBombed);

	    //wonder if there's a better way to do this other than duplicating code for every enemy type
	    game.physics.arcade.overlap(screenEdge, eyes,this.enemyOffScreen);
	    game.physics.arcade.overlap(bullets, eyes, this.bulletHit);
	    game.physics.arcade.overlap(hitbox, eyes, this.enemyTouched);
	    game.physics.arcade.overlap(bigboom, eyes, this.enemyBombed);
	},

	render: function() 
	{
		if(showFPS)game.debug.text(game.time.fps || '--', 2, 14, "#00ff00"); 
	},
	checkLevelEnd: function()
	{
		if (score >= 5000 && endCondition == 0 && levelSettings['level'] == 1)
		{
			this.endLevel();
			endCondition++;
		}
		else if (timeDifference >= 30000 && endCondition == 0 && levelSettings['level'] == 2)
		{
			this.endLevel();
			endCondition++;
		}
		else if (score >= 10000 && endCondition == 0 && levelSettings['level'] == 3)
		{
			this.startBossFight();
			endCondition++;
		}
	},
	seedAndSettings: function()
	{
		timeDifference = 0; //Defined here as a global as an accurate time tracker

		var seed = parseInt(Cookies.get("seed"));
		if (typeof Cookies.get("seed") != 'undefined') Math.seedrandom(seed);
		else Math.seedrandom();

		game.stage.smoothed = false;
		game.time.advancedTiming = true;
		that = this;
		verbose = false;
		showFPS = false;

		if (typeof levelSettings == "undefined")
		{
		    console.log("levelSettings is undefined, default to lv1");
		    levelSettings = lv1;
		}
		else
		{
			console.log(levelSettings);
		}
	},

	//Setup for all required gameplay variables
	gameSetup: function()
	{
		pauseLength = 4;
		shootRateMultiplier = 1;
		shotSpeedMultiplier = 1;
		shotSpread = 1;
		iFrames = 1;
		baseShotSpeed = -200;
		dropRate = 0.05;

		spawnDelay = levelSettings["spawnDelay"];
		spawnTime = 0;
		bulletTime = 0;
		bossAttackTime = 0;
		hurtTime = 0;
		shieldDuration = 2000; // 2 seconds
		canShoot = true;
		timepaused = false;
		invulnerable = false;
		levelEnding = false;
		fightingBoss = false;

		enemyToughness = levelSettings["enemyToughness"];
		score = levelSettings["score"];
		lives = levelSettings["lives"];
		if (typeof levelSettings["lifeUpCounter"] === "undefined") lifeUpCounter = 0;
		else lifeUpCounter = levelSettings["lifeUpCounter"];
		
		// Get potential extra lives from cookies
		bonusLives = parseInt(Cookies.get("bonus lives"));
		if (!isNaN(bonusLives)) lives += bonusLives;

		bonusShield = parseInt(Cookies.get("bonus shield"));
		if (!isNaN(bonusShield)) shieldDuration += bonusShield;

		bonusSpread = parseInt(Cookies.get("bonus spread"));
		if (!isNaN(bonusSpread)) shotSpread += bonusSpread;
	},

	//Setup for all required audio files
	audioSetup: function()
	{
		//background music & sound effects
		bgm         = game.add.audio(levelSettings["bgm"], 0.15, true);
		bossBGM		= game.add.audio('bossBGM', 0.15, true);
		warudo      = game.add.audio('warudoSFX', 0.7);
		warudoEnd   = game.add.audio('warudoEndSFX', 1);
		clockTick   = game.add.audio('clockTick', 0.3, true);
		boomb       = game.add.audio('explosionSFX', 0.2);
		fanfare		= game.add.audio('fanfare', 0.3);

		playerHurt  = game.add.audio('hurt', 0.15);
		lifeUp  	= game.add.audio('1up', 0.7);

		bossHit 	= game.add.audio('bossHit1', 0.1);
		bossHit1 	= game.add.audio('bossHit2', 0.2);
		bossHit2 	= game.add.audio('bossHit3', 0.2);
		bossHurt 	= game.add.audio('bossHurt', 0.2);
		bossDying 	= game.add.audio('bossDying', 0.1);
		bossDeath 	= game.add.audio('bossDeath', 0.25);
		bossCharge 	= game.add.audio('laserCharge', 0.25);
		bossShoot 	= game.add.audio('laserShot', 0.15);

		eyeHit      = game.add.audio('eyehit', 0.1);
		eyeDeath    = game.add.audio('eyedeath', 0.1);

		rockHit     = game.add.audio('rockhit', 0.1);
		rockDeath   = game.add.audio('rockdeath', 0.1);

		shieldUp    = game.add.audio('shieldUp', 0.15);
		shieldTouch = game.add.audio('shieldTouch', 0.1);
		shieldDown  = game.add.audio('shieldDown', 0.15);
		
		sfxGroup = {boomb, eyeHit, eyeDeath, rockHit, bossHurt, bossHit, bossHit1, bossHit2, bossShoot, bossCharge, 
			rockDeath, shieldUp, shieldTouch, shieldDown, playerHurt};

		for(var i = 0; i < sfxGroup.length; i++)
		{
			sfxGroup[i].allowMultiple = true;
		}

		//Play looping background music for the level
		bgm.play();
	},

	//Creates the bullets fired by the player
	initializeBullets: function()
	{
		//Group to store bullets
	 	bullets = game.add.group();
	    bullets.enableBody = true;
	    bullets.physicsBodyType = Phaser.Physics.ARCADE;

	    //CHANGE 500 MAYBE? Indicates max bullets on screen, heavily affects FPS
	    for (var i = 0; i < 500; i++)
	    {
	        var b = bullets.create(0, 0, 'fireball');
	        b.scale.setTo(0.01);
	        b.name = 'bullet' + i;
	        b.anchor.setTo(0.5, 0.5);
	        b.exists = b.visible = false;
	        b.checkWorldBounds = true;
	        b.events.onOutOfBounds.add(resetFunct, this);
	        b.tween = null;
	    }
	},

	//Creates power up drops from enemies
	initializeDrops: function()
	{
		//Group to store drops
		drops = game.add.group();
		drops.enableBody = true;
		drops.physicsBodyType = Phaser.Physics.ARCADE;

	    for (var i = 0; i < 100; i++)
	    { 
	        var d = drops.create(0, 0, 'shield');
	        d.dropType = 0;
	        d.name = 'drop' + i;
	        d.scale.setTo(0.6)
	        d.anchor.setTo(0.5, 0.5);
	        d.exists = d.visible = false;
	        d.checkWorldBounds = d.body.collideWorldBounds = true;
	        d.events.onOutOfBounds.add(resetFunct, this);
	        d.body.maxVelocity.setTo(150);
	        d.timer = null;
	    }
	},

	//Creates all the enemies used in the level
	initializeEnemies: function()
	{
		//Make enemy groups
		eyes = game.add.group();
	    meteors = game.add.group();

		eyes.enableBody = meteors.enableBody = true;
		eyes.physicsBodyType = meteors.physicsBodyType = Phaser.Physics.ARCADE;

	    for (var i = 0; i < 100; i++)
	    { 
	        var e = eyes.create(0, 0, 'eyes');
	        e.name = 'eyes' + i;
			e.anchor.setTo(0.5, 0.5);
			e.animations.add("fly", 
				[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], 20, true);
			e.play('fly');
	        e.exists = e.visible = false;
	        e.hp = enemyToughness;
	        e.worth = 100;
	    }

	    for (var i = 0; i < 100; i++)
	    { 
	        var e = meteors.create(0, 0, 'meteor');
	        e.name = 'rock' + i;
			e.anchor.setTo(0.5, 0.5);
			e.animations.add("fly", 
				[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 
			     16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29], 20, true);
			e.play('fly');
	        e.exists = e.visible = false;
	        e.hp = enemyToughness + 1;
	        e.worth = 50;
	    }

		bossLasers = game.add.group();
	    bossLasers.enableBody = true;

	    for (var i = 0; i < 10; i++)
	    { 
	        var b = bossLasers.create(0, 0, 'bullet');
	        b.name = 'bossLaser' + i;
	        b.anchor.setTo(0.5,0);
	        b.exists = false;
	        b.visible = false;
	        b.tangible = false;
	    }

	    boss = game.add.sprite(0, 0, 'dorito');
	    boss.name = "why";
	    boss.anchor.setTo(0.5);
	    boss.exists = false;
	    boss.visible = false;
	    boss.scale.setTo(0.6,0.6);
	    bossMaxHP = 200;
	    boss.hp = bossMaxHP;
	    bossHurtTime = 0;
	    bossHurtSfxTime = 0;
	    bossHpPercent = boss.hp/bossMaxHP;
	    game.physics.enable(boss, Phaser.Physics.ARCADE);

	    bossHPBarBack = game.add.sprite(0, game.world.height-5, "bullet");
	    bossHPBar = game.add.sprite(0, game.world.height-5, "bullet");
	    bossHPBar.scale.setTo(1,0.5);
	    bossHPBar.anchor.setTo(0)
	    bossHPBar.width = 0;
	    bossHPBar.tint = 0xFF0000

	    bossHPBarBack.scale.setTo(1,0.5);
	    bossHPBarBack.anchor.setTo(0)
	    bossHPBarBack.width = 0; 	
	},

	//Create barriers on the edges of the screen to despawn offscreen enemies
	createDespawnBars: function()
	{
		//Group to store the barriers
		screenEdge = game.add.group();
		screenEdge.enableBody = true;
		screenEdge.physicsBodyType = Phaser.Physics.ARCADE;

		//Make the barriers according to screen specifications
		screenTopBar    = screenEdge.create(0, -50, 'preloaderBar');
		screenBottomBar = screenEdge.create(0, game.world.height + 50, 'preloaderBar');
		screenLeftBar   = screenEdge.create(-50, 0, 'preloaderBar');
		screenRightBar  = screenEdge.create(game.world.width + 50, 0, 'preloaderBar');

		screenTopBar.width   = screenBottomBar.width = game.world.width*1.5;
		screenLeftBar.height = screenRightBar.height = game.world.height*1.5;

		//Shrinks size of left barrier to hide it offscreen
		screenLeftBar.width = 10; 
	},

	playerSetup: function()
	{
		sprite = game.add.sprite(game.world.width*0.5, game.world.centerY*1.8, 'dragon');
		hitbox = game.add.sprite(0, -50, "bullet");
		invuln = game.add.sprite(0, -48, "invuln");

		sprite.anchor.setTo(0.5, 0.8);
		hitbox.anchor.setTo(0.5, 0.5);
		invuln.anchor.setTo(0.5, 0.5);

		sprite.scale.setTo(0.35);
		invuln.scale.setTo(1.25);

		sprite.addChild(hitbox);
		sprite.addChild(invuln);

		invuln.alpha = 0;

		sprite.inputEnabled = true; 
		sprite.input.enableDrag(true);
		
		game.physics.enable(sprite, Phaser.Physics.ARCADE);
		//sprite.body.collideWorldBounds = true;
	},

	//Setup for all UI 
	uiSetup: function()
	{
		//Game timer setup
		if (typeof levelSettings["TimerStart"] == "undefined") runTimerStart = new Date();
		else runTimerStart = levelSettings["TimerStart"];
		if (typeof levelSettings["TimerPaused"] == "undefined") runTimerPaused = 0;
		else runTimerPaused = levelSettings["TimerPaused"];

		runTimerString = "00:00.00";
		runTimer = game.add.bitmapText(game.world.width, game.world.height - 15, 'buttonStyle', runTimerString, 9);
		runTimer.anchor.setTo(1, 0);

		//Score string
		scoreText = game.add.bitmapText(5, 5, 'buttonStyle', "Score:" + score, 8);

		//Live counter
		lifeIcon = game.add.sprite(0, game.world.height - sprite.height + 12, 'dragon');
	    lifeIcon.scale.setTo(0.2);
	    lifeCounter = game.add.bitmapText(lifeIcon.width, 
	    	game.world.height - lifeIcon.height + 10, 'buttonStyle', "x" + lives, 9);
	    
	    //Pause button
	    pauseButton = game.add.button(game.world.width - 25, 5, 'pauseBtn', this.pauseMenu);
	    pauseButton.scale.setTo(0.8, 0.8);

	    //shooting toggle AKA debug button make it do whatever you want for testing
	    shootToggle = game.add.button(game.world.width - 50, 5, 'pauseBtn', 
	    //function(){canShoot = !canShoot; console.log("canShoot = "+ canShoot)});
	    //function(){fanfare.play();});
	    //function(){that.endLevel();});
	    function(){that.startBossFight()});

	    shootToggle.scale.setTo(0.8, 0.8);
	    shootToggle.tint = 0xff0000;
	    shootToggle.alpha = 0;
	},

	//Controls the display at the start of the level
	prompter: function()
	{
		gameStart = false;
	    duration = 2000;

		game.time.events.add(0, function(){
			textY = game.world.centerY*0.5;
			levelText = game.add.bitmapText(game.world.width*0.51, textY, 'buttonStyle', "Level " + levelSettings["level"], 10);
			goalText = game.add.bitmapText(game.world.width*0.51, game.world.centerY*0.65, 'buttonStyle', levelSettings["objective"], 8);
			levelText.tint = 0x00FFFF;
			levelText.anchor.setTo(0.5, 0.5);
			goalText.anchor.setTo(0.5, 0.5);
		});
		game.time.events.add(duration, function(){
			gameStart = true;
			levelText.kill();
			goalText.kill();
		});
	},

	pauseTime: function()
	{
		function uiFadeIn(object){
			game.add.tween(object).to({ alpha: 1}, 300, Phaser.Easing.Quadratic.Out, true);
		}
		function uiFadeOut(object){
			game.add.tween(object).to({ alpha: 0}, 700, Phaser.Easing.Quadratic.Out, true);
		}
		var x = hitbox.body.x;
		var y = hitbox.body.y;

		if (timepaused){
			eyeHit.allowMultiple = false;
			eyeDeath.allowMultiple = false;
			rockHit.allowMultiple = false;
			rockDeath.allowMultiple = false;
			game.time.events.remove(resumeTime);
			clockTick.stop();
			canShoot = false;
			warudoEnd.play();
			game.add.tween(background).to( { tint: 0x808080}, 1000, Phaser.Easing.Linear.None, true);
			game.time.events.add(1250, unpause, this);
			function unpause(){
				bgm.resume();
				bossBGM.resume();
				timepaused = false;
				uiFadeIn(runTimer);
				uiFadeIn(lifeIcon);
				uiFadeIn(lifeCounter);
				uiFadeIn(scoreText);
				meteors.forEachExists(function(enemy){that.enemyUnfreeze(enemy)});
		    	eyes.forEachExists(function(enemy){that.enemyUnfreeze(enemy)});
		    	drops.forEachExists(function(drops){
		    		if(drops.warudo){
		    		if(drops.warudo[0] != 0){
						drops.body.velocity.x = drops.warudo[0];
			    		drops.body.velocity.y = drops.warudo[1];
			    		drops.tint = 0xffffff;
		    		}}
		    		if(!drops.warudo){
			            drops.body.velocity.y = 100;
			        }
		    	});
		    	canShoot = true;
				bullets.forEachExists(function(bullets){bullets.body.velocity.y = baseShotSpeed * shotSpeedMultiplier;});
				if(fightingBoss)
				{
					game.add.tween(bossHPBar).to({width:game.world.width*bossHpPercent}, 500, Phaser.Easing.Quadratic.InOut, true);
					if (boss.hp <= 0) that.endBossFight();
				}
				spawnTime = game.time.now+3000;
				eyeHit.allowMultiple = true;
				eyeDeath.allowMultiple = true;
				rockHit.allowMultiple = true;
				rockDeath.allowMultiple = true;
			}
			
		}
		else{
			timepaused = true;
			uiFadeOut(runTimer);
			uiFadeOut(lifeIcon);
			uiFadeOut(lifeCounter);
			uiFadeOut(scoreText);
			bgm.pause();
			bossBGM.pause();
			warudo.play();
			var ring = bigboom.getFirstExists(false);
			ring.scale.setTo(0.2);
			ring.anchor.setTo(0.5);
			ring.reset(x+5, y+5);
			var boomtime = 700;

			game.add.tween(ring.scale).to( { x: 30,y:30 }, boomtime, Phaser.Easing.Linear.None, true);
			game.add.tween(background).to( { tint:0x333333 }, boomtime*2, Phaser.Easing.Linear.None, true);
			game.time.events.add(boomtime, 
				function(){
					game.add.tween(ring.scale).to( { x: 0,y:0 }, boomtime, Phaser.Easing.Linear.None, true);
				});
			game.time.events.add(100+3*boomtime, function(){
				ring.kill();
				clockTick.play();
				resumeTime = game.time.events.add(pauseLength*1000, that.pauseTime, this);
			});
			spawnTime = game.time.now + 999999;
			bullets.forEachExists(function(bullets){game.add.tween(bullets.body.velocity).to( { y:0 }, 1000, Phaser.Easing.Quadratic.Out, true);});
			drops.forEachExists(function(drops){that.enemyFreeze(drops)});
			eyes.forEachExists(function(enemy){that.enemyFreeze(enemy)});
			meteors.forEachExists(function(enemy){that.enemyFreeze(enemy);});
		}
	},

	enemyFreeze: function(enemy){
		enemy.tint = 0xafb3cf;
		enemy.warudo ={"0":enemy.body.velocity.x,"1":enemy.body.velocity.y,
						"2":enemy.body.gravity.x, "3":enemy.body.gravity.y};
		game.add.tween(enemy.body.velocity).to( { x:0, y:0 }, 1250, Phaser.Easing.Quadratic.Out, true);
		enemy.animations.stop();
		enemy.body.gravity.x = 0;
        enemy.body.gravity.y = 0;
	},

	enemyUnfreeze: function(enemy){
		enemy.tint = 0xffffff;
		enemy.body.velocity.x = enemy.warudo[0];
		enemy.body.velocity.y = enemy.warudo[1];
		enemy.body.gravity.x = enemy.warudo[2];
		enemy.body.gravity.y = enemy.warudo[3];
		enemy.play('fly');
		that.victimCheck(enemy);
	},

	//Setup for enemy spawn conditions and spawn locations
	makeEnemy: function() 
	{	
		var x, xspeed, yspeed;

		//Meteor spawner, randomizes speed
		if (Math.random() > levelSettings["makeEnemy%"])
		{
			x      = randomIntFromInterval(0, game.world.width);
			xspeed = randomIntFromInterval(-40, 40);
			yspeed = randomIntFromInterval(150, 250);
			this.spawnEnemy(levelSettings["Enemy Type 1"], x, -10, xspeed, yspeed);
		}
		else //Eye spawner, randomizes acceleration and speed values
		{
			var mult = 1;
			if (Math.random() > 0.5) 
			{
				x = -10;
			}
			else 
			{
				mult = -1; 
				x = game.world.width + 10;
			}

			var y = randomIntFromInterval(0, game.world.height-60);
			var xaccel = randomIntFromInterval(0, 80)*mult;
			var yaccel = randomIntFromInterval(0, 80)*mult;
			xspeed = randomIntFromInterval(75, 200)*mult;
			yspeed = randomIntFromInterval(50, 150)*mult;

			if (Math.random() > 0.5) yspeed *=-1;
			if (Math.random() > 0.5) xaccel *=-1;
			if (Math.random() > 0.5) yaccel *=-1;
			if (Math.random() > 0.9) yspeed = xaccel = yaccel = 0;

			//After randomizing values, spawn eyes in clusters of 5
			for(var i = 0; i < 5; i++)
			{
	    		game.time.events.add(150*i, function(){
	    			that.spawnEnemy(levelSettings["Enemy Type 2"], x, y, xspeed, yspeed, xaccel, yaccel)});
	    	}
		}
	},

	//Handles the spawning coordinates for enemies
	spawnEnemy: function(name, x, y, xspeed, yspeed,xaccel, yaccel)
	{
        if (!timepaused)
        {

        	var enemy;
        	switch (name)
        	{
        	case "eyes":
       			enemy = eyes.getFirstExists(false);
       			break;
       		case "meteors":
       			enemy = meteors.getFirstExists(false);
       			break;
       		}

       		if (enemy)
       		{
       			if(xaccel == null) xaccel = 0;
       			if(yaccel == null) yaccel = 0;

       			//Flip horizontally
       			if(x < game.world.centerX) enemy.scale.x *=-1;
       			enemy.reset(x, y);
       			enemy.body.velocity.x = xspeed;
       			enemy.body.velocity.y = yspeed;
       			enemy.body.gravity.x = xaccel;
       			enemy.body.gravity.y = yaccel;
       			spawnTime = game.time.now + spawnDelay;
       		}
       	}
	},
	
	enemyOffScreen: function(bar, enemy)
	{
		that.enemyReset(enemy);
	},

	fireBullet: function() 
	{
		if (!canShoot) return;
    	if (game.time.now > bulletTime) 
    	{
    		shootDelay = 200 / shootRateMultiplier;
    		var shotOffsetX;
    		switch(shotSpread)
    		{
    			case 1: shotOffsetX = [0]; break;
				case 2: shotOffsetX = [-10, 10]; break;
				case 3: shotOffsetX = [-10, 0, 10]; break;
				case 4: shotOffsetX = [-15, -5, 5, 15]; break;
				case 5: shotOffsetX = [-15, -7, 0, 7, 15]; break;
				default: shotOffsetX = [0];
    		}
        	for (var i = 0; i < shotSpread; i++) 
            {
                var bullet = bullets.getFirstExists(false);
                if (bullet) 
                {	
                    bullet.reset(sprite.x + shotOffsetX[i], sprite.y - 25);
                    bullet.body.velocity.y = baseShotSpeed * shotSpeedMultiplier;
                    if (timepaused){
                    	var tween = game.add.tween(bullet.body.velocity).to( { y:0 }, 1000, Phaser.Easing.Quadratic.Out, true);
                    	bullet.tween = tween;
                    }
                }
            }
        	bulletTime = game.time.now + shootDelay;
        }
	},
	//Boss for some reason doesn't like bulletHit() and refuses to work properly
	bossHit: function(boss, shot)
	{
		resetFunct(shot);
		score++;
		lifeUpCounter ++;
		that.bossHurt(2);
		var bossX = boss.body.x+15;
		var bossY = boss.body.y+15;

		//RNG to check if an item drops
	    if (Math.random() < dropRate/2)
	    {	
	    	explodeFunct(bossX, bossY);
	    	bossHurt.play();
	    	that.makeDrops(bossX, bossY);
	    } 	
	},
	//Handles bullet collision
	bulletHit: function(shot, victim) 
	{
		//Removes the bullet sprite and update on contact
		resetFunct(shot);
		score++;
		lifeUpCounter ++;
	    victim.hp--;

	    //Change tint back after delay in millisecond
	    victim.tint = 0xFF0000;
	    game.time.events.add(30, function(){victim.tint = 0xFFFFFF});

	    //Check if victim dies
	    that.victimCheck(victim);
	},

	//Checks for enemy deaths and primes drops
	victimCheck: function(victim)
	{
		//If the enemy dies, add to the score and roll for a drop
		if(victim.hp <= 0 && !timepaused)
	    {
	    	that.victimDies(victim, victim.worth);

		    //RNG to check if an item drops
		     if (Math.random() < dropRate)
		     {
		     	//If pass the check twice, drop the rarer timestop power
		     	if (Math.random() < 5*dropRate) that.makeDrops(victim.body.x, victim.body.y, 2);
		     	else that.makeDrops(victim.body.x, victim.body.y);
		     } 	 	
		}

		//Play the damage SFX if the enemy lives
		else if(victim.key == "eyes") eyeHit.play();
		else if(victim.key == "meteor") rockHit.play();

	},

	//Enemy death setup
	victimDies: function(victim, scoreGain)
	{
			if(victim.key == "eyes") eyeDeath.play();
			else if(victim.key == "meteor") rockDeath.play();
		    that.enemyReset(victim);

		    //Increase the score
		    score += scoreGain;
	    	lifeUpCounter += scoreGain;

	    	//Grant a 1-up at score milestones
		    if(lifeUpCounter > 5000)
		    {
		    	this.livesUp();
		    	lifeUp.play();
		    	lifeUpCounter = 0;
		    }

		    //Generate a pop up of the enemy's score value and explode them
		    if(scoreGain != 0) textPop(scoreGain.toString(), victim.body.x, victim.body.y);
		    explodeFunct(victim.body.x, victim.body.y);
	},

	//Generate extra life based on score
	livesUp: function()
	{
    	if(!levelEnding)
    	{
			var pop = textPop("1-up", lifeCounter.x, lifeCounter.y - 15);
			pop.forEachExists(function(letter){letter.tint = 0x00ffff}, this);
			game.time.events.add(1000, function(){lives++});
		}
	},

	itemPickup: function(player, drop) {
		if (typeof drop.timer != "undefined")
    		game.time.events.remove(drop.timer);
	    resetFunct(drop);
	    //applies buff
	    //if you come up with more buff ideas, simply add another case
    	//console.log(drop.key);
	    switch(drop.dropType){
	    	case 0: 	
    				if (typeof invulnEvent != "undefined")
    						game.time.events.remove(invulnEvent);
    				invuln.alpha = 0.8;
    				invuln.scale.setTo(0);
    				shieldUp.play();
    				canShoot = false;
    				game.add.tween(invuln.scale).to( {x:1.25, y:1.25}, 150, Phaser.Easing.Linear.None, true);
    				invulnerable = true;
    				invulnEvent = game.time.events.add(shieldDuration, function(){
    					shieldDown.play();
    					invuln.alpha = 0;
    					invulnerable = false;
    					that.prepBlink();
    					hurtTime = game.time.now + iFrames*1000;
    					player.alpha = 1;
    					canShoot = true;
    				});
    				break;
	    	case 1: 	
    				that.bombPickup(player.body.x, player.body.y);
    				break;
	    	case 2: 	
    				drops.forEachExists(function(drops){
    					if (drops.key != "shield") drops.kill();
			    	});
			    	that.pauseTime();
    				break;
	    	default: console.log("I don't know what you just picked up"); break;
	    }
	},

	makeDrops: function(x, y, type)
	{
		drop = drops.getFirstExists(false);
       	if (drop)
       	{	
       		var item;
       		//if asked to make a type beyond what we have, we default to rng
       		if(type != null && type < 3) item = type;
       		else item = randomIntFromInterval(0, 1);
       		drop.dropType = item;

       		switch(item)
       		{
       			case 0: drop.loadTexture("shield"); break;
       			case 1: drop.loadTexture("bomb"); break;
       			case 2: drop.loadTexture("watch"); break;
       		}
       		var xmult = 1;
       		var ymult = 1;
            drop.reset(x, y);
            drop.body.collideWorldBounds = true;
            drop.body.bounce.set(1.3);
            if (Math.random() > 0.5) ymult = -1;
            if (Math.random() > 0.5) xmult = -1;
            if(!timepaused){
            drop.body.velocity.y = 70*ymult;
            drop.body.velocity.x = 70*xmult;
            drop.timer = game.time.events.add(4500, function(){stopCollide(drop)}, this);
	            function stopCollide(drop){
	            	drop.body.collideWorldBounds = false;
	            }
        	}
        }
	},

	bombPickup: function(x, y)
	{
		//var bigboom = game.add.sprite(x, y, 'bombboom');
		var boom = bigboom.getFirstExists(false);
		boomb.play();
		boom.scale.setTo(0.2);
		boom.anchor.setTo(0.5);
    	boom.reset(x+5, y+5);
		var boomtime = 1000;

		//boom.alpha = 1;
		game.add.tween(boom.scale).to( { x: 30,y:30 }, boomtime, Phaser.Easing.Linear.None, true);
		//game.add.tween(bigboom).to( { alpha:0 }, boomtime, Phaser.Easing.Linear.None, true);
		game.time.events.add(boomtime, function(){boom.kill()});
		spawnTime = game.time.now + 2000;
	},

	enemyBombed: function(boom, enemy) 
	{
    	if(!timepaused)that.victimDies(enemy, 50);
    },

    bossBombed: function(boom, boss)
    {
    	//due to how collision works this actually hurts ~50 times
    	if(!timepaused)that.bossHurt(0.5);

    },

	enemyReset: function(enemy){
	    if(enemy.key == "meteor") enemy.hp = enemyToughness + 1;
    	else enemy.hp = enemyToughness;
		if(enemy.scale.x <0) enemy.scale.x *=-1;
		enemy.tint = 0xffffff;
		enemy.play("fly");
    	resetFunct(enemy);
	},

	enemyTouched: function(player, enemy) 
	{
    	if(invulnerable){
    		that.victimDies(enemy, 50);
    		shieldTouch.play();
    		return;
    	}
    	if(!timepaused){
    		that.killFunct();
    		that.enemyReset(enemy);
    	}
    },

	bossTouched: function(player, boss) 
	{
    	if (fightingBoss)
    	{
    		if(invulnerable)
	    	{
	    		if(game.time.now > bossHurtTime)
	    		{
					that.bossHurt(2.5);
					shieldTouch.play();
					bossHurtTime = game.time.now + 200;
	    		}
				return;
	    	}
	    	if(!timepaused){
	    		that.killFunct();
	    	}
    	}
    	
    },
    laserHit: function(player, laser)
    {
    	if(!invulnerable && !timepaused && laser.tangible )
    		that.killFunct();
    },

    bossHurt: function(damage)
    {	
    	if(game.time.now > bossHurtSfxTime)
		{
			var sound = randomIntFromInterval(0, 2);
	    	switch (sound)
	    	{
	    		case 0: bossHit.play(); break;
	    		case 1: bossHit1.play(); break;
	    		case 2: bossHit2.play(); break;
	    		default:  bossHit.play();
	    	}
	    	bossHurtSfxTime = game.time.now + 200;
		}
    	boss.hp -= damage;
	    boss.tint = 0xFF0000;
	    game.time.events.add(30, function(){boss.tint = 0xFFFFFF});
    	bossHpPercent = boss.hp/bossMaxHP;
    	if(!timepaused)game.add.tween(bossHPBar).to({width:game.world.width*bossHpPercent}, 500, Phaser.Easing.Quadratic.InOut, true);
    	if(!timepaused && boss.hp <= 0) that.endBossFight();
    },
	killFunct: function()
	{
		if(game.time.now > hurtTime)
		{
		    if (lives >= 0)
		    {
			    explodeFunct(sprite.body.x, sprite.body.y);
			    lives--;
			    playerHurt.play();
			    hurtTime = game.time.now + iFrames*1000;
			    this.prepBlink();
		    }
		    if (lives < 0)
		    {
			    this.gameOver();
		    }	
		}
	},

	prepBlink: function()
	{
		blinkBool = true;
	    for(i = 1; i <= iFrames*10; i++)
	    {
	    	game.time.events.add(100*i, this.spriteBlink);
	    }
	},

	spriteBlink: function()
	{
		if (!blinkBool) sprite.alpha = 1;
		else sprite.alpha = 0;
		blinkBool = !blinkBool;
	},

	destroyEverything: function(){
		bgm.fadeOut(800);
		bullets.killAll();
		drops.killAll();
		enemyDespawnCounter = 0;
		removing = game.add.group();
    	eyes.forEachExists(function(enemy){that.enemyFreeze(enemy);}); 
    	eyes.moveAll(removing);
    	meteors.forEachExists(function(enemy){that.enemyFreeze(enemy);}); 
    	meteors.moveAll(removing);
    	removing.shuffle();
    	game.time.events.add(600, function(){
	    	removing.forEachExists(function(victim){
	    		game.time.events.add(120*enemyDespawnCounter, function(){
	    			that.victimDies(victim, 10)}, this);
    			enemyDespawnCounter++});
	    });
	},

	//End of level dragon animation
	dragonFlyAway: function()
	{
		sprite.inputEnabled = false;
    	game.add.tween(sprite).to({x: game.world.centerX, y: game.world.centerY*1.8}, 
    		1000, Phaser.Easing.Quadratic.InOut, true);
    	game.time.events.add(1300, function(){
    		game.add.tween(sprite).to({y: 0, alpha: 0}, 1200, Phaser.Easing.Quadratic.In, true);}, this);
	},
	startBossFight: function()
	{	
		bossBGM.stop();
		canShoot = false;
		spawnTime += 9999999;
		this.destroyEverything();
		bossText = game.add.bitmapText(game.world.width*0.51, game.world.centerY*0.9, 'buttonStyle', "??????", 10);
		bossText.anchor.setTo(0.5, 0.5);
		game.time.events.add(3000, function(){
			bossText.kill();
			bossText = game.add.bitmapText(game.world.width*0.52, game.world.centerY*0.9, 'buttonStyle', "Defeat the boss!", 10);
			bossText.anchor.setTo(0.5, 0.5);
		});
		game.time.events.add(5000, function(){
			bossText.kill();
		});
		bossHPBar.width = 0;
		bossHPBarBack.width = 0;
		bossHPBarBack.alpha = 1;
		
		boss.hp = bossMaxHP;
		var bossDescent = game.add.tween(boss).to({ y:game.world.height*0.2}, 2000, Phaser.Easing.Quadratic.Out, false);
		var bossHpFill = game.add.tween(bossHPBar).to({width:game.world.width}, 2000, Phaser.Easing.Linear.None, false);
		var bossHpBackFill = game.add.tween(bossHPBarBack).to({width:game.world.width}, 2000, Phaser.Easing.Linear.None, false);
		var bossStart = game.time.events.loop(500, function(){
	    	if(!removing.getFirstExists())
	    	{
				boss.reset(game.world.centerX, -boss.height);
				game.time.events.remove(bossStart);
		    	bossDescent.start();
		    	bossBGM.play();
		    }
		});
	    bossDescent.onComplete.addOnce(function(){
	    	bossHpBackFill.start();
	    	game.time.events.add(400, function(){
	    		bossHpFill.start();
	    	});
	    });
	    bossHpFill.onComplete.addOnce(function(){
	    	var bossMoveX = boss.x;
	    	var bossMoveY = boss.y;
	    	canShoot = true;
	    	bossHPBarBack.alpha = 0;
	    	fightingBoss = true;
	    	bossMovement = game.time.events.loop(2000, function(){
	    		while (Math.abs(boss.x - bossMoveX) < 10)
	    			bossMoveX = randomIntFromInterval(20, 180);
	    		while (Math.abs(boss.y - bossMoveY) < 10)
	    			bossMoveY = randomIntFromInterval(20, 100);

	    		game.add.tween(boss).to({
	    			x: bossMoveX,
	    			y: bossMoveY
	    		}, 700, Phaser.Easing.Quadratic.Out, true);
	    	});
	    });
	},
	bossAttack: function()
	{
		var targetX = randomIntFromInterval(20, 180);
		var target = bossLasers.getFirstExists(false);
			if (target)
			{
				target.reset(targetX, 0);
				target.tangible = false;
				target.height = 0;
				target.width = 5;
				target.alpha = 0.9;
				target.tint = 0xff0000;
				bossCharge.play();
				var tweaen = game.add.tween(target).to({height: game.world.height}, 300, Phaser.Easing.Linear.None, true);
				target.tweaen = tweaen;
			}
		game.time.events.add(450, function()
		{	
			resetFunct(target);
			bossCharge.stop();
			bossShoot.play();
			var laser = bossLasers.getFirstExists(false);
	            if (laser)
	            {	
	            	var timer, timer2, tween
	            	laser.reset(targetX, 0);
	            	laser.tangible = true;
	            	laser.height = game.world.height;
	            	laser.width = 20;
	            	laser.alpha = 0.9;
	            	target.tint = 0xffffff;
	            	var timer = game.time.events.add(800, function(){
	            		var tween = game.add.tween(laser).to({width: 5, alpha: 0}, 500, Phaser.Easing.Linear.None, true);
	            		var timer2 = game.time.events.add(480, function(){resetFunct(laser)});
	            	});
	            	laser.timer = timer;
        			laser.timer2 = timer2;
            		laser.tween = tween;
	            }
	    });
		bossAttackTime = game.time.now + 1600;
	},
	endBossFight: function()
	{	
		if(!fightingBoss) return;
		fanfare.play();
		canShoot = false;
		fightingBoss = false;
		bossHurtTime = 9999999;
		bullets.killAll();
		bossBGM.fadeOut(500);
		game.time.events.remove(bossMovement);
		function bossDies(){
			bossHPBar.alpha = 0;
			bossDying.play();
			game.add.tween(boss).to({tint:0x808080}, 1300, Phaser.Easing.Linear.None, true);
			for(var i = 0; i < 10; i++)
				{
		    		game.time.events.add(130*i, function(){
		    			bossDeath.play();
		    			explodeFunct(boss.body.x+0.6*boss.width*Math.random(), boss.body.y+0.5*boss.height*Math.random());
		    		});
		    	}
		    game.time.events.add(2000, function(){
		    	textPop("10000", boss.body.x+10, boss.body.y+20);
				score += 10000;
		    	game.add.tween(boss).to({y:game.world.height+50}, 3500, Phaser.Easing.Linear.None, true);
		    	that.endLevel();
		    	endCondition = 1;
		    	});
		}
		game.time.events.add(600, function(){bossDies()}, this);
		
	},

	endLevel: function()
	{
		levelEnding = true;
		canShoot = false;
		spawnTime += 9999999;
		this.destroyEverything();

		game.time.events.add(1000, function(){that.dragonFlyAway()});

	    //END THE GAME AND PAUSE
	    game.time.events.loop(750, function(){
	    	if(!removing.getFirstExists() && sprite.y == 0)
	    	{
		    	scoreText.kill(); 
		    	lifeCounter.kill();
		    	lifeIcon.kill();
		    	runTimer.kill(); 
		    	pauseButton.kill();
		    	shootToggle.kill(); // REMOVE IF NEEDED
		    	this.pauseFunct("   Level\nComplete!", 40, 0xFFFFFF, game.world.width*0.5, game.world.centerY*0.35);
		    	this.checkScore();

		    	bgm.stop();
		    	retryButton = createButton("Retry", 10, game.world.width*0.5, game.world.height*0.7, 
									80, 30, function(){game.paused = false; game.state.start('Game')});
		    	nextButton = createButton("Level Select", 10, game.world.width*0.5, game.world.height*0.8, 
									170, 30, function(){game.paused = false; game.state.start('Hub');});
		    	titleButton = createButton("Title Screen", 10, game.world.width*0.5, game.world.height*0.9, 
									170, 30, function(){game.paused = false; game.state.start('MainMenu');});
		    }
	    }, this);

	},

	setLevelSettings: function(){
		switch (levelSettings["level"]){
			case 1: levelSettings = lv2; break;
			case 2: levelSettings = lv3; break;
			default: levelSettings = lv1;
		}
		levelSettings["score"] = score;
		levelSettings["lives"] = lives;
		levelSettings["TimerStart"] = runTimerStart;
		levelSettings["TimerPaused"] = runTimerPaused;
		levelSettings["lifeUpCounter"] = lifeUpCounter;
	},

	//Game over setup
	gameOver: function()
	{
		this.pauseFunct("DEFEAT", 50, 0xFFFFF);
		this.checkScore();

		bgm.stop();
		retryButton = createButton("Retry", 10, game.world.width*0.5, game.world.height*0.7,
						 100, 30, function(){game.paused = false; runTimerPaused += game.time.pauseDuration; game.state.restart();})
		levelButton = createButton("Level Select", 10, game.world.width*0.5, game.world.height*0.8, 
								170, 30, function(){game.state.start('Hub'); game.paused = false;});
		titleButton = createButton("Title Screen", 10, game.world.width*0.5, game.world.height*0.9, 
								170, 30, function(){game.state.start('MainMenu'); game.paused = false;});
	},

	//Displays score data at end of level
	checkScore: function()
	{
		tempCredits = parseInt(Cookies.get("credits"));
	    if (isNaN(tempCredits)) tempCredits = 0;
	    Cookies.set("credits", tempCredits + score);
	    console.log("credits", tempCredits + score);
		var highscore = parseInt(Cookies.get("highscore"));
		if (isNaN(highscore)) highscore = 0;

		var endScore = game.add.bitmapText(game.world.width*0.505, game.world.height*0.4, 'buttonStyle', "FINAL SCORE:" + score, 9);
		if(score > highscore){
			highscore = score;
			Cookies.set("highscore", score);
			var newHigh = game.add.bitmapText(game.world.width*0.505, game.world.height*0.55, 'buttonStyle', 
				"NEW HIGHSCORE!", 8);
			newHigh.tint = 0xFFFF00;
			newHigh.anchor.setTo(0.5);
		}
		var highscoreText = game.add.bitmapText(game.world.width*0.51, game.world.height*0.475, 'buttonStyle',
			"HIGHSCORE:" + highscore, 9);
		endScore.anchor.setTo(0.5);
		highscoreText.anchor.setTo(0.5);
	},

	//Pause menu setup
	pauseMenu: function()
	{
		//Create or destroy pause menu accordingly
		if (game.paused)
		{
			removeButton(resumeButton);
			removeButton(restartButton);
			removeButton(titleButton);
			that.pauseFunct();
		}
		else
		{
			that.pauseFunct("PAUSED!", 50, 0xFFFFF);
			resumeButton  = createButton("Resume", 10, game.world.width*0.5, game.world.height*0.6,
							 100, 30, that.pauseMenu);
			restartButton = createButton("Restart", 10, game.world.width*0.5, game.world.height*0.7,
							 100, 30, function(){bgm.stop(); bossBGM.stop(); game.paused = false; runTimerPaused += game.time.pauseDuration; 
							 	game.state.restart();});
			titleButton   = createButton("Title Screen", 10, game.world.width*0.5, game.world.height*0.8, 
							160, 30, function(){bgm.stop(); bossBGM.stop(); game.state.start('MainMenu'); game.paused = false;});
		}
	},

	//Checks for pausing, and displays text accordingly
	pauseFunct: function(string, fontsize, tint, x, y)
	{
		if(game.paused)
		{
			pauseScreen.kill();
			pauseText.kill();
			sprite.inputEnabled = true;
			game.paused = false;
			runTimerPaused += game.time.pauseDuration;
		}//if not paused, pause and make menu
		else
		{
			console.log("pauseFunct Text: ", string);
			sprite.inputEnabled = false;
			game.paused = true;

			var textX = x;
			var textY = y;

			if (x == undefined) textX = game.world.width*0.5;
			if (y == undefined) textY = game.world.centerY*0.5;

			pauseScreen = game.add.sprite(0, 0, 'pauseScreen');
			pauseText   = game.add.bitmapText(textX, textY, 'titleFont', string, 40);
			pauseText.tint = tint;
			pauseText.anchor.setTo(0.5, 0.5);
		}
	},

	timerTick: function(){
		//+100 to prevent negative values
		var currentTime = new Date();
    	timeDifference = currentTime.getTime() - runTimerStart.getTime() - runTimerPaused - duration + 100;
    	//console.log("", timeDifference);

    	var runTimerHun = Math.floor(timeDifference%1000/10);
		var runTimerSec = Math.floor(timeDifference%60000/1000);
		var runTimerMin = Math.floor(timeDifference/60000);

    	runTimerString = (runTimerMin < 10) ? "0" + runTimerMin : runTimerMin;
    	runTimerString += (runTimerSec < 10) ? ":0" + runTimerSec : ":" + runTimerSec;
    	runTimerString += (runTimerHun < 10) ? ".0" + runTimerHun : "." + runTimerHun;

		runTimer.text = runTimerString;
	}
}

//Generates explosions
function explodeFunct(x, y)
{
	var explosion = explosions.getFirstExists(false);
	if (explosion)
	{
    	explosion.reset(x, y);
   		explosion.scale.setTo(0.3);
    	explosion.alpha = 0.5;
    	explosion.play('explode', 30, false, true);
	}
}

//Resets a function
function resetFunct(object)
{
	if (verbose) console.log(object.name + " just reset");
	object.kill();
}

function textPop(string, x, y)
{
	var pop = game.add.group();
	pop.enableBody = true;
	pop.physicsBodyType = Phaser.Physics.ARCADE;

	for (var i = 0; i < string.length; i++) 
	{
		var frame = 0;
		switch(string.charAt(i))
		{
			case " ": continue; //skips the rest of the for loop
			case "0": frame = 9; break;
			case ".": frame = 10; break;
			case "-": frame = 11; break;
		}

		//decide if the char is a letter or number
		if (string.charAt(i).charCodeAt() > 57) 
		{
			var p = pop.create(x+9*i, y, "letters");
			p.frame = string.charAt(i).toUpperCase().charCodeAt() - 65;
		}
  		else 
  		{
  			var p = pop.create(x+9*i, y, "numbers");
	  		if (frame == 0) p.frame = string.charAt(i).charCodeAt() - 49;
	  		else p.frame = frame;
  		}	

    	p.body.velocity.y = -100;
    	p.body.gravity.y = 200;
    	p.body.maxVelocity.y = 150;
    	game.add.tween(p).to({alpha: 0}, 1200, Phaser.Easing.Linear.None, true);
    	p.name = string.charAt(i);
    	p.checkWorldBounds = true;
    	p.events.onOutOfBounds.add(resetFunct, this);
	}
    return pop;
}

//Generates a random number within the range of the parameters
function randomIntFromInterval(min,max)
{
    return Math.floor(Math.random()*(max - min + 1) + min);
}
