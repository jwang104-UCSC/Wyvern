var Game = 
{
	create: function() {
		var seed = parseInt(Cookies.get("seed"));
		if (typeof Cookies.get("seed") != 'undefined')
			 Math.seedrandom(seed);
		else Math.seedrandom();
		game.stage.smoothed = false;
		game.time.advancedTiming = true;
		that = this;
		verbose = false;
		if (typeof levelSettings === "undefined") {
		    console.log("levelSettings is undefined, default to lv1");
		    levelSettings = lv1;
		}else{
			console.log(levelSettings);
		}

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

		this.createDespawnBars();

		//player
		sprite = game.add.sprite(game.world.width*0.5, game.world.centerY*1.8, 'dragon');
		sprite.scale.setTo(0.35);
		sprite.anchor.setTo(0.5, 0.8);
		hitbox = game.add.sprite(0, -50, "bullet");
		invuln = game.add.sprite(0, 0-48, "invuln");
		invuln.anchor.setTo(0.5, 0.5);
		invuln.scale.setTo(1.25);
		invuln.alpha = 0;
		sprite.addChild(hitbox);
		sprite.addChild(invuln);
		hitbox.anchor.setTo(0.5, 0.5);
		sprite.inputEnabled = true;
		sprite.input.enableDrag(true);
		game.physics.enable(sprite, Phaser.Physics.ARCADE);
		sprite.body.collideWorldBounds = true;
		
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

		//UI
		if (typeof levelSettings["TimerStart"] === "undefined") runTimerStart = new Date();
		else runTimerStart = levelSettings["TimerStart"];
		if (typeof levelSettings["TimerPaused"] === "undefined") runTimerPaused = 0;
		else runTimerPaused = levelSettings["TimerPaused"];
		runTimerString = "00:00.00";
		runTimer = game.add.text(game.world.width, game.world.height - 25, runTimerString, 
					{font:'16px Arial', fill:'#fff', align:"right"});
		runTimer.anchor.setTo(1, 0);
		scoreString = 'Score: ';
		scoreText = game.add.text(5, 5, scoreString + score, {font:'16px Arial', fill:'#fff'});
		//lives
		lifeCount = game.add.sprite(0, game.world.height - sprite.height+9, 'dragon');
	    lifeCount.scale.setTo(0.2);
	    lifeCounter = game.add.text(lifeCount.width , game.world.height - lifeCount.height,
	    				 'X ' + lives, { font: '16px Arial', fill: '#fff'});
	    //pause button
	    pauseButton = game.add.button(game.world.width - 25, 5, 'pauseBtn', this.pauseMenu);
	    pauseButton.scale.setTo(0.6, 0.6);
	    //shooting toggle AKA debug button make it do whatever you want for testing
	    shootToggle = game.add.button(game.world.width - 50, 5, 'pauseBtn', 
	    	//function(){canShoot = !canShoot; console.log("canShoot = "+ canShoot)});
	    	function(){that.endLevel()});

	    shootToggle.scale.setTo(0.6, 0.6);
	    shootToggle.tint = 0xff0000;
	},

	update: function() 
	{

	    if (!timepaused)background.tilePosition.y += 2;
		if (game.time.now > spawnTime) this.makeEnemy();
		this.fireBullet();

		//updates the UI counters
		scoreText.text = scoreString + score;
		lifeCounter.text = "X " + lives;
		if (!timepaused)this.timerTick();
	    //collision tests
	    game.physics.arcade.collide(meteors);
		game.physics.arcade.overlap(hitbox, drops, this.itemPickup);
	    game.physics.arcade.overlap(screenEdge, meteors,this.enemyOffScreen);
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
		game.debug.text(game.time.fps || '--', 2, 14, "#00ff00"); 
	},

	//Setup for all required gameplay variables
	gameSetup: function()
	{
		pauseLength = 4;
		shootRateMultiplier = 1;
		baseShotSpeed = -200;
		shotSpeedMultiplier = 1;
		dropRate = 0.05;
		iFrames = 1;

		spawnTime = 0;
		spawnDelay = levelSettings["spawnDelay"];
		bulletTime = 0;
		firingTime = 0;
		hurtTime = 0;
		canShoot = true;
		timepaused = false;
		invulnerable = false;
		levelEnding = false;

		enemyToughness = levelSettings["enemyToughness"];
		lifeUpCounter = 0;
		score = levelSettings["score"];
		lives = levelSettings["lives"];

		// Get potential extra lives from cookies
		bonusLives = parseInt(Cookies.get("bonus lives"));
		if (!isNaN(bonusLives)) lives += bonusLives;

		shotSpread = parseInt(Cookies.get("shotSpread"));
		if (isNaN(shotSpread)) 
		{
			shotSpread = 1;
			Cookies.set('shotSpread', shotSpread);
		}
		//gameplay-related vars end
	},

	//Setup for all required audio files
	audioSetup: function()
	{
		//background music & sound effects
		bgm         = game.add.audio(levelSettings["bgm"], 0.2, true);
		warudo      = game.add.audio('warudoSFX', 0.7);
		warudoEnd   = game.add.audio('warudoEndSFX', 1);
		clockTick   = game.add.audio('clockTick', 0.3, true);
		xds         = game.add.audio('explodes2', 0.35);
		boomb       = game.add.audio('explodes', 0.2);

		playerHurt  = game.add.audio('hurt', 0.15);

		eyeHit      = game.add.audio('eyehit', 0.1);
		eyeDeath    = game.add.audio('eyedeath', 0.1);

		rockHit     = game.add.audio('rockhit', 0.1);
		rockDeath   = game.add.audio('rockdeath', 0.1);

		shieldUp    = game.add.audio('shieldUp', 0.15);
		shieldTouch = game.add.audio('shieldTouch', 0.1);
		shieldDown  = game.add.audio('shieldDown', 0.15);
		
		sfxGroup = {xds, boomb, eyeHit, eyeDeath, rockHit, rockDeath, shieldUp, shieldTouch, shieldDown, playerHurt};
		for(var i = 0; i < sfxGroup.length; i++){
			sfxGroup[i].allowMultiple = true;
		}

		//Play looping background music for the level
		bgm.play();
	},

	//Create barriers on the edges of the screen to despawn offscreen enemies
	createDespawnBars : function()
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

	pauseTime: function(){
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
				timepaused = false;
				uiFadeIn(runTimer);
				uiFadeIn(lifeCount);
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
		    	});7
		    	canShoot = true;
				bullets.forEachExists(function(bullets){bullets.body.velocity.y = baseShotSpeed * shotSpeedMultiplier;});
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
			uiFadeOut(lifeCount);
			uiFadeOut(lifeCounter);
			uiFadeOut(scoreText);
			bgm.pause();
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
	makeEnemy: function() 
	{	
		if (Math.random() > levelSettings["makeEnemy%"]){
		var x = randomIntFromInterval(0, game.world.width);
		var xspeed = randomIntFromInterval(-40, 40);
		var yspeed = randomIntFromInterval(150, 250);
		this.spawnEnemy(levelSettings["Enemy Type 1"],x, -10, xspeed, yspeed);
		}else{
			var mult = 1;
			if(Math.random()>0.5){var x = -10;}
			else {mult = -1; var x = game.world.width+10;}
			var y = randomIntFromInterval(0, game.world.height-60);
			var xspeed = randomIntFromInterval(75, 200)*mult;
			var yspeed = randomIntFromInterval(50, 150)*mult;
			if(Math.random()>0.5) yspeed *=-1;
			var xaccel = randomIntFromInterval(0, 80)*mult;
			if(Math.random()>0.5) xaccel *=-1;
			var yaccel = randomIntFromInterval(0, 80)*mult;
			if(Math.random()>0.5) yaccel *=-1;
			if (Math.random() > 0.9){yspeed = 0; xaccel = 0; yaccel = 0;}
			for(var i=0; i<5; i++){
	    			game.time.events.add(150*i, function(){that.spawnEnemy(levelSettings["Enemy Type 2"],x, y, xspeed, yspeed, xaccel, yaccel)});
		}
		}
	},
	spawnEnemy: function(name, x, y, xspeed, yspeed,xaccel, yaccel)
	{
        if(!timepaused){
        switch(name){
        	case "eyes":
       			var enemy = eyes.getFirstExists(false);
       			break;
       		case "meteors":
       			var enemy = meteors.getFirstExists(false);
       			break;
        }

        if (enemy)
        {
        	if(xaccel == null) xaccel = 0;
        	if(yaccel == null) yaccel = 0;
        	//flip horizontally
        	if(x<game.world.centerX)enemy.scale.x *=-1;
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

	//Creates the bullets fired by the player
	initializeBullets: function()
	{
		//Group to store bullets
	 	bullets = game.add.group();
	    bullets.enableBody = true;
	    bullets.physicsBodyType = Phaser.Physics.ARCADE;

	    //CHANGE 1000 MAYBE?
	    for (var i = 0; i < 1000; i++)
	    {
	        var b = bullets.create(0, 0, 'fireball');
	        b.scale.setTo(0.01);
	        b.name = 'bullet' + i;
	        b.anchor.setTo(0.5, 0.5);
	        b.exists = false;
	        b.visible = false;
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
	        d.exists = false;
	        d.visible = false;
	        d.checkWorldBounds = true;
	        d.body.collideWorldBounds = true;
	        d.events.onOutOfBounds.add(resetFunct, this);
	        d.body.maxVelocity.setTo(150);
	        d.timer = null;
	    }
	},

	//Creates all the enemies used in the level
	initializeEnemies: function()
	{
		//makes enemies
		eyes = game.add.group();
	    meteors = game.add.group();

		eyes.enableBody = true;
		eyes.physicsBodyType = Phaser.Physics.ARCADE;
	    for (var i = 0; i < 100; i++)
	    { 
	        var e = eyes.create(0, 0, 'eyes');
	        e.name = 'eyes' + i;
			e.anchor.setTo(0.5, 0.5);
			e.animations.add("fly", 
				[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], 20, true);
			e.play('fly');
	        e.exists = false;
	        e.visible = false;
	        e.hp = enemyToughness;
	        e.worth = 100;
	    }

		meteors.enableBody = true;
		meteors.physicsBodyType = Phaser.Physics.ARCADE;
	    for (var i = 0; i < 100; i++)
	    { 
	        var e = meteors.create(0, 0, 'meteor');
	        e.name = 'rock' + i;
			e.anchor.setTo(0.5, 0.5);
			e.animations.add("fly", 
				[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17,18,19,20,21,22,23,24,25,26,27,28,29], 20, true);
			e.play('fly');
	        e.exists = false;
	        e.visible = false;
	        e.hp = enemyToughness+1;
	        e.worth = 50;
	    }	
	},

	fireBullet: function() 
	{
		if (!canShoot) return;
    	if (game.time.now > bulletTime) 
    	{
    		shootDelay = 200 / shootRateMultiplier;
            for (var i = 0; i < shotSpread; i++) 
            {
                var bullet = bullets.getFirstExists(false);
                if (bullet) 
                {
                    bullet.reset(sprite.x, sprite.y - 25);
                    var spreadAngle = 90/shotSpread;
                    //decide how many bullets to shoot on each side
                    var k = Math.floor(shotSpread/2); 
                    var angle = k*spreadAngle - i*spreadAngle;
                    game.physics.arcade.velocityFromAngle(angle - 90, 40*shotSpread + 10, bullet.body.velocity);
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
	//collision stuff
	bulletHit: function(shot, victim) 
	{
		//remove the shot sprite
		resetFunct(shot);
		score++;
		lifeUpCounter ++;
	    victim.hp--;
	    victim.tint = 0xFF0000;
	    //change tint back after delay in millisecond
	    game.time.events.add(30, function(){victim.tint = 0xFFFFFF});
	    //check if victim dies
	    if(!timepaused)that.victimCheck(victim);
	    else if(victim.key == "eyes")eyeHit.play();
	    else if(victim.key == "meteor")rockHit.play();
	},
	victimCheck: function(victim){
	    if(victim.hp <= 0)
	    {
	    	that.victimDies(victim, victim.worth);
		    //rng to check if an item drops
		     if (Math.random() < dropRate){
		     	//if pass the check twice, drop the rarer timestop power
		     	if (Math.random() < dropRate)
		     		that.makeDrops(victim.body.x, victim.body.y, 2);
		     	else that.makeDrops(victim.body.x, victim.body.y);
		     }

	    	 	
		}
		else if(victim.key == "eyes")eyeHit.play();
		else if(victim.key == "meteor")rockHit.play();

	},
	victimDies: function(victim, scoreGain){
			if(victim.key == "eyes")eyeDeath.play();
			else if(victim.key == "meteor")rockDeath.play();
		    that.enemyReset(victim);
		    //Increase the score
		    score += scoreGain;
	    	lifeUpCounter += scoreGain;
		    if(lifeUpCounter>5000)
		    {
		    	this.livesUp();
		    	lifeUpCounter = 0;
		    }
		    if(scoreGain != 0) textPop(scoreGain.toString(), victim.body.x, victim.body.y);
		    explodeFunct(victim.body.x, victim.body.y);
	},
	livesUp: function(){
    	if(!levelEnding){
			var pop = textPop("1-up", lifeCounter.x, lifeCounter.y-15);
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
    				invuln.alpha=0.8;
    				invuln.scale.setTo(0);
    				shieldUp.play();
    				canShoot = false;
    				game.add.tween(invuln.scale).to( {x:1.25, y:1.25}, 150, Phaser.Easing.Linear.None, true);
    				hurtTime = game.time.now + 6000;
    				invulnerable = true;
    				invulnEvent = game.time.events.add(6000, function(){
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
       		if(type != null && type <3) item = type
       		else item = randomIntFromInterval(0, 1);
       		drop.dropType = item;
       		switch(item){
       			case 0: drop.loadTexture("shield");break;
       			case 1: drop.loadTexture("bomb");break;
       			case 2: drop.loadTexture("watch");break;
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
    	if (!timepaused)that.victimDies(enemy, 50);
    },

	enemyReset: function(enemy){
	    if(enemy.key == "meteor") enemy.hp = enemyToughness+1;
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
			    //sprite.visible = false;
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
		if (!blinkBool) 
		{
			sprite.alpha = 1;
			blinkBool = !blinkBool;
		}
		else //if (blinkBool)
		{
			sprite.alpha = 0;
			blinkBool = !blinkBool;
		}
	},
	destroyEverything: function(){
		game.sound.stopAll(); 
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
	dragonFlyAway: function(){
		sprite.inputEnabled = false;
    	game.add.tween(sprite).to({x: game.world.centerX, y: game.world.centerY*1.8}, 1000, Phaser.Easing.Quadratic.InOut, true);
    	game.time.events.add(1300, function(){
    		game.add.tween(sprite).to({y: 0, alpha: 0}, 1200, Phaser.Easing.Quadratic.In, true);}, this);
	},
	endLevel: function(){
		levelEnding = true;
		canShoot = false;
		spawnTime += 9999999;
		this.destroyEverything();

		game.time.events.add(1000, function(){that.dragonFlyAway()});

	    //END THE GAME AND PAUSE
	    game.time.events.loop(750, function(){
	    	if(!removing.getFirstExists()&&sprite.alpha == 0)
	    	{
		    	scoreText.kill(); 
		    	lifeCounter.kill();
		    	lifeCount.kill();
		    	runTimer.kill(); 
		    	pauseButton.kill();
		    	shootToggle.kill(); // REMOVE IF NEEDED
		    	this.pauseFunct("   Level\nComplete!", 40, 0xFFFFFF);
		    	finalscore = game.add.bitmapText(game.world.width*0.5, game.world.height*0.5, 'titleFont', "Score: " + score, 30);
		    	finalscore.anchor.setTo(0.5, 0.5);
		    	nextButton = createButton("Next Level", 10, game.world.width*0.5, game.world.height*0.8, 
									140, 30, function(){
										game.paused = false;
										runTimerPaused +=game.time.pauseDuration;
								    	that.setLevelSettings();
										game.state.start('Game')
									});
		    	returnButton = createButton("Title Screen", 10, game.world.width*0.5, game.world.height*0.9, 
									160, 30, function(){game.paused = false; game.state.start('MainMenu')});
		    }
	    }, this);

	},
	setLevelSettings: function(){
    	if (levelSettings["level"] == 1){
    		levelSettings = lv2;
    	}
		else if (levelSettings["level"] == 2){
			levelSettings = lv3;
		}
		else {
			levelSettings = lv1; //loop around?
		}
		levelSettings["score"] = score;
		levelSettings["lives"] = lives;
		levelSettings["TimerStart"] = runTimerStart;
		levelSettings["TimerPaused"] = runTimerPaused;
	},
	gameOver: function()
	{
		this.pauseFunct("DEFEAT", 50, 0xFFFFF);
		var textFormat = {font:'16px Arial', fill:'#fff'};
		var highscore = parseInt(Cookies.get("highscore"));
		if (isNaN(highscore)) highscore = 0;

		var endScore = game.add.text(game.world.width*0.5, game.world.height*0.5, "Final score: " + score, textFormat);
		if(score>highscore){
			highscore = score;
			Cookies.set("highscore", score);
			var newHigh = game.add.text(game.world.width*0.5, game.world.height*0.6, "New highscore!", {font:'16px Arial', fill:'#ffff00'});
			newHigh.anchor.setTo(0.5);
		}
		var highscoreText = game.add.text(game.world.width*0.5, game.world.height*0.55, "Highscore: " + highscore, textFormat);
		endScore.anchor.setTo(0.5);
		highscoreText.anchor.setTo(0.5);

		bgm.stop();
		retryButton = createButton("Retry", 10, game.world.width*0.5, game.world.height*0.7,
						 100, 30, function(){game.state.restart(); game.paused = false;});
		exitButton  = createButton("Main Menu", 10, game.world.width*0.5, game.world.height*0.8,
						 175, 30, function(){game.state.start('MainMenu'); game.paused = false; bgm.stop();});
	},

	//Pause menu setup
	pauseMenu: function()
	{
		//Create or destroy pause menu accordingly
		if(game.paused)
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
							 100, 30, function(){bgm.stop(); game.state.restart(); game.paused = false;});
			titleButton   = createButton("Title Screen", 10, game.world.width*0.5, game.world.height*0.8, 
							160, 30, function(){bgm.stop(); game.state.start('MainMenu'); game.paused = false;});
		}
	},

	//if paused, unpause and remove pause screen
	pauseFunct: function(string, fontsize, tint, x, y)
	{
		if(game.paused)
		{
			pauseScreen.kill();
			pauseText.kill();
			sprite.inputEnabled = true;
			game.paused = false;
			runTimerPaused +=game.time.pauseDuration;
		}//if not paused, pause and make menu
		else
		{
		console.log("pauseFunct Text: ", string);
		sprite.inputEnabled = false;
		game.paused = true;

		if (x == undefined)
		{
			textX = game.world.width*0.5;
		}
		else 
		{
			textX = x;
		}

		if (y == undefined)
		{
			textY = game.world.centerY*0.5;
		}
		else 
		{
			textY = y;
		}
		pauseScreen = game.add.sprite(0, 0, 'pauseScreen');
		pauseText   = game.add.bitmapText(textX, textY, 'titleFont', string, 40);
		pauseText.tint = tint;
		pauseText.anchor.setTo(0.5, 0.5);
		}
	},

	timerTick: function(){
		var currentTime = new Date();
    	var timeDifference = currentTime.getTime() - runTimerStart.getTime()- runTimerPaused;

    	var runTimerHun = Math.floor(timeDifference%1000/10);
		var runTimerSec = Math.floor(timeDifference%60000/1000);
		var runTimerMin = Math.floor(timeDifference/60000);;

    	runTimerString = (runTimerMin < 10) ? "0" + runTimerMin : runTimerMin;
    	runTimerString += (runTimerSec < 10) ? ":0" + runTimerSec : ":" + runTimerSec;
    	runTimerString += (runTimerHun < 10) ? ".0" + runTimerHun : "." + runTimerHun;

		runTimer.text = runTimerString;
	}
}

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



function resetFunct(object)
{
if(verbose)console.log(object.name+" just reset");
object.kill();
}

function textPop(string, x, y){
	var pop = game.add.group();
	pop.enableBody = true;
	pop.physicsBodyType = Phaser.Physics.ARCADE;
	for (var i = 0; i < string.length; i++) {
		var frame = 0;
		switch(string.charAt(i)){
			case " ":continue; //skips the rest of the for loop
			case "0":frame = 9;break;
			case ".":frame = 10;break;
			case "-":frame = 11;break;
		}
		//decide if the char is a letter or number
		if (string.charAt(i).charCodeAt()>57) {
			var p = pop.create(x+9*i, y, "letters");
			p.frame = string.charAt(i).toUpperCase().charCodeAt()-65;
		}
  		else {
  			var p = pop.create(x+9*i, y, "numbers");
	  		if (frame == 0) p.frame = string.charAt(i).charCodeAt()-49;
	  		else p.frame = frame;
  		}	
    	p.body.velocity.y=-100;
    	p.body.gravity.y=200;
    	p.body.maxVelocity.y = 150;
    	game.add.tween(p).to( { alpha: 0 }, 1200, Phaser.Easing.Linear.None, true);
    	p.name = string.charAt(i);
    	p.checkWorldBounds = true;
    	p.events.onOutOfBounds.add(resetFunct, this);
	}
    return pop;
}

function randomIntFromInterval(min,max)
{
    return Math.floor(Math.random()*(max-min+1)+min);
}
