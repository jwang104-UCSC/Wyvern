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
		canShoot = false;
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

		//player
		sprite = game.add.sprite(game.world.centerX, game.world.centerY*1.8, 'dragon');
		sprite.scale.setTo(0.35);
		sprite.anchor.setTo(0.5, 0.5);
		sprite.inputEnabled = true;
		sprite.input.enableDrag(true);
		game.physics.enable(sprite, Phaser.Physics.ARCADE);
		sprite.body.collideWorldBounds = true;

		//makes enemies
		enemies = game.add.group();
		enemies.enableBody = true;
		enemies.physicsBodyType = Phaser.Physics.ARCADE;

	    for (var i = 0; i < 100; i++)
	    { 
	        var e = enemies.create(0, 0, 'eyes');
	        //e.scale.setTo(0.04);
	        e.name = 'enemy' + i;
			e.anchor.setTo(0.5, 0.5);
			e.animations.add("fly", [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15], 60, true);
			e.play('fly');
	        e.exists = false;
	        e.visible = false;
	    }

		//make a bar on the bottom of the screen to despawn offscreen enemies
		screenBottomBar = game.add.sprite(0, game.world.height+25, "preloaderBar");
		screenBottomBar.width = 20*game.world.width;
		game.physics.enable(screenBottomBar, Phaser.Physics.ARCADE);

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
	    pauseButton = game.add.button(game.world.width-25, 5, 'pause', this.pauseFunct);
	    pauseButton.scale.setTo(0.6,0.6);
	    //shooting toggle
	    shootToggle = game.add.button(game.world.width-50, 5, 'pause', 
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
	pauseFunct: function() {
		console.log("game.paused = " + !game.paused);
		if(game.paused){
			sprite.inputEnabled = true;
			game.paused = false;
			return;
		}
		sprite.inputEnabled = false;
		game.paused = true;
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
	}
};
function resetFunct(object){
console.log(object.name+" just reset");
object.kill();
}