var Game = 
{
	create: function() {
		that = this;
		verbose = false;
		//Setup gameplay variables here
		shootRateMultiplier = 1;
		baseShotSpeed = -200;
		shotSpeedMultiplier = 1;
		dropRate = 0.05;

		/* For the FIRST level, there probably won't be upgrades.
		   Check if we've setup the variables first, otherwise
		   we use the modified variables in Shop.js
		*/

		if(typeof shotSpread === 'undefined') 
		{
			shotSpread = 1;
		} 

		iFrames = 1;
		score = 0;

		// Save the lives as a cookie
		lives = parseInt(Cookies.get("lives"));
		if (isNaN(lives)) lives = 5;

		spawnTime = 0;
		bulletTime = 0;
		firingTime = 0;
		canShoot = true;
		hurtTime = 0;

		enemyToughness = 2;
		enemiesKilled = 0;
		spawnDelay = 200;
		//gameplay-related vars end

		//background music
		//comment out the music for testing if you want
		//volume is 0.2, loop is true
		bgm = game.add.audio('cosmosBGM', 0.2, true);
		bgm.play();

		//background
		back = game.add.tileSprite(0, 0, 200, 1280, 'redsky');
		back.tint = 0x808080;
		//makes bullets
	 	bullets = game.add.group();
	    bullets.enableBody = true;
	    bullets.physicsBodyType = Phaser.Physics.ARCADE;

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
	    }

		//makes drops
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
	        d.body.maxVelocity.setTo(300);
	        d.timer = null;
	    }

		//makes enemies
		//enemies = game.add.group();
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
	    // enemies.add(eyes);
	    // enemies.add(meteors);

		//make a barrier off the edges of screen to despawn offscreen enemies
		screenEdge = game.add.group();
		screenEdge.enableBody = true;
		screenEdge.physicsBodyType = Phaser.Physics.ARCADE;

		screenBottomBar = screenEdge.create(0, game.world.height+50, 'preloaderBar');
		screenBottomBar.width = 1.5*game.world.width;
		screenTopBar = screenEdge.create(0, 0-50, 'preloaderBar');
		screenTopBar.width = 1.5*game.world.width;
		screenLeftBar = screenEdge.create(0-50, 0, 'preloaderBar');
		screenLeftBar.height = 1.5*game.world.height;
		screenLeftBar.width = 10;
		screenRightBar = screenEdge.create(game.world.width+50, 0, 'preloaderBar');
		screenRightBar.height = 1.5*game.world.height;

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

		//These coord offsets are probably all wrong once we get real sprites
		//UI

		scoreString = 'Score: ';
		scoreText = game.add.text(5, 5, scoreString + score, {font:'16px Arial', fill:'#fff'});
		//lives
		lifeCount = game.add.sprite(0, game.world.height - sprite.height+9, 'dragon');
	    lifeCount.scale.setTo(0.2);
	    lifeCounter = game.add.text(lifeCount.width , game.world.height - lifeCount.height,
	    				 'X ' + lives, { font: '16px Arial', fill: '#fff'});
	    //lifeCount.anchor.setTo(0.5,0.5);
	    //pause button
	    pauseButton = game.add.button(game.world.width - 25, 5, 'pauseBtn', this.pauseMenu);
	    pauseButton.scale.setTo(0.6, 0.6);
	    //shooting toggle AKA debug button make it do whatever you want for testing
	    shootToggle = game.add.button(game.world.width - 50, 5, 'pauseBtn', 
	    	//function(){canShoot = !canShoot; console.log("canShoot = "+ canShoot)});
	    	function(){that.bombPickup(hitbox.body.x, hitbox.body.y)});
	    	//function(){that.makeDrops(50, 50)});
	    	//function(){explodeFunct(game.world.width*0.5, 150);});
	    	//function(){sprite.alpha = 1;});
	    	//function(){that.spawnEnemy("meteors",game.world.width*0.5, 150, 0, 0);});
	    	// function(){
	    	// 	for(var i=0; i<5; i++){
	    	// 		game.time.events.add(150*i, function(){that.spawnEnemy("meteors", -10, 220, 150, 0, -200, -100)});
	    	// 	}
	    		
	    	// });
	    	
	    shootToggle.scale.setTo(0.6, 0.6);
	    shootToggle.tint = 0xff0000;

	    //uncomment this to test an enemy!
	    //this.spawnEnemy("eyes",game.world.width*0.5, 150, 0, 0);
	    //explodeFunct(game.world.width*0.5, 150);
	},

	update: function() 
	{
	    back.tilePosition.y += 2;
		if (game.time.now > spawnTime) this.makeEnemy();
		this.fireBullet();

		//updates the UI counters
		scoreText.text = scoreString + score;
		lifeCounter.text = "X " + lives;

	    //collision tests
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

	makeEnemy: function() 
	{	
		if (Math.random() > 0.2){
		var x = game.rnd.integerInRange(0, game.world.width);
		var xspeed = game.rnd.integerInRange(-40, 40);
		var yspeed = game.rnd.integerInRange(150, 250);
		this.spawnEnemy("meteors",x, -10, xspeed, yspeed);
		}else{
			var mult = 1;
			if(Math.random()>0.5){var x = -10;}
			else {mult = -1; var x = game.world.width+10;}
			var y = game.rnd.integerInRange(0, game.world.height-60);
			var xspeed = game.rnd.integerInRange(75, 200)*mult;
			var yspeed = game.rnd.integerInRange(50, 150)*mult;
			var xaccel = game.rnd.integerInRange(0, 80)*mult*-1;
			var yaccel = game.rnd.integerInRange(0, 80)*mult*-1;
			if (Math.random() > 0.9){yspeed = 0; xaccel = 0; yaccel = 0;}
			for(var i=0; i<5; i++){
	    			game.time.events.add(150*i, function(){that.spawnEnemy("eyes",x, y, xspeed, yspeed, xaccel, yaccel)});
		}
		}
	},

	spawnEnemy: function(name, x, y, xspeed, yspeed,xaccel, yaccel)
	{
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
            enemy.reset(x, y);
            enemy.body.velocity.x = xspeed;
            enemy.body.velocity.y = yspeed;
            enemy.body.gravity.x = xaccel;
            enemy.body.gravity.y = yaccel;
            spawnTime = game.time.now + spawnDelay;
        }
	},
	
	enemyOffScreen: function(bar, enemy)
	{
		that.enemyHpReset(enemy);
		resetFunct(enemy);
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
                    bullet.reset(sprite.x, sprite.y - 17);
                    var spreadAngle = 90/shotSpread;
                    //decide how many bullets to shoot on each side
                    var k = Math.floor(shotSpread/2); 
                    var angle = k*spreadAngle - i*spreadAngle;
                    game.physics.arcade.velocityFromAngle(angle - 90, 40*shotSpread + 10, bullet.body.velocity);
                    bullet.body.velocity.y = baseShotSpeed * shotSpeedMultiplier;
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
	    victim.hp--;
	    victim.tint = 0xFF0000;
	    //change tint back after delay in millisecond
	    game.time.events.add(20, function(){victim.tint = 0xFFFFFF});
	    //check if victim dies
	    if(victim.hp <= 0)
	    {
	    	that.victimDies(victim, victim.worth);
	    	enemiesKilled += victim.worth/100;
		    if(enemiesKilled%20==0)
		    {
		    	lives++;
		    }

		    //rng to check if an item drops
		     if (Math.random() < dropRate)
	    	 	that.makeDrops(victim.body.x, victim.body.y);
		}
	},
	victimDies: function(victim, scoreGain){
		    resetFunct(victim);
		    //reset hp
		    that.enemyHpReset(victim);
		    //Increase the score
		    score += scoreGain;
		    if(scoreGain != 0) textPop(scoreGain.toString(), victim.body.x, victim.body.y);
		    explodeFunct(victim.body.x, victim.body.y);
	},
	itemPickup: function(player, drop) {
        if (!(typeof drop.timer === "undefined"))
					game.time.events.remove(drop.timer);
	    resetFunct(drop);
	    //applies buff
	    //if you come up with more buff ideas, simply add another case
	    switch(drop.dropType){
	    	case 0: 	console.log("invuln");
	    				if (!(typeof invulnEvent === "undefined"))
	    						game.time.events.remove(invulnEvent);
	    				invuln.alpha=0.8;
	    				invuln.scale.setTo(0);
	    				game.add.tween(invuln.scale).to( {x:1.25, y:1.25}, 150, Phaser.Easing.Linear.None, true);
	    				hurtTime = game.time.now + 6000;
	    				invulnEvent = game.time.events.add(6000, function(){invuln.alpha = 0;lives++;that.killFunct();});
	    				break;
	    	case 1: 	console.log("bomb"); 
	    				that.bombPickup(player.body.x, player.body.y);
	    				break;
	    	case 2: 	console.log("no"); break;
	    	default: 	console.log("I don't know what you just picked up"); break;
	    }
	},
	makeDrops: function(x, y, type)
	{
		drop = drops.getFirstExists(false);
       	if (drop)
       	{	
       		var item = game.rnd.integerInRange(0, 2);
       		//var item = 0;
       		drop.dropType = item;
       		switch(item){
       			case 0: drop.loadTexture("shield");break;
       			case 1: drop.loadTexture("bomb");break;
       			case 2: drop.loadTexture("no");break;
       		}
       		var xmult = 1;
       		var ymult = 1;
            drop.reset(x, y);
            drop.body.collideWorldBounds = true;
            if (Math.random() > 0.5) ymult = -1;
            if (Math.random() > 0.5) xmult = -1;
            drop.body.velocity.y = 70*ymult;
            drop.body.velocity.x = 70*xmult;
            drop.body.bounce.set(1.3);
            drop.timer = game.time.events.add(4500, 
            	function(){drop.body.collideWorldBounds = false;});
        }
	},
	bombPickup: function(x, y)
	{
		//var bigboom = game.add.sprite(x, y, 'bombboom');
		var boom = bigboom.getFirstExists(false);
		boom.scale.setTo(0.2);
		boom.anchor.setTo(0.5);
    	boom.reset(x+5, y+5);
		var boomtime = 1000;

		//boom.alpha = 1;
		game.add.tween(boom.scale).to( { x: 30,y:30 }, boomtime, Phaser.Easing.Linear.None, true);
		//game.add.tween(bigboom).to( { alpha:0 }, boomtime, Phaser.Easing.Linear.None, true);
		game.time.events.add(boomtime, function(){boom.kill()});
		spawnTime = game.time.now + 3000;
	},
	enemyBombed: function(boom, enemy) 
	{
    	that.victimDies(enemy, 50);
    },
	enemyHpReset: function(enemy){
	    if(enemy.key == "meteors") enemy.hp = enemyToughness+1;
    	else enemy.hp = enemyToughness;
	},
	enemyTouched: function(player, enemy) 
	{
    	that.killFunct();
    	enemy.kill();
    },

	killFunct: function()
	{
		if(game.time.now > hurtTime)
		{
		    if (lives >= 0)
		    {
			    explodeFunct(sprite.body.x, sprite.body.y);
			    lives--;
			    hurtTime = game.time.now + iFrames*1000;
			    blinkBool = true;
			    for(i = 1; i <= iFrames*10; i++)
			    {
			    	game.time.events.add(100*i, this.spriteBlink);
			    }
		    }
		    if (lives < 0)
		    {
			    this.gameOver();
			    //sprite.visible = false;
		    }	
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

	gameOver: function()
	{
		//console.log("Game over");
		this.pauseFunct("DEFEAT", 50);
		var textFormat = {font:'16px Arial', fill:'#fff'};
		var highscore = parseInt(Cookies.get("highscore"));
		if (isNaN(highscore)) highscore = 0;
		console.log("old highscore: " + highscore);

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

		game.sound.stopAll();
		retryButton = createButton("Retry", 10, game.world.width*0.5, game.world.height*0.7,
						 100, 30, function(){game.state.restart(); game.paused = false;});
		exitButton  = createButton("Main Menu", 10, game.world.width*0.5, game.world.height*0.8,
						 175, 30, function(){game.state.start('MainMenu'); game.paused = false;});
		//game.paused = true;
		//lives = 5;
	},
	//pause menu stuff
	//if paused, remove buttons and pause screen
	pauseMenu: function()
	{
		if(game.paused)
		{
			removeButton(resumeBtn)
			removeButton(menuBtn)
			removeButton(restartBtn)
			that.pauseFunct();
		}//if not paused, pause and make menu
		else
		{
			that.pauseFunct("PAUSED!", 50);
			resumeBtn = createButton("Resume",10,game.world.width*0.5, game.world.height*0.6,
							 100, 30, that.pauseMenu);
			restartBtn = createButton("Restart",10,game.world.width*0.5, game.world.height*0.7,
							 100, 30, function(){game.state.restart(); game.sound.stopAll(); game.paused = false;});
			menuBtn = createButton("Menu",10,game.world.width*0.5, game.world.height*0.8,
							 100, 30, function(){game.state.start('MainMenu'); game.paused = false;});

		}
	},
	//if paused, unpause and remove pause screen
	pauseFunct: function(string, fontsize, x, y)
	{
		if(game.paused)
		{
			pauseScreen.kill();
			sprite.inputEnabled = true;
			pauseText.kill();
			game.paused = false;
		}//if not paused, pause and make menu
		else
		{
		console.log("paused: ", string);
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
		//game.add.text(textX, textY, string, {font:50 + "px Verdana", fill:"#FFF", align:"center"});
		pauseText.tint = 0xFFFFF;
		pauseText.anchor.setTo(0.5, 0.5);
		}
	}
}

function explodeFunct(x, y)
{
	var explosion = explosions.getFirstExists(false);
    explosion.reset(x, y);
    explosion.scale.setTo(0.3);
    explosion.alpha = 0.5;
    explosion.play('explode', 30, false, true);
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