var Game = 
{
	create: function() {
		
		//Setup gameplay variables here
		shootRateMultiplier = 1;
		baseShotSpeed = -200;
		shotSpeedMultiplier = 1;
		shotSpread = 1;

		iFrames = 0.5;
		lives =5;
		score = 0;

		spawnTime = 0;
		bulletTime = 0;
		firingTime = 0;
		canShoot = true;
		hurtTime = 0;
		//gameplay-related vars end

		//background
		back = game.add.tileSprite(0, 0, 1080, 1920,'redsky');
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

	    for (var i = 0; i < 100; i++)
	    { 
	        var e = enemies.create(0, 0, 'eyes');
	        //e.scale.setTo(0.9);
	        e.name = 'enemy' + i;
			e.anchor.setTo(0.5, 0.5);
			e.animations.add("fly", [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15], 20, true);
			e.play('fly');
	        e.exists = false;
	        e.visible = false;
	    }

		//make a bar on the bottom of the screen to despawn offscreen enemies
		screenBottomBar = game.add.sprite(0, game.world.height+25, "preloaderBar");
		screenBottomBar.width = 20*game.world.width;
		game.physics.enable(screenBottomBar, Phaser.Physics.ARCADE);

		//player
		sprite = game.add.sprite(game.world.centerX, game.world.centerY*1.8, 'dragon');
		sprite.scale.setTo(0.35);
		sprite.anchor.setTo(0.5, 0.5);
		sprite.inputEnabled = true;
		sprite.input.enableDrag(true);
		game.physics.enable(sprite, Phaser.Physics.ARCADE);
		sprite.body.collideWorldBounds = true;

		//These coord offsets are probably all wrong once we get real sprites
		//UI

		scoreString = 'Score: ';
		scoreText = game.add.text(5,5, scoreString + score, {font: '16px Arial', fill:'#fff'});
		//lives
	    lifeCounter = game.add.text(sprite.width , game.world.height - sprite.height+11, 'X ' + lives, { font: '16px Arial', fill: '#fff'});
		lifeCount = game.add.sprite(5, game.world.height - sprite.height+9, 'dragon');
	    lifeCount.scale.setTo(0.2);
	    //lifeCount.anchor.setTo(0.5,0.5);
	    //pause button
	    pauseButton = game.add.button(game.world.width-25, 5, 'pauseBtn', this.pauseMenu);
	    pauseButton.scale.setTo(0.6,0.6);
	    //shooting toggle
	    shootToggle = game.add.button(game.world.width-50, 5, 'pauseBtn', 
	    	function(){canShoot = !canShoot; console.log("canShoot = "+ canShoot)});
	    shootToggle.scale.setTo(0.6,0.6);
	    shootToggle.tint = 0xff0000;

	    //uncomment this to test an enemy!
	    //this.spawnEnemy(game.world.width*0.5, 150, 0, 0);
	},
	update: function() {
	    back.tilePosition.y += 2;
		if (game.time.now > spawnTime) this.makeEnemy();

		scoreText.text = scoreString + score;
		lifeCounter.text = "X " + lives;
		this.fireBullet();

	    //collision tests
	    game.physics.arcade.overlap(screenBottomBar, enemies,this.enemyOffScreen, null);
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
            spawnTime = game.time.now +200;
        }
	},
	enemyOffScreen: function(bar, enemy){
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
	//if paused, remove buttons and pause screen
	pauseMenu: function(){
		if(game.paused){
			removeButton(resumeBtn)
			removeButton(menuBtn)
			removeButton(restartBtn)
			Game.pauseFunct();
			//for some reason this doesn't work
			//"this.pauseFunct is not a function"
			//this.pauseFunct();
		}//if not paused, pause and make menu
		else{
		Game.pauseFunct("Paused!", 50);
		//this too
		//this.pauseFunct("Paused!", 50);
		resumeBtn = createButton("Resume",15,game.world.width*0.5, game.world.height*0.6,
						 80, 30, this.pauseMenu);
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
function resetFunct(object){
//console.log(object.name+" just reset");
object.kill();
}