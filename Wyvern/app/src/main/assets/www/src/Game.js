var Game = 
{
	create: function() {
		that = this;
		verbose = false;
		//Setup gameplay variables here
		shootRateMultiplier = 1;
		baseShotSpeed = -200;
		shotSpeedMultiplier = 1;

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

		if(typeof lives === 'undefined'|| lives <= 0) 
		{
			//lives = 1; //only 1 to die faster
			lives = 0; //set to 5 for testing
		} 

		spawnTime = 0;
		bulletTime = 0;
		firingTime = 0;
		canShoot = true;
		hurtTime = 0;

		enemyToughness = 2;
		enemiesKilled = 0;
		spawnDelay = 400;
		//gameplay-related vars end

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
	        var d = drops.create(0, 0, 'dorito');
	        d.name = 'drop' + i;
	        d.exists = false;
	        d.visible = false;
	        d.checkWorldBounds = true;
	        d.events.onOutOfBounds.add(resetFunct, this);
	        d.body.maxVelocity.setTo(0, 600);
	    }

		//makes enemies
		//enemies = game.add.group();
		eyes = game.add.group();
	    meteors = game.add.group();

		eyes.enableBody = true;
		eyes.physicsBodyType = Phaser.Physics.ARCADE;
	    for (var i = 0; i < 500; i++)
	    { 
	        var e = eyes.create(0, 0, 'eyes');
	        //e.scale.setTo(0.9);
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
	    for (var i = 0; i < 500; i++)
	    { 
	        var e = meteors.create(0, 0, 'meteor');
	        //e.scale.setTo(0.9);
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
		sprite.addChild(hitbox);
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
	    	function(){canShoot = !canShoot; console.log("canShoot = "+ canShoot)});
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
	    game.physics.arcade.overlap(screenEdge, meteors,this.enemyOffScreen);
	    game.physics.arcade.overlap(bullets, meteors, this.bulletHit);
	    game.physics.arcade.overlap(hitbox, meteors, this.enemyTouched);
	    //wonder if there's a better way to do this other than duplicating code for every enemy type
	    game.physics.arcade.overlap(screenEdge, eyes,this.enemyOffScreen);
	    game.physics.arcade.overlap(bullets, eyes, this.bulletHit);
	    game.physics.arcade.overlap(hitbox, eyes, this.enemyTouched);
	},

	makeEnemy: function() 
	{	
		if (Math.random() > 0.3){
		var x = game.rnd.integerInRange(0, game.world.width);
		var xspeed = game.rnd.integerInRange(-40, 40);
		var yspeed = game.rnd.integerInRange(75, 150);
		this.spawnEnemy("meteors",x, -10, xspeed, yspeed);
		}else{
			if(Math.random()>0.5){mult=1;var x = -10;}
			else {mult = -1; var x = game.world.width+10;}
			var y = game.rnd.integerInRange(0, game.world.height-60);
			var xspeed = game.rnd.integerInRange(75, 150)*mult;
			var yspeed = game.rnd.integerInRange(50, 100)*mult;
			var xaccel = game.rnd.integerInRange(0, 80)*mult*-1;
			var yaccel = game.rnd.integerInRange(0, 80)*mult*-1;
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
		enemy.hp = enemyToughness;
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
		    resetFunct(victim);
		    //reset hp
		    victim.hp = enemyToughness;
		    //Increase the score
		    score += victim.worth;
		    enemiesKilled += victim.worth/100;
		    textPop(victim.worth.toString(), victim.body.x, victim.body.y);
		    if(enemiesKilled%10==0)
		    {
		    	lives++;
		    }
		    //explode
		    explodeFunct(victim.body.x, victim.body.y);
		}
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

		retryButton = createButton("Retry", 15, game.world.width*0.5, game.world.height*0.7,
						 80, 30, function(){game.state.restart(); game.paused = false;});
		exitButton  = createButton("Main Menu", 15, game.world.width*0.5, game.world.height*0.8,
						 80, 30, function(){game.state.start('MainMenu'); game.paused = false;});
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
			that.pauseFunct("Paused!", 50);
			resumeBtn = createButton("Resume",15,game.world.width*0.5, game.world.height*0.6,
							 80, 30, that.pauseMenu);
			restartBtn = createButton("Restart",15,game.world.width*0.5, game.world.height*0.7,
							 80, 30, function(){game.state.restart(); game.paused = false;});
			menuBtn = createButton("Menu",15,game.world.width*0.5, game.world.height*0.8,
							 80, 30, function(){game.state.start('MainMenu'); game.paused = false;});

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
		pauseText   = game.add.text(textX, textY,
						string, {font:50 + "px Verdana", fill:"#FFF", align:"center"});
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