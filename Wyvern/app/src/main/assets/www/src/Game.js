var Game = 
{
	create: function() {
		that = this;
		//Setup gameplay variables here
		shootRateMultiplier = 1;
		baseShotSpeed = -200;
		shotSpeedMultiplier = 1;
		shotSpread = 1;

		iFrames = 1;
		lives =5;
		score = 0;

		spawnTime = 0;
		bulletTime = 0;
		firingTime = 0;
		canShoot = true;
		hurtTime = 0;

		enemyToughness = 4;
		enemiesKilled = 0;
		//gameplay-related vars end

		//background
		back = game.add.tileSprite(0, 0, 200, 1280,'redsky');
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
	        b.anchor.setTo(0.5,0.5);
	        b.exists = false;
	        b.visible = false;
	        b.checkWorldBounds = true;
	        b.events.onOutOfBounds.add(resetFunct, this);
	    }



		//makes enemies
		enemies = game.add.group();
		enemies.enableBody = true;
		enemies.physicsBodyType = Phaser.Physics.ARCADE;

	    for (var i = 0; i < 500; i++)
	    { 
	        var e = enemies.create(0, 0, 'eyes');
	        //e.scale.setTo(0.9);
	        e.name = 'enemy' + i;
			e.anchor.setTo(0.5, 0.5);
			e.animations.add("fly", [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15], 20, true);
			e.play('fly');
	        e.exists = false;
	        e.visible = false;
	        e.hp = enemyToughness;
	    }

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
		sprite = game.add.sprite(game.world.centerX, game.world.centerY*1.8, 'dragon');
		sprite.scale.setTo(0.35);
		sprite.anchor.setTo(0.5, 0.5);
		sprite.inputEnabled = true;
		sprite.input.enableDrag(true);
		game.physics.enable(sprite, Phaser.Physics.ARCADE);
		sprite.body.collideWorldBounds = true;

		//make explosions
	    explosions = game.add.group();
	    explosions.createMultiple(200, 'explode');
	    explosions.forEach(
	    	function(boom){
			//boom.anchor.setTo(0.3, 0.3);
			boom.animations.add('explode');}
		);

		//These coord offsets are probably all wrong once we get real sprites
		//UI

		scoreString = 'Score: ';
		scoreText = game.add.text(5,5, scoreString + score, {font: '16px Arial', fill:'#fff'});
		//lives
		lifeCount = game.add.sprite(0, game.world.height - sprite.height+9, 'dragon');
	    lifeCount.scale.setTo(0.2);
	    lifeCounter = game.add.text(lifeCount.width , game.world.height - lifeCount.height, 'X ' + lives, { font: '16px Arial', fill: '#fff'});
	    //lifeCount.anchor.setTo(0.5,0.5);
	    //pause button
	    pauseButton = game.add.button(game.world.width-25, 5, 'pauseBtn', this.pauseMenu);
	    pauseButton.scale.setTo(0.6,0.6);
	    //shooting toggle AKA debug button make it do whatever you want for testing
	    shootToggle = game.add.button(game.world.width-50, 5, 'pauseBtn', 
	    	function(){canShoot = !canShoot; console.log("canShoot = "+ canShoot)});
	    	//function(){explodeFunct(game.world.width*0.5, 150);});
	    	//function(){sprite.alpha = 1;});
	    	
	    shootToggle.scale.setTo(0.6,0.6);
	    shootToggle.tint = 0xff0000;

	    //uncomment this to test an enemy!
	    //this.spawnEnemy(game.world.width*0.5, 150, 0, 0);
	    //explodeFunct(game.world.width*0.5, 150);
	},
	update: function() {
	    back.tilePosition.y += 2;
		if (game.time.now > spawnTime) this.makeEnemy();
		this.fireBullet();

		//updates the UI counters
		scoreText.text = scoreString + score;
		lifeCounter.text = "X " + lives;

	    //collision tests
	    game.physics.arcade.overlap(screenEdge, enemies,this.enemyOffScreen);
	    game.physics.arcade.overlap(bullets, enemies, this.bulletHit);
	    game.physics.arcade.overlap(sprite, enemies, this.enemyTouched);
	},
	makeEnemy: function() {
		var x = game.rnd.integerInRange(0, game.world.width);
		var xspeed = game.rnd.integerInRange(-40, 40);
		var yspeed = game.rnd.integerInRange(75, 150);
		this.spawnEnemy(x, -10, xspeed, yspeed);
	},
	spawnEnemy: function(x, y, xspeed, yspeed) {
        enemy = enemies.getFirstExists(false);
        if (enemy)
        {
            enemy.reset(x, y);
            enemy.body.velocity.x = xspeed;
            enemy.body.velocity.y = yspeed;
            spawnTime = game.time.now +800;
        }
	},
	enemyOffScreen: function(bar, enemy){
		enemy.hp = enemyToughness;
		resetFunct(enemy);
	},
	fireBullet: function() {
		if (!canShoot) return;
    	if (game.time.now > bulletTime) {
    		shootDelay = 200 / shootRateMultiplier;
            for (var i = 0; i < shotSpread; i++) {
                var bullet = bullets.getFirstExists(false);
                if (bullet) {
                    bullet.reset(sprite.x, sprite.y - 17);
                    var spreadAngle = 90/shotSpread;
                    //decide how many bullets to shoot on each side
                    var k = Math.floor(shotSpread/2); 
                    var angle = k*spreadAngle - i*spreadAngle;
                    game.physics.arcade.velocityFromAngle(angle-90, 10+40*shotSpread, bullet.body.velocity);
                    bullet.body.velocity.y = baseShotSpeed * shotSpeedMultiplier;
                }
            }
        	bulletTime = game.time.now + shootDelay;
        }
	},
	//collision stuff
	bulletHit: function(shot, victim) {
		//remove the shot sprite
	    shot.kill();
		score++;
	    victim.hp--;
	    victim.tint = 0xFF0000;
	    //change tint back after delay in millisecond
	    game.time.events.add(20, function(){victim.tint = 0xFFFFFF});
	    //check if victim dies
	    if(victim.hp<=0){
	    victim.kill();
	    enemiesKilled++;
	    //reset hp
	    victim.hp = enemyToughness;
	    //Increase the score
	    score += 100;
	    var pop = numPopup("100", victim.body.x, victim.body.y);
	    if(enemiesKilled%10==0) lives++;
	    //explode
	    explodeFunct(victim.body.x, victim.body.y);
		}
	},
	enemyTouched: function(player, enemy) {
    	Game.killFunct();
    	enemy.kill();
	},
	killFunct: function(){
		if(game.time.now > hurtTime){
		    if (lives>=0)
		    {
			    explodeFunct(sprite.body.x, sprite.body.y);
			    lives--;
			    hurtTime = game.time.now + iFrames*1000;
			    blinkBool = true;
			    for(i=1; i<=iFrames*10; i++){
			    		game.time.events.add(100*i, this.spriteBlink);
			    }
		    }
		    if (lives < 0){
			    this.gameOver();
			    //sprite.visible = false;
		    }	
		}
	},
	spriteBlink: function(){
		if (!blinkBool) {
			sprite.alpha = 1;
			blinkBool = !blinkBool;
		}
		else if (blinkBool){
			sprite.alpha = 0;
			blinkBool = !blinkBool;
		}
	},
	gameOver: function(){
		console.log("lol you died\n have 5 more lives, try again");
		//game.paused = true;
		lives = 5;
	},
	//pause menu stuff
	//if paused, remove buttons and pause screen
	pauseMenu: function(){
		if(game.paused){
			removeButton(resumeBtn)
			removeButton(menuBtn)
			removeButton(restartBtn)
			that.pauseFunct();
		}//if not paused, pause and make menu
		else{
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
	pauseFunct: function(string, fontsize, x, y){
		if(game.paused){
			pauseScreen.kill();
			sprite.inputEnabled = true;
			pauseText.kill();
			game.paused = false;
		}//if not paused, pause and make menu
		else{
		console.log("paused: ", string);
		sprite.inputEnabled = false;
		game.paused = true;

		if (x == undefined)textX = game.world.centerX;
			else textX = x;
		if (y == undefined)textY = game.world.centerY*0.5;
			else textY = y;
		// if (fontsize == undefined)size = 50;
		// 	else size = fontsize;
		pauseScreen = game.add.sprite(0, 0, 'pauseScreen');
		pauseText = game.add.text(textX	,textY,
			string,{font:50+"px Verdana", fill: "#FFF",align:"center"});
		pauseText.anchor.setTo(0.5, 0.5);
		}
	}
};
function explodeFunct(x, y){
	var explosion = explosions.getFirstExists(false);
    explosion.reset(x, y);
    explosion.scale.setTo(0.3);
    explosion.alpha = 0.5;
    explosion.play('explode', 30, false, true);
}
function resetFunct(object){
//console.log(object.name+" just reset");
object.kill();
}
function alphabet2number(letter){
	return letter.toUpperCase().charCodeAt()-65
}
function textPopup(string, x, y){
	var letters = game.add.group();
	letters.enableBody = true;
	letters.physicsBodyType = Phaser.Physics.ARCADE;
	for (var i = 0; i < string.length; i++) {
		if(string.charAt(i) == " ")continue;
  		var l = letters.create(x+9*i, y, "letters");
    	l.frame = string.charAt(i).toUpperCase().charCodeAt()-65;
    	l.body.velocity.y=-100;
    	l.body.gravity.y=200;
    	l.body.maxVelocity.y = 150;
    	game.add.tween(l).to( { alpha: 0 }, 1500, Phaser.Easing.Linear.None, true, 0, 1000, true);
    	l.name = string.charAt(i);
    	l.checkWorldBounds = true;
    	l.events.onOutOfBounds.add(resetFunct, this);
	}
    return letters;
}
function numPopup(string, x, y){
	var numbers = game.add.group();
	numbers.enableBody = true;
	numbers.physicsBodyType = Phaser.Physics.ARCADE;
	for (var i = 0; i < string.length; i++) {
		if(string.charAt(i) == " ")continue;
  		var n = numbers.create(x+9*i, y, "numbers");
  		if(string.charAt(i) == ".")n.frame =10;
  		if(string.charAt(i) == "-")n.frame =11;
  		if(string.charAt(i) == "0")n.frame =9;
  		else 
  		n.frame = string.charAt(i).charCodeAt()-49;
    	n.body.velocity.y=-100;
    	n.body.gravity.y=200;
    	n.body.maxVelocity.y = 150;
    	game.add.tween(n).to( { alpha: 0 }, 1500, Phaser.Easing.Linear.None, true, 0, 1000, true);
    	n.name = string.charAt(i);
    	n.checkWorldBounds = true;
    	n.events.onOutOfBounds.add(resetFunct, this);
	}
    return numbers;
}